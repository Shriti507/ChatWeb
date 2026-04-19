import "./loadEnv.mjs";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { requireAuth } from "./middleware/authMiddleware.js";
import { verifyAuthToken } from "./lib/jwt.js";
import {
  createDurableMessage,
  isConversationMember,
  joinConversationForUser, 
} from "./services/messageService.js";

const presenceByConversation = new Map<string, Set<string>>();
const conversationsBySocket = new Map<string, Set<string>>();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api", requireAuth, messageRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});


//SOCKET AUTH MIDDLEWARE
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token || typeof token !== "string") {
      return next(new Error("UNAUTHORIZED"));
    }

    const payload = verifyAuthToken(token);
    const userId = payload.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return next(new Error("UNAUTHORIZED"));
    }

    socket.data.userId = userId;
    next();
  } catch {
    next(new Error("UNAUTHORIZED"));
  }
});


// socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.data.userId as string;

  
  // join conversation 
 
  socket.on(
    "join_conversation",
    async (
      conversationId: string,
      ack?: (response: { ok: boolean; error?: string }) => void
    ) => {
      const convId = String(conversationId ?? "").trim();
      if (!convId) {
        ack?.({ ok: false, error: "INVALID_JOIN_PAYLOAD" });
        return;
      }

      try {
        await joinConversationForUser(convId, userId);
      } catch (err) {
        console.error("Join failed:", err);
        if (err instanceof Error && err.message === "INVALID_JOIN_IDS") {
          ack?.({ ok: false, error: "INVALID_JOIN_PAYLOAD" });
          return;
        }
        if (err instanceof Error && err.message === "CONVERSATION_NOT_FOUND") {
          ack?.({ ok: false, error: "CONVERSATION_NOT_FOUND" });
          return;
        }
        if (err instanceof Error && err.message === "NOT_INVITED") {
          ack?.({ ok: false, error: "NOT_INVITED" });
          return;
        }
        ack?.({ ok: false, error: "JOIN_FAILED" });
        return;
      }

      socket.join(convId);

      const socketConvos =
        conversationsBySocket.get(socket.id) ?? new Set<string>();
      socketConvos.add(convId);
      conversationsBySocket.set(socket.id, socketConvos);

      const online =
        presenceByConversation.get(convId) ?? new Set<string>();
      online.add(userId);
      presenceByConversation.set(convId, online);

      socket.emit("presence_state", {
        conversationId: convId,
        onlineUserIds: Array.from(online),
      });

      socket.to(convId).emit("user_online", {
        conversationId: convId,
        userId,
      });

      ack?.({ ok: true });

      console.log(`Socket ${socket.id} joined conversation ${convId}`);
    }
  );

   
  // leave conversation
  
  socket.on("leave_conversation", (conversationId: string) => {
    const convId = String(conversationId ?? "").trim();
    if (!convId) return;

    socket.leave(convId);

    const socketConvos = conversationsBySocket.get(socket.id);
    socketConvos?.delete(convId);

    const online = presenceByConversation.get(convId);
    if (online) {
      online.delete(userId);
      if (online.size === 0) presenceByConversation.delete(convId);
    }

    socket.to(convId).emit("user_offline", {
      conversationId: convId,
      userId,
    });

    console.log(`Socket ${socket.id} left conversation ${convId}`);
  });

  // typing start
  socket.on(
    "typing_start",
    async (
      payload: { conversationId?: string },
      ack?: (response: { ok: boolean; error?: string }) => void
    ) => {
      const conversationId = payload?.conversationId;

      if (!conversationId) {
        ack?.({ ok: false, error: "INVALID_TYPING_PAYLOAD" });
        return;
      }

      const member = await isConversationMember(
        String(conversationId),
        userId
      );

      if (!member) {
        ack?.({ ok: false, error: "FORBIDDEN_CONVERSATION" });
        return;
      }

      socket.to(String(conversationId)).emit("typing_start", {
        conversationId: String(conversationId),
        userId,
      });

      ack?.({ ok: true });
    }
  );

  // typing stop
  socket.on(
    "typing_stop",
    async (
      payload: { conversationId?: string },
      ack?: (response: { ok: boolean; error?: string }) => void
    ) => {
      const conversationId = payload?.conversationId;

      if (!conversationId) {
        ack?.({ ok: false, error: "INVALID_TYPING_PAYLOAD" });
        return;
      }

      const member = await isConversationMember(
        String(conversationId),
        userId
      );

      if (!member) {
        ack?.({ ok: false, error: "FORBIDDEN_CONVERSATION" });
        return;
      }

      socket.to(String(conversationId)).emit("typing_stop", {
        conversationId: String(conversationId),
        userId,
      });

      ack?.({ ok: true });
    }
  );

  // send message
  socket.on(
    "send_message",
    async (
      data,
      ack?: (
        response:
          | { status: "stored"; messageId: string }
          | { status: "error"; error: string }
      ) => void
    ) => {
      try {
        const conversationId = data?.conversationId as string;
        const text = data?.text as string;
        const clientMessageId = data?.clientMessageId as string;

        if (!conversationId || !text || !clientMessageId) {
          ack?.({ status: "error", error: "INVALID_MESSAGE_PAYLOAD" });
          return;
        }

        const member = await isConversationMember(
          String(conversationId),
          userId
        );

        if (!member) {
          ack?.({ status: "error", error: "FORBIDDEN_CONVERSATION" });
          return;
        }

        const { message } = await createDurableMessage({
          conversationId: String(conversationId),
          userId,
          content: text,
          clientMessageId,
        });

        io.to(String(conversationId)).emit("receive_message", {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          text: message.content,
          clientMessageId: message.clientMessageId,
          createdAt: message.createdAt,
          status: "sent",
        });

        ack?.({ status: "stored", messageId: message.id });
      } catch (err) {
        console.error("Send message error:", err);
        ack?.({ status: "error", error: "PERSISTENCE_FAILED" });
      }
    }
  );

  // disconnect
  socket.on("disconnect", () => {
    const socketConvos = conversationsBySocket.get(socket.id);

    if (socketConvos) {
      for (const conversationId of socketConvos) {
        const online = presenceByConversation.get(String(conversationId));

        if (online) {
          online.delete(userId);
          if (online.size === 0)
            presenceByConversation.delete(String(conversationId));
        }

        socket.to(String(conversationId)).emit("user_offline", {
          conversationId: String(conversationId),
          userId,
        });
      }

      conversationsBySocket.delete(socket.id);
    }

    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("Server running on PORT 3000");
});
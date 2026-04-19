import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { requireAuth } from "./middleware/authMiddleware.js";
import { verifyAuthToken } from "./lib/jwt.js";
import { createDurableMessage, isConversationMember, requireConversationMember, } from "./services/messageService.js";
const presenceByConversation = new Map();
const conversationsBySocket = new Map();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api", requireAuth, messageRoutes);
app.get("/", (req, res) => {
    res.send("Hello World!");
});
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
        return next();
    }
    catch {
        return next(new Error("UNAUTHORIZED"));
    }
});
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    const userId = socket.data.userId;
    socket.on("join_conversation", async (conversationId, ack) => {
        if (!conversationId) {
            ack?.({ ok: false, error: "INVALID_JOIN_PAYLOAD" });
            return;
        }
        try {
            await requireConversationMember(String(conversationId), userId);
        }
        catch {
            ack?.({ ok: false, error: "FORBIDDEN_CONVERSATION" });
            return;
        }
        socket.join(String(conversationId));
        const socketConvos = conversationsBySocket.get(socket.id) ?? new Set();
        socketConvos.add(String(conversationId));
        conversationsBySocket.set(socket.id, socketConvos);
        const online = presenceByConversation.get(String(conversationId)) ?? new Set();
        online.add(userId);
        presenceByConversation.set(String(conversationId), online);
        // Send current presence state to joiner, and notify others.
        socket.emit("presence_state", { conversationId: String(conversationId), onlineUserIds: Array.from(online) });
        socket.to(String(conversationId)).emit("user_online", { conversationId: String(conversationId), userId });
        ack?.({ ok: true });
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });
    socket.on("leave_conversation", (conversationId) => {
        if (!conversationId)
            return;
        socket.leave(String(conversationId));
        const socketConvos = conversationsBySocket.get(socket.id);
        socketConvos?.delete(String(conversationId));
        const online = presenceByConversation.get(String(conversationId));
        if (online) {
            online.delete(userId);
            if (online.size === 0)
                presenceByConversation.delete(String(conversationId));
        }
        socket.to(String(conversationId)).emit("user_offline", { conversationId: String(conversationId), userId });
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });
    socket.on("typing_start", async (payload, ack) => {
        const conversationId = payload?.conversationId;
        if (!conversationId) {
            ack?.({ ok: false, error: "INVALID_TYPING_PAYLOAD" });
            return;
        }
        const member = await isConversationMember(String(conversationId), userId);
        if (!member) {
            ack?.({ ok: false, error: "FORBIDDEN_CONVERSATION" });
            return;
        }
        socket.to(String(conversationId)).emit("typing_start", { conversationId: String(conversationId), userId });
        ack?.({ ok: true });
    });
    socket.on("typing_stop", async (payload, ack) => {
        const conversationId = payload?.conversationId;
        if (!conversationId) {
            ack?.({ ok: false, error: "INVALID_TYPING_PAYLOAD" });
            return;
        }
        const member = await isConversationMember(String(conversationId), userId);
        if (!member) {
            ack?.({ ok: false, error: "FORBIDDEN_CONVERSATION" });
            return;
        }
        socket.to(String(conversationId)).emit("typing_stop", { conversationId: String(conversationId), userId });
        ack?.({ ok: true });
    });
    socket.on("send_message", async (data, ack) => {
        try {
            const userId = socket.data.userId;
            const conversationId = data?.conversationId;
            const text = data?.text;
            const clientMessageId = data?.clientMessageId;
            if (!userId || !conversationId || !text || !clientMessageId) {
                ack?.({ status: "error", error: "INVALID_MESSAGE_PAYLOAD" });
                return;
            }
            const member = await isConversationMember(String(conversationId), userId);
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
        }
        catch {
            ack?.({ status: "error", error: "PERSISTENCE_FAILED" });
        }
    });
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
                socket.to(String(conversationId)).emit("user_offline", { conversationId: String(conversationId), userId });
            }
            conversationsBySocket.delete(socket.id);
        }
        console.log("User disconnected:", socket.id);
    });
});
httpServer.listen(3000, () => {
    console.log(`Server has started on PORT 3000`);
});
//# sourceMappingURL=index.js.map
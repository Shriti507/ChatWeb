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
import { createDurableMessage, isConversationMember, joinConversationForUser, } from "./services/messageService.js";
const presenceByConversation = new Map();
const conversationsBySocket = new Map();
const app = express();
const httpServer = createServer(app);
const CLIENT_URL = process.env.CLIENT_URL;
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            process.env.CLIENT_URL,
            "http://localhost:5173",
            "http://localhost:3000"
        ];
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
};
app.use(cors(corsOptions));
// socket.io
const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
app.use(express.json());
// Routes
app.use("/auth", authRoutes);
app.use("/api", requireAuth, messageRoutes);
// Health check
app.get("/", (req, res) => {
    res.send("Server is running!");
});
// Socket auth
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token)
            return next(new Error("UNAUTHORIZED"));
        const payload = verifyAuthToken(token);
        socket.data.userId = payload.userId;
        next();
    }
    catch {
        next(new Error("UNAUTHORIZED"));
    }
});
// Socket logic
io.on("connection", (socket) => {
    const userId = socket.data.userId;
    // Join conversation room
    socket.on("join_conversation", ({ conversationId }, ack) => {
        socket.join(conversationId);
        if (!presenceByConversation.has(conversationId)) {
            presenceByConversation.set(conversationId, new Set());
        }
        presenceByConversation.get(conversationId).add(userId);
        socket.to(conversationId).emit("user_online", { conversationId, userId });
        ack?.({ ok: true });
    });
    // SEND MESSAGE
    socket.on("send_message", async (payload, ack) => {
        try {
            const { conversationId, text, clientMessageId } = payload;
            const { message, duplicate } = await createDurableMessage({
                conversationId,
                userId,
                content: text,
                clientMessageId,
            });
            if (!duplicate) {
                socket.to(conversationId).emit("receive_message", {
                    id: message.id,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    text: message.content,
                    clientMessageId: message.clientMessageId,
                    createdAt: message.createdAt,
                });
            }
            // VERY IMPORTANT → for IndexedDB sync
            ack?.({ status: "stored", messageId: message.id, duplicate });
        }
        catch (err) {
            console.error(err);
            ack?.({ status: "error", error: "MESSAGE_FAILED" });
        }
    });
    // TYPING START
    socket.on("typing_start", ({ conversationId }) => {
        socket.to(conversationId).emit("typing_start", { conversationId, userId });
    });
    // TYPING STOP
    socket.on("typing_stop", ({ conversationId }) => {
        socket.to(conversationId).emit("typing_stop", { conversationId, userId });
    });
    // LEAVE ROOM
    socket.on("leave_conversation", (conversationId) => {
        socket.leave(conversationId);
        const users = presenceByConversation.get(conversationId);
        if (users) {
            users.delete(userId);
            if (users.size === 0) {
                presenceByConversation.delete(conversationId);
            }
            else {
                socket.to(conversationId).emit("user_offline", { conversationId, userId });
            }
        }
    });
    // DISCONNECT
    socket.on("disconnect", () => {
        for (const [conversationId, users] of presenceByConversation.entries()) {
            if (users.has(userId)) {
                users.delete(userId);
                if (users.size === 0) {
                    presenceByConversation.delete(conversationId);
                }
                else {
                    io.to(conversationId).emit("user_offline", { conversationId, userId });
                }
            }
        }
    });
});
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
//# sourceMappingURL=index.js.map
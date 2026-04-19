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
// 1. Fixed CORS - Explicit origins are required for credentials mode
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
app.use(express.json());
// 2. Route Mounting
app.use("/auth", authRoutes); // e.g. /auth/login
app.use("/api", requireAuth, messageRoutes); // e.g. /api/users/me
// Root check
app.get("/", (req, res) => {
    res.send("Server is running!");
});
// Socket Auth Middleware
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
// Socket Logic
io.on("connection", (socket) => {
    const userId = socket.data.userId;
    socket.on("join_conversation", async (conversationId, ack) => {
        try {
            await joinConversationForUser(conversationId, userId);
            socket.join(conversationId);
            const online = presenceByConversation.get(conversationId) ?? new Set();
            online.add(userId);
            presenceByConversation.set(conversationId, online);
            socket.to(conversationId).emit("user_online", { conversationId, userId });
            ack?.({ ok: true });
        }
        catch (err) {
            ack?.({ ok: false, error: "JOIN_FAILED" });
        }
    });
    socket.on("disconnect", () => {
        // Handle presence cleanup logic here
    });
});
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
//# sourceMappingURL=index.js.map
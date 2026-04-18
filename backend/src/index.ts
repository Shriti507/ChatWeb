import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

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

app.get('/', (req, res) => {
    res.send('Hello World!');
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_room", (roomId: string) => {
        if (!roomId) return;
        socket.join(String(roomId));
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("leave_room", (roomId: string) => {
        if (!roomId) return;
        socket.leave(String(roomId));
        console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on("send_message", (data, ack?: (response: { ok: boolean; status?: string; error?: string }) => void) => {
        console.log("Message received:", data);
        const roomId = data?.conversationId;
        if (roomId) {
            // Backward compatible: room-scoped by conversation when available.
            io.to(String(roomId)).emit("receive_message", data);
            ack?.({ ok: true, status: "sent" });
            return;
        }

        // Legacy fallback for payloads without conversationId
        io.emit("receive_message", data);
        ack?.({ ok: true, status: "sent" });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

httpServer.listen(3000, () => {
    console.log(`Server has started on PORT 3000`);
});
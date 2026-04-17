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

    socket.on("send_message", (data) => {
        console.log("Message received:", data);
        // Broadcast the message to all clients including the sender
        io.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

httpServer.listen(3000, () => {
    console.log(`Server has started on PORT 3000`);
});
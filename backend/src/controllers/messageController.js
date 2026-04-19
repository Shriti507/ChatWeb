import {} from "express";
import { createDurableMessage, getMessagesByConversation, } from "../services/messageService.js";
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, text, clientMessageId } = req.body;
        const userId = req.user?.id;
        if (!conversationId || !userId || !text || !clientMessageId) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const { message, duplicate } = await createDurableMessage({
            conversationId,
            userId,
            content: text,
            clientMessageId,
        });
        return res.json({
            status: "stored",
            duplicate,
            message: {
                id: message.id,
                conversationId: message.conversationId,
                senderId: message.senderId,
                text: message.content,
                clientMessageId: message.clientMessageId,
                createdAt: message.createdAt,
            },
        });
    }
    catch (error) {
        if (error instanceof Error && error.message === "FORBIDDEN_CONVERSATION") {
            return res.status(403).json({ error: "User is not a conversation member" });
        }
        return res.status(500).json({ error: "Failed to persist message" });
    }
};
export const getMessages = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const userId = req.user?.id;
        const after = req.query.after;
        if (!conversationId || !userId) {
            return res.status(400).json({ error: "conversationId and userId are required" });
        }
        const messages = await getMessagesByConversation({
            conversationId,
            userId,
            ...(after ? { after } : {}),
        });
        return res.json(messages.map((message) => ({
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            text: message.content,
            clientMessageId: message.clientMessageId,
            createdAt: message.createdAt,
        })));
    }
    catch (error) {
        if (error instanceof Error && error.message === "FORBIDDEN_CONVERSATION") {
            return res.status(403).json({ error: "User is not a conversation member" });
        }
        return res.status(500).json({ error: "Failed to read messages" });
    }
};
export const joinConversation = async (_req, res) => {
    return res.status(403).json({ error: "JOIN_NOT_ALLOWED" });
};
//# sourceMappingURL=messageController.js.map
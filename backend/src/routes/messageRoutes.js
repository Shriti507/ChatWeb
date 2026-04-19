import { Router } from "express";
import { getMessages, joinConversation, sendMessage } from "../controllers/messageController.js";
const router = Router();
router.post("/messages", sendMessage);
router.get("/messages/:conversationId", getMessages);
router.post("/conversations/:conversationId/join", joinConversation);
export default router;
//# sourceMappingURL=messageRoutes.js.map
import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";

const router = Router();

router.post("/messages", sendMessage);
router.get("/messages/:chatId", getMessages);

export default router;
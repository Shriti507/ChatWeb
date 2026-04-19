import { Router } from "express";
import { getOrCreateDMConversation } from "../services/messageService.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import type { Request, Response } from "express";

const router = Router();

// Create or get direct conversation with another user
router.post("/direct", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.body as { userId?: string };
    const currentUserId = (req as any).user.id;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "INVALID_USER_ID" });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ error: "CANNOT_DM_SELF" });
    }

    const conversation = await getOrCreateDMConversation(currentUserId, userId.trim());
    return res.json(conversation);
  } catch (error: any) {
    console.error("Direct conversation error:", error);
    
    if (error.message === "CANNOT_DM_SELF") {
      return res.status(400).json({ error: "CANNOT_DM_SELF" });
    }
    
    return res.status(500).json({ error: "DIRECT_CONVERSATION_FAILED" });
  }
});

export default router;

import { Router } from "express";
import {
  createConversation,
  getMessages,
  inviteToConversation,
  joinConversation,
  listConversationInvites,
  patchConversationPrivacy,
  sendMessage,
  getAllUsersHandler,
  createDMConversationHandler,
  searchUsers,
} from "../controllers/messageController.js";
import { Prisma } from "@prisma/client";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();


// Conversation Routes


router.post("/conversations", createConversation);

router.post(
  "/conversations/:conversationId/join",
  requireAuth,
  joinConversation 
);

router.post(
  "/conversations/:conversationId/invite",
  requireAuth,
  inviteToConversation
);

router.patch(
  "/conversations/:conversationId/privacy",
  requireAuth,
  patchConversationPrivacy
);

router.get(
  "/conversations/:conversationId/invites",
  requireAuth,
  listConversationInvites
);



// Message Routes


router.post("/messages", requireAuth, sendMessage);

router.get(
  "/messages/:conversationId",
  requireAuth,
  getMessages
);



// User Discovery 

// Get all users (default view)
router.get("/users", requireAuth, getAllUsersHandler);

// Search users by email
router.get("/users/search", requireAuth, searchUsers);

// Create or get DM conversation
router.post("/conversation", requireAuth, createDMConversationHandler);



// Current User


router.get("/users/me", requireAuth, async (req, res) => {
  const userId = req.user?.id; 

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return res.status(404).json({ error: "USER_NOT_FOUND" });
  }

  res.json(user);
});


export default router;
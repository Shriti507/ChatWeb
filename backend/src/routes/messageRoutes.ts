import { Router } from "express";
import type { Request, Response } from "express";
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
  createGroupConversationHandler,
  getConversationMembersHandler,
  listConversationsHandler,
} from "../controllers/messageController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/authMiddleware.js";

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

// Create group conversation
router.post(
  "/conversations/group",
  requireAuth,
  createGroupConversationHandler
);

// Get conversation members
router.get(
  "/conversations/:conversationId/members",
  requireAuth,
  getConversationMembersHandler
);

// List all user conversations
router.get("/conversations", requireAuth, listConversationsHandler);



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
router.get("/users/me", requireAuth, async (req: AuthedRequest, res: Response) => {
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
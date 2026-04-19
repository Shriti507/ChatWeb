import type { AuthedRequest } from "../middleware/authMiddleware.js";
import type { Request, Response } from "express";
import {
  searchUsersByEmail,
  getAllUsers,
  getOrCreateDMConversation,
} from "../services/messageService.js";

export const searchUsers = async (req: AuthedRequest, res: Response) => {
  const userId = req.user?.id;
  const email = (req.query.email as string)?.trim() || "";

  if (!userId) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  try {
    const users = await searchUsersByEmail(email, userId);
    res.json(users);
  } catch (err) {
    console.error("Search users error:", err);
    res.status(500).json({ error: "SEARCH_FAILED" });
  }
};

export const getAllUsersHandler = async (req: AuthedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  try {
    const users = await getAllUsers(userId);
    res.json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ error: "FETCH_USERS_FAILED" });
  }
};

export const createDMConversationHandler = async (
  req: AuthedRequest,
  res: Response
) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  const { targetUserId } = req.body;
  if (!targetUserId) {
    return res.status(400).json({ error: "MISSING_TARGET_USER_ID" });
  }

  try {
    const conversation = await getOrCreateDMConversation(userId, targetUserId);
    res.json(conversation);
  } catch (err) {
    console.error("Create DM conversation error:", err);
    res.status(400).json({ error: err.message || "DM_CONVERSATION_FAILED" });
  }
};

import type { AuthedRequest } from "../middleware/authMiddleware.js";
import type { Request, Response } from "express";
import { MessageService, messageService } from "../services/messageService.js";

export class MessageController {
  private service: MessageService;

  constructor(service: MessageService) {
    this.service = service;
  }

  public searchUsers = async (req: AuthedRequest, res: Response) => {
    const userId = req.user?.id;
    const username = (req.query.username as string)?.trim() || "";

    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    try {
      const users = await this.service.searchUsersByUsername(username, userId);
      res.json(users);
    } catch (err) {
      console.error("[DEBUG] Search users error:", err);
      res.status(500).json({ error: "SEARCH_FAILED" });
    }
  };

  public getAllUsersHandler = async (req: AuthedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    try {
      const users = await this.service.getAllUsers(userId);
      res.json(users);
    } catch (err) {
      console.error("Get all users error:", err);
      res.status(500).json({ error: "FETCH_USERS_FAILED" });
    }
  };

  public createDMConversationHandler = async (
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
      const conversation = await this.service.getOrCreateDMConversation(userId, targetUserId);
      res.json(conversation);
    } catch (err) {
      console.error("[DEBUG] Create DM conversation error:", err);
      res.status(400).json({ error: (err as Error).message || "DM_CONVERSATION_FAILED" });
    }
  };

  public createGroupConversationHandler = async (
    req: AuthedRequest,
    res: Response
  ) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const { name, userIds } = req.body;
    if (!name || !userIds || !Array.isArray(userIds) || userIds.length < 1) {
      return res.status(400).json({ error: "INVALID_GROUP_PAYLOAD" });
    }

    try {
      const conversation = await this.service.createGroupConversation({
        creatorId: userId,
        name,
        userIds,
      });
      res.status(201).json(conversation);
    } catch (err) {
      console.error("Create group conversation error:", err);
      const errorMessage = (err as Error).message;
      if (errorMessage === "MINIMUM_TWO_MEMBERS_REQUIRED") {
        return res.status(400).json({ error: "MINIMUM_TWO_MEMBERS_REQUIRED" });
      }
      if (errorMessage === "SOME_USERS_NOT_FOUND") {
        return res.status(400).json({ error: "SOME_USERS_NOT_FOUND" });
      }
      res.status(500).json({ error: errorMessage || "GROUP_CONVERSATION_FAILED" });
    }
  };

  public getConversationMembersHandler = async (
    req: AuthedRequest,
    res: Response
  ) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const conversationId = req.params.conversationId as string;
    if (!conversationId) {
      return res.status(400).json({ error: "MISSING_CONVERSATION_ID" });
    }

    try {
      const members = await this.service.getConversationMembers(conversationId, userId);
      res.json(members);
    } catch (err) {
      console.error("Get conversation members error:", err);
      const errorMessage = (err as Error).message;
      if (errorMessage === "FORBIDDEN_NOT_MEMBER") {
        return res.status(403).json({ error: "FORBIDDEN_NOT_MEMBER" });
      }
      res.status(500).json({ error: errorMessage || "GET_MEMBERS_FAILED" });
    }
  };

  public listConversationsHandler = async (
    req: AuthedRequest,
    res: Response
  ) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    try {
      const conversations = await this.service.getUserConversations(userId);
      res.json(conversations);
    } catch (err) {
      console.error("List conversations error:", err);
      res.status(500).json({ error: "LIST_CONVERSATIONS_FAILED" });
    }
  };

  public createConversation = async (req: AuthedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const { conversationId, isPrivate } = req.body;
    if (!conversationId) {
      return res.status(400).json({ error: "MISSING_CONVERSATION_ID" });
    }

    try {
      const conversation = await this.service.createConversationForUser({
        userId,
        conversationId,
        isPrivate: !!isPrivate,
      });
      res.status(201).json(conversation);
    } catch (err) {
      console.error("Create conversation error:", err);
      const errorMessage = (err as Error).message;
      if (errorMessage === "CONVERSATION_ALREADY_EXISTS") {
        return res.status(409).json({ error: "CONVERSATION_ALREADY_EXISTS" });
      }
      res.status(500).json({ error: errorMessage || "CREATE_CONVERSATION_FAILED" });
    }
  };

  public sendMessage = async (req: AuthedRequest, res: Response) => {
    try {
      const { conversationId, text, clientMessageId } = req.body;
      const userId = req.user?.id;

      if (!conversationId || !userId || !text || !clientMessageId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { message, duplicate } = await this.service.createDurableMessage({
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
    } catch (error) {
      if ((error as Error).message === "FORBIDDEN_CONVERSATION") {
        return res.status(403).json({ error: "User is not a conversation member" });
      }
      return res.status(500).json({ error: "Failed to persist message" });
    }
  };

  public getMessages = async (req: AuthedRequest, res: Response) => {
    try {
      const conversationId = req.params.conversationId as string;
      const userId = req.user?.id;
      const after = req.query.after as string | undefined;

      if (!conversationId || !userId) {
        return res.status(400).json({ error: "conversationId and userId are required" });
      }

      const messages = await this.service.getMessagesByConversation({
        conversationId,
        userId,
        ...(after ? { after } : {}),
      });

      return res.json(
        messages.map((message: any) => ({
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          text: message.content,
          clientMessageId: message.clientMessageId,
          createdAt: message.createdAt,
        }))
      );
    } catch (error) {
      if ((error as Error).message === "FORBIDDEN_CONVERSATION") {
        return res.status(403).json({ error: "User is not a conversation member" });
      }
      return res.status(500).json({ error: "Failed to read messages" });
    }
  };

  public joinConversation = async (req: AuthedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const conversationId = req.params.conversationId as string;
    if (!conversationId) {
      return res.status(400).json({ error: "MISSING_CONVERSATION_ID" });
    }

    try {
      await this.service.joinConversationForUser(conversationId, userId);
      res.json({ success: true });
    } catch (err) {
      console.error("Join conversation error:", err);
      const errorMessage = (err as Error).message;
      if (errorMessage === "CONVERSATION_NOT_FOUND") {
        return res.status(404).json({ error: "CONVERSATION_NOT_FOUND" });
      }
      if (errorMessage === "NOT_INVITED") {
        return res.status(403).json({ error: "NOT_INVITED" });
      }
      res.status(500).json({ error: errorMessage || "JOIN_FAILED" });
    }
  };

  public inviteToConversation = async (req: AuthedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const conversationId = req.params.conversationId as string;
    const { targetUserId } = req.body;

    if (!conversationId || !targetUserId) {
      return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    try {
      const invite = await this.service.inviteUserToConversation({
        conversationId,
        inviterUserId: userId,
        targetUserId,
      });
      res.json(invite);
    } catch (err) {
      console.error("Invite error:", err);
      const errorMessage = (err as Error).message;
      if (errorMessage === "FORBIDDEN_NOT_CREATOR") {
        return res.status(403).json({ error: "FORBIDDEN_NOT_CREATOR" });
      }
      res.status(500).json({ error: errorMessage || "INVITE_FAILED" });
    }
  };

  public patchConversationPrivacy = async (req: AuthedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const conversationId = req.params.conversationId as string;
    const { isPrivate } = req.body;

    if (!conversationId || typeof isPrivate !== "boolean") {
      return res.status(400).json({ error: "INVALID_PAYLOAD" });
    }

    try {
      const conversation = await this.service.setConversationPrivacyForCreator({
        conversationId,
        userId,
        isPrivate,
      });
      res.json(conversation);
    } catch (err) {
      console.error("Privacy update error:", err);
      const errorMessage = (err as Error).message;
      if (errorMessage === "FORBIDDEN_NOT_CREATOR") {
        return res.status(403).json({ error: "FORBIDDEN_NOT_CREATOR" });
      }
      res.status(500).json({ error: errorMessage || "PRIVACY_UPDATE_FAILED" });
    }
  };

  public listConversationInvites = async (req: AuthedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const conversationId = req.params.conversationId as string;
    if (!conversationId) {
      return res.status(400).json({ error: "MISSING_CONVERSATION_ID" });
    }

    try {
      const invites = await this.service.listConversationInvitesForCreator(conversationId, userId);
      res.json(invites);
    } catch (err) {
      console.error("List invites error:", err);
      const errorMessage = (err as Error).message;
      if (errorMessage === "FORBIDDEN_NOT_CREATOR") {
        return res.status(403).json({ error: "FORBIDDEN_NOT_CREATOR" });
      }
      res.status(500).json({ error: errorMessage || "LIST_INVITES_FAILED" });
    }
  };
}

// Export singleton instance and bound methods for legacy route compatibility
export const messageController = new MessageController(messageService);

export const searchUsers = messageController.searchUsers;
export const getAllUsersHandler = messageController.getAllUsersHandler;
export const createDMConversationHandler = messageController.createDMConversationHandler;
export const createGroupConversationHandler = messageController.createGroupConversationHandler;
export const getConversationMembersHandler = messageController.getConversationMembersHandler;
export const listConversationsHandler = messageController.listConversationsHandler;
export const createConversation = messageController.createConversation;
export const sendMessage = messageController.sendMessage;
export const getMessages = messageController.getMessages;
export const joinConversation = messageController.joinConversation;
export const inviteToConversation = messageController.inviteToConversation;
export const patchConversationPrivacy = messageController.patchConversationPrivacy;
export const listConversationInvites = messageController.listConversationInvites;

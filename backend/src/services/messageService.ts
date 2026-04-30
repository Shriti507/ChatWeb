import { PrismaClient, MessageDeliveryStatus } from "@prisma/client";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";

export abstract class BaseService {
  protected db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }
}

export class MessageService extends BaseService {
  constructor(db: PrismaClient = prisma) {
    super(db);
  }

  public async createConversationForUser({
    userId,
    conversationId,
    isPrivate,
  }: {
    userId: string;
    conversationId: string;
    isPrivate: boolean;
  }) {
    const uid = userId.trim();
    const id = conversationId.trim();
    if (!uid || !id) {
      throw new Error("INVALID_CONVERSATION_PAYLOAD");
    }

    const exists = await this.db.conversation.findUnique({
      where: { id },
      select: { id: true },
    });
    if (exists) {
      throw new Error("CONVERSATION_ALREADY_EXISTS");
    }

    return this.db.conversation.create({
      data: {
        id,
        createdBy: uid,
        isPrivate,
        members: {
          create: { userId: uid },
        },
      },
    });
  }

  public async joinConversationForUser(conversationId: string, userId: string) {
    const convId = conversationId.trim();
    const uid = userId.trim();

    if (!convId || !uid) {
      throw new Error("INVALID_JOIN_IDS");
    }

    const conv = await this.db.conversation.findUnique({
      where: { id: convId },
      select: { id: true, createdBy: true, isPrivate: true },
    });

    if (!conv) {
      throw new Error("CONVERSATION_NOT_FOUND");
    }

    if (conv.isPrivate) {
      const isCreator = conv.createdBy === uid;
      if (!isCreator) {
        const invite = await this.db.conversationInvite.findUnique({
          where: {
            conversationId_userId: { conversationId: convId, userId: uid },
          },
          select: { id: true },
        });
        if (!invite) {
          throw new Error("NOT_INVITED");
        }
      }
    }

    return this.db.conversationMember.upsert({
      where: {
        conversationId_userId: { conversationId: convId, userId: uid },
      },
      update: {},
      create: {
        conversationId: convId,
        userId: uid,
      },
    });
  }

  public async inviteUserToConversation({
    conversationId,
    inviterUserId,
    targetUserId,
  }: {
    conversationId: string;
    inviterUserId: string;
    targetUserId: string;
  }) {
    const convId = conversationId.trim();
    const inviter = inviterUserId.trim();
    const target = targetUserId.trim();
    if (!convId || !inviter || !target) {
      throw new Error("INVALID_INVITE_PAYLOAD");
    }
    if (inviter === target) {
      throw new Error("INVALID_INVITE_SELF");
    }

    const conv = await this.db.conversation.findUnique({
      where: { id: convId },
      select: { createdBy: true },
    });
    if (!conv) {
      throw new Error("CONVERSATION_NOT_FOUND");
    }
    if (conv.createdBy !== inviter) {
      throw new Error("FORBIDDEN_NOT_CREATOR");
    }

    const targetUser = await this.db.user.findUnique({
      where: { id: target },
      select: { id: true },
    });
    if (!targetUser) {
      throw new Error("INVITE_TARGET_NOT_FOUND");
    }

    return this.db.conversationInvite.upsert({
      where: {
        conversationId_userId: { conversationId: convId, userId: target },
      },
      update: { invitedBy: inviter },
      create: {
        conversationId: convId,
        userId: target,
        invitedBy: inviter,
      },
    });
  }

  public async setConversationPrivacyForCreator({
    conversationId,
    userId,
    isPrivate,
  }: {
    conversationId: string;
    userId: string;
    isPrivate: boolean;
  }) {
    const convId = conversationId.trim();
    const uid = userId.trim();

    const conv = await this.db.conversation.findUnique({
      where: { id: convId },
      select: { createdBy: true },
    });
    if (!conv) {
      throw new Error("CONVERSATION_NOT_FOUND");
    }
    if (conv.createdBy !== uid) {
      throw new Error("FORBIDDEN_NOT_CREATOR");
    }

    return this.db.conversation.update({
      where: { id: convId },
      data: { isPrivate },
    });
  }

  public async listConversationInvitesForCreator(
    conversationId: string,
    userId: string
  ) {
    const convId = conversationId.trim();
    const uid = userId.trim();

    const conv = await this.db.conversation.findUnique({
      where: { id: convId },
      select: { createdBy: true },
    });
    if (!conv) {
      throw new Error("CONVERSATION_NOT_FOUND");
    }
    if (conv.createdBy !== uid) {
      throw new Error("FORBIDDEN_NOT_CREATOR");
    }

    return this.db.conversationInvite.findMany({
      where: { conversationId: convId },
      select: {
        id: true,
        userId: true,
        invitedBy: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  public async requireConversationMember(
    conversationId: string,
    userId: string
  ) {
    const member = await this.db.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      select: { id: true },
    });
    if (!member) {
      throw new Error("FORBIDDEN_CONVERSATION");
    }
    return member;
  }

  public async isConversationMember(
    conversationId: string,
    userId: string
  ) {
    const membership = await this.db.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      select: { id: true },
    });
    return Boolean(membership);
  }

  public async createDurableMessage({
    conversationId,
    userId,
    content,
    clientMessageId,
  }: {
    conversationId: string;
    userId: string;
    content: string;
    clientMessageId: string;
  }) {
    const member = await this.isConversationMember(conversationId, userId);
    if (!member) {
      throw new Error("FORBIDDEN_CONVERSATION");
    }

    const duplicate = await this.db.message.findUnique({
      where: {
        conversationId_senderId_clientMessageId: {
          conversationId,
          senderId: userId,
          clientMessageId,
        },
      },
    });

    if (duplicate) {
      return { message: duplicate, duplicate: true };
    }

    const members = await this.db.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true },
    });

    const message = await this.db.message.create({
      data: {
        conversationId,
        senderId: userId,
        clientMessageId,
        content,
        deliveries: {
          create: members.map((m) => ({
            userId: m.userId,
            status:
              m.userId === userId
                ? MessageDeliveryStatus.DELIVERED
                : MessageDeliveryStatus.SENT,
          })),
        },
      },
    });

    return { message, duplicate: false };
  }

  public async searchUsersByUsername(
    usernameQuery: string,
    currentUserId: string
  ) {
    if (!usernameQuery || usernameQuery.length < 2) {
      return [];
    }

    return this.db.user.findMany({
      where: {
        name: {
          contains: usernameQuery,
          mode: "insensitive",
        },
        NOT: {
          id: currentUserId,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 10,
    });
  }

  public async getMessagesByConversation({
    conversationId,
    userId,
    after,
  }: {
    conversationId: string;
    userId: string;
    after?: string;
  }) {
    const member = await this.isConversationMember(conversationId, userId);
    if (!member) {
      throw new Error("FORBIDDEN_CONVERSATION");
    }

    const createdAt = after ? new Date(after) : undefined;

    return this.db.message.findMany({
      where: {
        conversationId,
        ...(createdAt && !Number.isNaN(createdAt.getTime())
          ? { createdAt: { gt: createdAt } }
          : {}),
      },
      orderBy: { createdAt: "asc" },
    });
  }

  public async getAllUsers(currentUserId: string) {
    const uid = currentUserId.trim();
    return this.db.user.findMany({
      where: {
        NOT: { id: uid },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });
  }

  public async getOrCreateDMConversation(
    meId: string,
    targetId: string
  ) {
    if (meId === targetId) throw new Error("CANNOT_DM_SELF");
    const me = meId.trim();
    const target = targetId.trim();

    // Find existing DM: both users are members
    const existing = await this.db.conversation.findFirst({
      where: {
        isPrivate: true,
        AND: [
          { members: { some: { userId: me } } },
          { members: { some: { userId: target } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    // Verify exactly 2 members (1:1)
    if (
      existing &&
      existing.members.length === 2 &&
      existing.members.every((m) => [me, target].includes(m.userId))
    ) {
      return {
        id: existing.id,
        participants: existing.members.map((m) => m.user),
      };
    }

    // Create new DM
    const convId = crypto.randomUUID();
    const created = await this.db.conversation.create({
      data: {
        id: convId,
        createdBy: me,
        isPrivate: true,
        members: {
          create: [{ userId: me }, { userId: target }],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return {
      id: created.id,
      participants: created.members.map((m) => m.user),
    };
  }

  public async createGroupConversation({
    creatorId,
    name,
    userIds,
  }: {
    creatorId: string;
    name: string;
    userIds: string[];
  }) {
    const creator = creatorId.trim();
    const groupName = name.trim();
    const uniqueUserIds = [...new Set(userIds.map((id) => id.trim()))].filter(
      (id) => id && id !== creator
    );

    if (!creator) {
      throw new Error("INVALID_CREATOR_ID");
    }
    if (!groupName || groupName.length < 1) {
      throw new Error("INVALID_GROUP_NAME");
    }
    if (uniqueUserIds.length < 1) {
      throw new Error("MINIMUM_TWO_MEMBERS_REQUIRED");
    }

    // Verify all users exist
    const users = await this.db.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: { id: true },
    });

    if (users.length !== uniqueUserIds.length) {
      throw new Error("SOME_USERS_NOT_FOUND");
    }

    const conversationId = crypto.randomUUID();
    const allMemberIds = [creator, ...uniqueUserIds];

    const conversation = await this.db.conversation.create({
      data: {
        id: conversationId,
        createdBy: creator,
        isPrivate: false,
        isGroup: true,
        name: groupName,
        members: {
          create: allMemberIds.map((userId) => ({ userId })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return {
      id: conversation.id,
      name: conversation.name,
      isGroup: conversation.isGroup,
      participants: conversation.members.map((m) => m.user),
    };
  }

  public async getConversationMembers(
    conversationId: string,
    userId: string
  ) {
    const convId = conversationId.trim();
    const uid = userId.trim();

    if (!convId || !uid) {
      throw new Error("INVALID_IDS");
    }

    // Verify user is a member
    const membership = await this.db.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId: convId, userId: uid },
      },
      select: { id: true },
    });

    if (!membership) {
      throw new Error("FORBIDDEN_NOT_MEMBER");
    }

    const members = await this.db.conversationMember.findMany({
      where: { conversationId: convId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      joinedAt: m.createdAt,
    }));
  }

  public async getUserConversations(userId: string) {
    const uid = userId.trim();

    const memberships = await this.db.conversationMember.findMany({
      where: { userId: uid },
      include: {
        conversation: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                content: true,
                createdAt: true,
                sender: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: "desc" } },
    });

    return memberships.map((m) => {
      const conv = m.conversation;
      const otherMembers = conv.members.filter((mem) => mem.userId !== uid);
      const isGroup = conv.members.length > 2;
      const displayName = isGroup
        ? conv.name || "Unnamed Group"
        : otherMembers[0]?.user.name || "Unknown";

      return {
        id: conv.id,
        name: displayName,
        isGroup,
        participants: conv.members.map((mem) => mem.user),
        lastMessage: conv.messages[0]?.content || null,
        updatedAt: conv.updatedAt,
      };
    });
  }
}

// Instantiate singleton service for legacy route bindings
export const messageService = new MessageService();

// Export bound functions to maintain exact backward compatibility with router imports
export const searchUsersByUsername = messageService.searchUsersByUsername.bind(messageService);
export const getAllUsers = messageService.getAllUsers.bind(messageService);
export const getOrCreateDMConversation = messageService.getOrCreateDMConversation.bind(messageService);
export const createGroupConversation = messageService.createGroupConversation.bind(messageService);
export const getConversationMembers = messageService.getConversationMembers.bind(messageService);
export const getUserConversations = messageService.getUserConversations.bind(messageService);
export const createConversationForUser = messageService.createConversationForUser.bind(messageService);
export const getMessagesByConversation = messageService.getMessagesByConversation.bind(messageService);
export const createDurableMessage = messageService.createDurableMessage.bind(messageService);
export const joinConversationForUser = messageService.joinConversationForUser.bind(messageService);
export const inviteUserToConversation = messageService.inviteUserToConversation.bind(messageService);
export const setConversationPrivacyForCreator = messageService.setConversationPrivacyForCreator.bind(messageService);
export const listConversationInvitesForCreator = messageService.listConversationInvitesForCreator.bind(messageService);
export const isConversationMember = messageService.isConversationMember.bind(messageService);
export const requireConversationMember = messageService.requireConversationMember.bind(messageService);

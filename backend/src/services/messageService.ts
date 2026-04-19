import { MessageDeliveryStatus } from "@prisma/client";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";

/**
 * Create a new conversation. Caller becomes creator and first member.
 */
export const createConversationForUser = async ({
  userId,
  conversationId,
  isPrivate,
}: {
  userId: string;
  conversationId: string;
  isPrivate: boolean;
}) => {
  const uid = userId.trim();
  const id = conversationId.trim();
  if (!uid || !id) {
    throw new Error("INVALID_CONVERSATION_PAYLOAD");
  }

  const exists = await prisma.conversation.findUnique({
    where: { id },
    select: { id: true },
  });
  if (exists) {
    throw new Error("CONVERSATION_ALREADY_EXISTS");
  }

  return prisma.conversation.create({
    data: {
      id,
      createdBy: uid,
      isPrivate,
      members: {
        create: { userId: uid },
      },
    },
  });
};

/**
 * Join an existing conversation only (no implicit create).
 * Public: any authenticated user may become a member.
 * Private: creator or invitee (ConversationInvite) only; otherwise NOT_INVITED.
 */
export const joinConversationForUser = async (
  conversationId: string,
  userId: string
) => {
  const convId = conversationId.trim();
  const uid = userId.trim();

  if (!convId || !uid) {
    throw new Error("INVALID_JOIN_IDS");
  }

  const conv = await prisma.conversation.findUnique({
    where: { id: convId },
    select: { id: true, createdBy: true, isPrivate: true },
  });

  if (!conv) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  if (conv.isPrivate) {
    const isCreator = conv.createdBy === uid;
    if (!isCreator) {
      const invite = await prisma.conversationInvite.findUnique({
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

  return prisma.conversationMember.upsert({
    where: {
      conversationId_userId: { conversationId: convId, userId: uid },
    },
    update: {},
    create: {
      conversationId: convId,
      userId: uid,
    },
  });
};

export const inviteUserToConversation = async ({
  conversationId,
  inviterUserId,
  targetUserId,
}: {
  conversationId: string;
  inviterUserId: string;
  targetUserId: string;
}) => {
  const convId = conversationId.trim();
  const inviter = inviterUserId.trim();
  const target = targetUserId.trim();
  if (!convId || !inviter || !target) {
    throw new Error("INVALID_INVITE_PAYLOAD");
  }
  if (inviter === target) {
    throw new Error("INVALID_INVITE_SELF");
  }

  const conv = await prisma.conversation.findUnique({
    where: { id: convId },
    select: { createdBy: true },
  });
  if (!conv) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }
  if (conv.createdBy !== inviter) {
    throw new Error("FORBIDDEN_NOT_CREATOR");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: target },
    select: { id: true },
  });
  if (!targetUser) {
    throw new Error("INVITE_TARGET_NOT_FOUND");
  }

  return prisma.conversationInvite.upsert({
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
};

export const setConversationPrivacyForCreator = async ({
  conversationId,
  userId,
  isPrivate,
}: {
  conversationId: string;
  userId: string;
  isPrivate: boolean;
}) => {
  const convId = conversationId.trim();
  const uid = userId.trim();

  const conv = await prisma.conversation.findUnique({
    where: { id: convId },
    select: { createdBy: true },
  });
  if (!conv) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }
  if (conv.createdBy !== uid) {
    throw new Error("FORBIDDEN_NOT_CREATOR");
  }

  return prisma.conversation.update({
    where: { id: convId },
    data: { isPrivate },
  });
};

export const listConversationInvitesForCreator = async (
  conversationId: string,
  userId: string
) => {
  const convId = conversationId.trim();
  const uid = userId.trim();

  const conv = await prisma.conversation.findUnique({
    where: { id: convId },
    select: { createdBy: true },
  });
  if (!conv) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }
  if (conv.createdBy !== uid) {
    throw new Error("FORBIDDEN_NOT_CREATOR");
  }

  return prisma.conversationInvite.findMany({
    where: { conversationId: convId },
    select: {
      id: true,
      userId: true,
      invitedBy: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const requireConversationMember = async (
  conversationId: string,
  userId: string
) => {
  const member = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
    select: { id: true },
  });
  if (!member) {
    throw new Error("FORBIDDEN_CONVERSATION");
  }
  return member;
};

export const isConversationMember = async (
  conversationId: string,
  userId: string
) => {
  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
    select: { id: true },
  });
  return Boolean(membership);
};

export const createDurableMessage = async ({
  conversationId,
  userId,
  content,
  clientMessageId,
}: {
  conversationId: string;
  userId: string;
  content: string;
  clientMessageId: string;
}) => {
  const member = await isConversationMember(conversationId, userId);
  if (!member) {
    throw new Error("FORBIDDEN_CONVERSATION");
  }

  const duplicate = await prisma.message.findUnique({
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

  const members = await prisma.conversationMember.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  const message = await prisma.message.create({
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
};

export const searchUsersByEmail = async (
  emailQuery: string,
  currentUserId: string
) => {
  if (!emailQuery || emailQuery.length < 2) {
    return [];
  }

  return prisma.user.findMany({
    where: {
      email: {
        contains: emailQuery,
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
};

export const getMessagesByConversation = async ({
  conversationId,
  userId,
  after,
}: {
  conversationId: string;
  userId: string;
  after?: string;
}) => {
  const member = await isConversationMember(conversationId, userId);
  if (!member) {
    throw new Error("FORBIDDEN_CONVERSATION");
  }

  const createdAt = after ? new Date(after) : undefined;

  return prisma.message.findMany({
    where: {
      conversationId,
      ...(createdAt && !Number.isNaN(createdAt.getTime())
        ? { createdAt: { gt: createdAt } }
        : {}),
    },
    orderBy: { createdAt: "asc" },
  });
};

export const getAllUsers = async (currentUserId: string) => {
  const uid = currentUserId.trim();
  return prisma.user.findMany({
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
};

export const getOrCreateDMConversation = async (
  meId: string,
  targetId: string
) => {
  if (meId === targetId) throw new Error("CANNOT_DM_SELF");
  const me = meId.trim();
  const target = targetId.trim();

  // Find existing DM
  let conversation = await prisma.conversation.findFirst({
    where: {
      members: {
        every: {
          userId: {
            in: [me, target],
          },
        },
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

  // Verify exactly 1:1
  if (
    conversation &&
    conversation.members.length === 2 &&
    conversation.members.every((m) => [me, target].includes(m.userId))
  ) {
    return {
      id: conversation.id,
      participants: conversation.members.map((m) => m.user),
    };
  }

  // Create new DM
  const convId = crypto.randomUUID();
  conversation = await prisma.conversation.create({
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
    id: conversation.id,
    participants: conversation.members.map((m) => m.user),
  };
};

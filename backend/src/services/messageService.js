import { MessageDeliveryStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
export const joinConversationForUser = async (conversationId, userId) => {
    await prisma.conversation.upsert({
        where: { id: conversationId },
        update: {},
        create: { id: conversationId },
    });
    return prisma.conversationMember.upsert({
        where: {
            conversationId_userId: { conversationId, userId },
        },
        update: {},
        create: {
            conversationId,
            userId,
        },
    });
};
export const requireConversationMember = async (conversationId, userId) => {
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
export const isConversationMember = async (conversationId, userId) => {
    const membership = await prisma.conversationMember.findUnique({
        where: {
            conversationId_userId: { conversationId, userId },
        },
        select: { id: true },
    });
    return Boolean(membership);
};
export const createDurableMessage = async ({ conversationId, userId, content, clientMessageId, }) => {
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
                    status: m.userId === userId ? MessageDeliveryStatus.DELIVERED : MessageDeliveryStatus.SENT,
                })),
            },
        },
    });
    return { message, duplicate: false };
};
export const getMessagesByConversation = async ({ conversationId, userId, after, }) => {
    const member = await isConversationMember(conversationId, userId);
    if (!member) {
        throw new Error("FORBIDDEN_CONVERSATION");
    }
    const createdAt = after ? new Date(after) : undefined;
    return prisma.message.findMany({
        where: {
            conversationId,
            ...(createdAt && !Number.isNaN(createdAt.getTime()) ? { createdAt: { gt: createdAt } } : {}),
        },
        orderBy: { createdAt: "asc" },
    });
};
//# sourceMappingURL=messageService.js.map
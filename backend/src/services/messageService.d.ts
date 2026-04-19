/**
 * Create a new conversation. Caller becomes creator and first member.
 */
export declare const createConversationForUser: ({ userId, conversationId, isPrivate, }: {
    userId: string;
    conversationId: string;
    isPrivate: boolean;
}) => Promise<{
    name: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    isPrivate: boolean;
    isGroup: boolean;
}>;
/**
 * Join an existing conversation only (no implicit create).
 * Public: any authenticated user may become a member.
 * Private: creator or invitee (ConversationInvite) only; otherwise NOT_INVITED.
 */
export declare const joinConversationForUser: (conversationId: string, userId: string) => Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    conversationId: string;
}>;
export declare const inviteUserToConversation: ({ conversationId, inviterUserId, targetUserId, }: {
    conversationId: string;
    inviterUserId: string;
    targetUserId: string;
}) => Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    conversationId: string;
    invitedBy: string;
}>;
export declare const setConversationPrivacyForCreator: ({ conversationId, userId, isPrivate, }: {
    conversationId: string;
    userId: string;
    isPrivate: boolean;
}) => Promise<{
    name: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    isPrivate: boolean;
    isGroup: boolean;
}>;
export declare const listConversationInvitesForCreator: (conversationId: string, userId: string) => Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    invitedBy: string;
}[]>;
export declare const requireConversationMember: (conversationId: string, userId: string) => Promise<{
    id: string;
}>;
export declare const isConversationMember: (conversationId: string, userId: string) => Promise<boolean>;
export declare const createDurableMessage: ({ conversationId, userId, content, clientMessageId, }: {
    conversationId: string;
    userId: string;
    content: string;
    clientMessageId: string;
}) => Promise<{
    message: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        conversationId: string;
        senderId: string;
        clientMessageId: string;
        content: string;
    };
    duplicate: boolean;
}>;
export declare const searchUsersByUsername: (usernameQuery: string, currentUserId: string) => Promise<{
    name: string;
    id: string;
    email: string;
}[]>;
export declare const getMessagesByConversation: ({ conversationId, userId, after, }: {
    conversationId: string;
    userId: string;
    after?: string;
}) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    conversationId: string;
    senderId: string;
    clientMessageId: string;
    content: string;
}[]>;
export declare const getAllUsers: (currentUserId: string) => Promise<{
    name: string;
    id: string;
    email: string;
}[]>;
export declare const getOrCreateDMConversation: (meId: string, targetId: string) => Promise<{
    id: string;
    participants: {
        name: string;
        id: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
}>;
/**
 * Create a group conversation with multiple users
 */
export declare const createGroupConversation: ({ creatorId, name, userIds, }: {
    creatorId: string;
    name: string;
    userIds: string[];
}) => Promise<{
    id: string;
    name: string | null;
    isGroup: boolean;
    participants: {
        name: string;
        id: string;
        email: string;
    }[];
}>;
/**
 * Get group conversation members
 */
export declare const getConversationMembers: (conversationId: string, userId: string) => Promise<{
    id: string;
    name: string;
    email: string;
    joinedAt: Date;
}[]>;
/**
 * Get user's conversations including groups
 */
export declare const getUserConversations: (userId: string) => Promise<{
    id: string;
    name: string;
    isGroup: boolean;
    participants: {
        name: string;
        id: string;
        email: string;
    }[];
    lastMessage: string | null;
    updatedAt: Date;
}[]>;
//# sourceMappingURL=messageService.d.ts.map
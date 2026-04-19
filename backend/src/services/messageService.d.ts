export declare const joinConversationForUser: (conversationId: string, userId: string) => Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    conversationId: string;
}>;
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
//# sourceMappingURL=messageService.d.ts.map
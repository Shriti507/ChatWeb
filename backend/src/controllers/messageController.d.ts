import type { AuthedRequest } from "../middleware/authMiddleware.js";
import type { Response } from "express";
export declare const searchUsers: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllUsersHandler: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createDMConversationHandler: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createGroupConversationHandler: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getConversationMembersHandler: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listConversationsHandler: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createConversation: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendMessage: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMessages: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const joinConversation: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const inviteToConversation: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const patchConversationPrivacy: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listConversationInvites: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=messageController.d.ts.map
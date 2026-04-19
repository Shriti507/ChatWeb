import { type Response } from "express";
import type { AuthedRequest } from "../middleware/authMiddleware.js";
export declare const sendMessage: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMessages: (req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const joinConversation: (_req: AuthedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=messageController.d.ts.map
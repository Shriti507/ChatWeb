import type { NextFunction, Request, Response } from "express";
export type AuthedRequest = Request & {
    user?: {
        id: string;
    };
};
export declare const requireAuth: (req: AuthedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=authMiddleware.d.ts.map
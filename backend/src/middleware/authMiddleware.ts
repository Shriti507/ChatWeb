import type { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../lib/jwt.js";

export type AuthedRequest = Request & { user?: { id: string } };

export const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const rawHeader = req.header("authorization");
  if (!rawHeader || !rawHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  const token = rawHeader.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  try {
    const payload = verifyAuthToken(token);
    req.user = { id: payload.userId };
    return next();
  } catch {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
};

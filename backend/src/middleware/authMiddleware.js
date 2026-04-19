import { verifyAuthToken } from "../lib/jwt.js";
export const requireAuth = (req, res, next) => {
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
    }
    catch {
        return res.status(401).json({ error: "UNAUTHORIZED" });
    }
};
//# sourceMappingURL=authMiddleware.js.map
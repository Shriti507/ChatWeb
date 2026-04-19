import { Router } from "express";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { signAuthToken } from "../lib/jwt.js";
const router = Router();
const SALT_ROUNDS = 10;
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedName = name?.trim();
        if (!normalizedName || !normalizedEmail || !password || password.length < 6) {
            return res.status(400).json({ error: "INVALID_SIGNUP_PAYLOAD" });
        }
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true },
        });
        if (existingUser) {
            return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
        }
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await prisma.user.create({
            data: {
                id: randomUUID(),
                name: normalizedName,
                email: normalizedEmail,
                password: passwordHash,
            },
            select: { id: true, email: true, name: true },
        });
        const token = signAuthToken(user.id);
        return res.status(201).json({ token, user });
    }
    catch {
        return res.status(500).json({ error: "SIGNUP_FAILED" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();
        if (!normalizedEmail || !password) {
            return res.status(400).json({ error: "INVALID_LOGIN_PAYLOAD" });
        }
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, email: true, name: true, password: true },
        });
        if (!user) {
            return res.status(401).json({ error: "INVALID_CREDENTIALS" });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "INVALID_CREDENTIALS" });
        }
        const token = signAuthToken(user.id);
        return res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    }
    catch {
        return res.status(500).json({ error: "LOGIN_FAILED" });
    }
});
export default router;
//# sourceMappingURL=authRoutes.js.map
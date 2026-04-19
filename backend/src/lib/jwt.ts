import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET_NOT_CONFIGURED");
  }
  return secret;
};

export const signAuthToken = (userId: string) => {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
};

export const verifyAuthToken = (token: string): { userId: string } => {
  const payload = jwt.verify(token, getJwtSecret());
  if (!payload || typeof payload !== "object" || !("userId" in payload)) {
    throw new Error("INVALID_TOKEN_PAYLOAD");
  }
  const userId = payload.userId;
  if (typeof userId !== "string" || !userId) {
    throw new Error("INVALID_TOKEN_PAYLOAD");
  }
  return { userId };
};

const TOKEN_STORAGE_KEY = "chatweb_auth_token";

export const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const setToken = (token) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const decodeJwtPayload = (token) => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const getCurrentUserId = () => {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.userId !== "string") return null;
  return payload.userId;
};

export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

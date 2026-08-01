import { SESSION_MAX_AGE_SECONDS, SESSION_MINUTES } from "@/lib/config";

const SESSION_KEY = "session_token";
const USER_KEY    = "user";
const EXPIRES_KEY = "session_expires_at";

export const saveSession = (token: string, user: object) => {
  if (typeof window !== "undefined") {
    if (token && token !== "undefined" && token !== "null") {
      sessionStorage.setItem(SESSION_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user || {}));
      
      const expiresAt = Date.now() + SESSION_MINUTES * 60 * 1000;
      sessionStorage.setItem(EXPIRES_KEY, expiresAt.toString());
      
      document.cookie = `${SESSION_KEY}=${token}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
    } else {
      clearSession();
    }
  }
};

export const getSession = () => {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem(SESSION_KEY);
  const raw   = sessionStorage.getItem(USER_KEY);
  const expiresAtStr = sessionStorage.getItem(EXPIRES_KEY);
  
  if (!token || token === "undefined" || token === "null" || !raw || raw === "undefined" || raw === "null") {
    return null;
  }
  
  if (expiresAtStr) {
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) {
      clearSession();
      return null;
    }
  }
  
  try {
    return { token, user: JSON.parse(raw) };
  } catch {
    return null;
  }
};

export const clearSession = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
    // Clear cookie
    document.cookie = `${SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

export const isLoggedIn = () => {
  const session = getSession();
  return !!(session && session.token);
};

export const checkSessionExpired = () => {
  if (typeof window === "undefined") return false;
  const token = sessionStorage.getItem(SESSION_KEY);
  const expiresAtStr = sessionStorage.getItem(EXPIRES_KEY);
  if (token && expiresAtStr) {
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) {
      return true;
    }
  }
  return false;
};

/** Authorization headers for FastAPI (existing session_token). */
export const authHeaders = (): Record<string, string> => {
  const session = getSession();
  if (!session?.token) return {};
  return { Authorization: `Bearer ${session.token}` };
};

export const isAdminRole = (role?: string | null): boolean => {
  const r = (role || "").trim().toLowerCase();
  return r === "admin" || r === "administrator";
};

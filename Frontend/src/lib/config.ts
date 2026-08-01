/**
 * Centralized frontend environment configuration.
 * Public values must use NEXT_PUBLIC_* so Next.js can expose them to the browser.
 */

const DEFAULT_API_URL = "http://127.0.0.1:8000";
const DEFAULT_FRONTEND_URL = "http://localhost:3000";
const DEFAULT_SESSION_MINUTES = 45;

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  DEFAULT_API_URL;

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || API_URL;

export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/$/, "") ||
  DEFAULT_FRONTEND_URL;

export const SESSION_MINUTES = Number(
  process.env.NEXT_PUBLIC_SESSION_MINUTES || DEFAULT_SESSION_MINUTES
);

export const SESSION_MAX_AGE_SECONDS = SESSION_MINUTES * 60;

/**
 * App logger: safe for client and server, redacts sensitive data (OWASP: no secrets in logs).
 * In production, only warn/error are emitted unless NEXT_PUBLIC_LOG_LEVEL is set.
 */

const SENSITIVE_KEYS = [
  "password",
  "token",
  "authorization",
  "cookie",
  "secret",
  "clientSecret",
  "apiKey",
  "accessToken",
  "refreshToken",
] as const;

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type Level = keyof typeof LEVELS;

const isDev = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
const envLevel =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_LOG_LEVEL ?? process.env.LOG_LEVEL)?.toLowerCase()) as Level | undefined;
const minLevel = envLevel && LEVELS[envLevel] !== undefined ? LEVELS[envLevel] : isDev ? 0 : 1;

function redact(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(redact);

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const keyLower = k.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some((s) => keyLower.includes(s.toLowerCase()));
    out[k] = isSensitive ? "[REDACTED]" : redact(v);
  }
  return out;
}

function formatMessage(level: Level, message: string, meta?: unknown): string {
  const ts = new Date().toISOString();
  const metaStr = meta !== undefined ? ` ${JSON.stringify(redact(meta))}` : "";
  return `[${ts}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function log(level: Level, message: string, meta?: unknown): void {
  if (LEVELS[level] < minLevel) return;
  const formatted = formatMessage(level, message, meta);
  if (typeof console !== "undefined") {
    switch (level) {
      case "debug":
        console.debug(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
      default:
        console.log(formatted);
    }
  }
}

export const logger = {
  debug: (message: string, meta?: unknown) => log("debug", message, meta),
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
};

# Security (OWASP-aligned)

This UI follows OWASP secure coding practices where applicable.

## Implemented

- **A01:2021 Broken Access Control** – Auth state is checked before checkout/seats; unauthenticated users are redirected to login. Server must enforce authorization.
- **A02:2021 Cryptographic Failures** – No sensitive data in logs (logger redacts `password`, `token`, `authorization`, `clientSecret`, etc.). Use HTTPS in production.
- **A03:2021 Injection** – React escapes output by default (XSS). No `dangerouslySetInnerHTML` with user input. Input validation/sanitization before sending to API (`src/lib/validate.ts`).
- **A04:2021 Insecure Design** – Input validated and length-limited (email, password, name) before submit. Security headers set in `next.config.js`.
- **A05:2021 Security Misconfiguration** – Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`. No stack traces or internal errors exposed to the client.
- **A07:2021 Identification and Authentication Failures** – Login/register validate and sanitize input; errors are generic where appropriate. Backend must validate and rate-limit.

## Headers (next.config.js)

- `X-Content-Type-Options: nosniff` – Prevents MIME sniffing.
- `X-Frame-Options: DENY` – Prevents clickjacking.
- `X-XSS-Protection: 1; mode=block` – Legacy XSS filter.
- `Referrer-Policy: strict-origin-when-cross-origin` – Limits referrer leakage.
- `Permissions-Policy` – Restricts geolocation, microphone, camera.

## Logging

- **Logger** (`src/lib/logger.ts`): Redacts sensitive keys; safe for client and server. Use `logger.debug`, `logger.info`, `logger.warn`, `logger.error`. Set `NEXT_PUBLIC_LOG_LEVEL=debug` (or `info`/`warn`/`error`) to control verbosity; production defaults to info and above.

## Validation

- **`src/lib/validate.ts`**: Email format and length, password and name length limits. Use before calling auth API. Backend must always validate and authorize.

## Recommendations

- Prefer **httpOnly cookies** for session/token in production (requires backend support) to reduce XSS impact vs localStorage.
- Run **HTTPS only** in production.
- Keep dependencies updated (`npm audit`, Dependabot).
- Add **CSP** (Content-Security-Policy) when you have a clear allowlist of scripts/sources.

import type {
  AuthResponse,
  Event,
  EventSeat,
  CheckoutResponse,
} from "@/types/api";
import { logger } from "@/lib/logger";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchApi<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const opts = options ?? {};
  const { token, ...init } = opts;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...((init.headers ?? {}) as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  const url = `${API_BASE}${path}`;
  logger.debug("API request", { path, method: init.method ?? "GET" });
  try {
    const res = await fetch(url, { ...init, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const msg = (err as { message?: string }).message ?? "Request failed";
      logger.warn("API request failed", { path, status: res.status, message: msg });
      throw new Error(msg);
    }
    return res.json() as Promise<T>;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Request failed";
    logger.error("API request error", { path, message });
    throw e;
  }
}

export const api = {
  health: () => fetchApi<{ status?: string }>("/health"),
  auth: {
    register: (body: { email: string; password: string; name: string }) =>
      fetchApi<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      fetchApi<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  events: {
    list: () => fetchApi<Event[]>("/events"),
    get: (id: string) => fetchApi<Event>(`/events/${id}`),
    seats: (id: string) =>
      fetchApi<EventSeat[]>(`/events/${id}/seats`),
  },
  reservations: {
    create: (
      body: { eventId: string; seatIds: string[] },
      token: string
    ) =>
      fetchApi<{ seats: EventSeat[] }>("/reservations", {
        method: "POST",
        body: JSON.stringify(body),
        token,
      }),
  },
  orders: {
    checkout: (body: {
      userId: string;
      eventId: string;
      seatIds: string[];
      tierId: string;
      email: string;
    }) =>
      fetchApi<CheckoutResponse>("/orders/checkout", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
};

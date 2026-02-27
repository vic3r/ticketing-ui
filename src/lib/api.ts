import type {
  AuthResponse,
  Event,
  EventSeat,
  CheckoutResponse,
} from "@/types/api";

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
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? "Request failed");
  }
  return res.json() as Promise<T>;
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

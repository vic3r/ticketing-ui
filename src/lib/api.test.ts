import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./api";

describe("api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("events.list returns array from GET /events", async () => {
    const mockEvents = [{ id: "1", name: "Test Event" }];
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEvents),
    });

    const result = await api.events.list();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/events"),
      expect.any(Object)
    );
    expect(result).toEqual(mockEvents);
  });

  it("events.get(id) calls GET /events/:id", async () => {
    const mockEvent = { id: "e1", name: "One" };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEvent),
    });

    const result = await api.events.get("e1");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/events\/e1$/),
      expect.any(Object)
    );
    expect(result).toEqual(mockEvent);
  });

  it("throws on non-ok response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Not found" }),
    });

    await expect(api.events.get("bad")).rejects.toThrow("Not found");
  });

  it("health returns status", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });
    const result = await api.health();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/health"),
      expect.any(Object)
    );
    expect(result).toEqual({ status: "ok" });
  });

  it("auth.login sends POST and returns token/user", async () => {
    const authRes = {
      token: "jwt",
      user: { id: "1", email: "a@b.com", name: "Alice", role: "user" as const },
    };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(authRes),
    });
    const result = await api.auth.login({ email: "a@b.com", password: "p" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "a@b.com", password: "p" }),
      })
    );
    expect(result).toEqual(authRes);
  });

  it("auth.register sends POST with name", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: "j",
          user: { id: "1", email: "e@e.com", name: "Bob", role: "user" },
        }),
    });
    await api.auth.register({
      email: "e@e.com",
      password: "pw",
      name: "Bob",
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "e@e.com", password: "pw", name: "Bob" }),
      })
    );
  });

  it("events.seats returns array", async () => {
    const seats = [
      { id: "s1", section: "A", row: "1", seatNumber: 1, status: "available" },
    ];
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seats),
    });
    const result = await api.events.seats("ev1");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/events\/ev1\/seats/),
      expect.any(Object)
    );
    expect(result).toEqual(seats);
  });

  it("reservations.create sends token in Authorization", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ seats: [] }),
    });
    await api.reservations.create(
      { eventId: "e1", seatIds: ["s1"] },
      "bearer-token"
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/reservations"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer bearer-token",
        }),
      })
    );
  });

  it("orders.checkout returns orderId and clientSecret", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          orderId: "ord_1",
          clientSecret: "pi_secret",
        }),
    });
    const result = await api.orders.checkout({
      userId: "u1",
      eventId: "e1",
      seatIds: ["s1"],
      tierId: "t1",
      email: "u@e.com",
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/orders/checkout"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          userId: "u1",
          eventId: "e1",
          seatIds: ["s1"],
          tierId: "t1",
          email: "u@e.com",
        }),
      })
    );
    expect(result).toEqual({ orderId: "ord_1", clientSecret: "pi_secret" });
  });

  it("uses statusText when response has no message", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error("no json")),
      statusText: "Server Error",
    });
    await expect(api.events.list()).rejects.toThrow("Server Error");
  });
});

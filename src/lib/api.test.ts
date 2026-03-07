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

  it("events.create sends POST with token and returns event", async () => {
    const event = {
      id: "ev1",
      name: "New Event",
      venueId: "v1",
      organizerId: null,
      startDate: "2025-08-01T18:00:00.000Z",
      endDate: "2025-08-01T22:00:00.000Z",
      description: null,
      imageUrl: null,
      status: "draft",
      isPublished: false,
      createdAt: "",
      updatedAt: "",
    };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(event),
    });
    const result = await api.events.create(
      {
        venueId: "v1",
        organizerId: null,
        name: "New Event",
        description: null,
        imageUrl: null,
        startDate: "2025-08-01T18:00:00.000Z",
        endDate: "2025-08-01T22:00:00.000Z",
        isPublished: false,
      },
      "admin-token"
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/events"),
      expect.objectContaining({
        method: "POST",
        body: expect.any(String),
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token",
        }),
      })
    );
    expect(result.id).toBe("ev1");
    expect(result.name).toBe("New Event");
  });

  it("venues.list returns array from GET /venues", async () => {
    const venues = [
      { id: "v1", name: "Arena", address: "1 St", city: "City", state: "ST", zip: "123", country: "US", organizerId: null, description: null, createdAt: "", updatedAt: "" },
    ];
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(venues),
    });
    const result = await api.venues.list();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/venues"),
      expect.any(Object)
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Arena");
  });

  it("venues.get(id) calls GET /venues/:id", async () => {
    const venue = { id: "v1", name: "Hall", address: "2 St", city: "Town", state: "ST", zip: "456", country: "US", organizerId: null, description: null, createdAt: "", updatedAt: "" };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(venue),
    });
    const result = await api.venues.get("v1");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/venues\/v1$/),
      expect.any(Object)
    );
    expect(result.name).toBe("Hall");
  });

  it("venues.create sends POST with token and returns venue", async () => {
    const venue = { id: "v1", name: "New Venue", address: "3 St", city: "City", state: "ST", zip: "789", country: "US", organizerId: null, description: null, createdAt: "", updatedAt: "" };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(venue),
    });
    const result = await api.venues.create(
      { name: "New Venue", address: "3 St", city: "City", state: "ST", zip: "789", country: "US" },
      "admin-token"
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/venues"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token",
        }),
      })
    );
    expect(result.id).toBe("v1");
  });

  it("venues.addSeats sends POST with token and returns count", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ count: 50 }),
    });
    const result = await api.venues.addSeats(
      "v1",
      { seats: [{ section: "A", row: "1", seatNumber: 1 }] },
      "admin-token"
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/venues\/v1\/seats/),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ seats: [{ section: "A", row: "1", seatNumber: 1 }] }),
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token",
        }),
      })
    );
    expect(result.count).toBe(50);
  });
});

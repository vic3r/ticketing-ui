import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import EventDetailPage from "@/app/events/[id]/page";

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock("@/lib/api", () => ({
  api: { events: { get: mockGet } },
}));

const mockNotFound = vi.fn();
vi.mock("next/navigation", () => ({
  notFound: () => {
    mockNotFound();
    throw new Error("NOT_FOUND");
  },
}));

describe("EventDetailPage", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockNotFound.mockReset();
  });

  it("renders event when api returns event", async () => {
    mockGet.mockResolvedValueOnce({
      id: "ev1",
      name: "Jazz Night",
      startDate: "2025-07-15T20:00:00.000Z",
      endDate: "2025-07-15T23:00:00.000Z",
      imageUrl: null,
      description: "Live jazz",
    });
    const jsx = await EventDetailPage({
      params: Promise.resolve({ id: "ev1" }),
    });
    render(jsx);
    expect(screen.getByRole("heading", { name: "Jazz Night" })).toBeInTheDocument();
    expect(screen.getByText("Live jazz")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /choose seats/i })).toHaveAttribute(
      "href",
      "/events/ev1/seats"
    );
  });

  it("calls notFound when api throws", async () => {
    mockGet.mockRejectedValueOnce(new Error("Not found"));
    await expect(
      EventDetailPage({ params: Promise.resolve({ id: "bad" }) })
    ).rejects.toThrow("NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });

  it("renders event with image when imageUrl is set", async () => {
    mockGet.mockResolvedValueOnce({
      id: "ev2",
      name: "Photo Event",
      startDate: "2025-08-01T19:00:00.000Z",
      endDate: "2025-08-01T22:00:00.000Z",
      imageUrl: "https://example.com/event.jpg",
      description: null,
    });
    const jsx = await EventDetailPage({
      params: Promise.resolve({ id: "ev2" }),
    });
    render(jsx);
    const img = screen.getByRole("presentation");
    expect(img).toHaveAttribute("src", "https://example.com/event.jpg");
    expect(screen.getByRole("heading", { name: "Photo Event" })).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import EventsPage from "@/app/events/page";

const { mockList } = vi.hoisted(() => ({ mockList: vi.fn() }));
vi.mock("@/lib/api", () => ({
  api: {
    events: { list: mockList },
  },
}));

describe("EventsPage", () => {
  beforeEach(() => {
    mockList.mockReset();
  });

  it("renders events list when api returns events", async () => {
    mockList.mockResolvedValueOnce([
      {
        id: "1",
        name: "Summer Concert",
        startDate: "2025-08-01T18:00:00.000Z",
        endDate: "2025-08-01T22:00:00.000Z",
        imageUrl: null,
        description: "Fun night",
      },
    ]);
    const jsx = await EventsPage();
    render(jsx);
    expect(screen.getByRole("heading", { name: /upcoming events/i })).toBeInTheDocument();
    expect(screen.getByText("Summer Concert")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view event/i })).toHaveAttribute(
      "href",
      "/events/1"
    );
  });

  it("renders empty state when no events", async () => {
    mockList.mockResolvedValueOnce([]);
    const jsx = await EventsPage();
    render(jsx);
    expect(screen.getByText(/no events yet/i)).toBeInTheDocument();
  });

  it("renders error and API hint when api throws", async () => {
    mockList.mockRejectedValueOnce(new Error("Network error"));
    const jsx = await EventsPage();
    render(jsx);
    expect(screen.getByText("Network error")).toBeInTheDocument();
    expect(screen.getByText(/ensure the ticketing api/i)).toBeInTheDocument();
  });

  it("renders generic error when api throws non-Error", async () => {
    mockList.mockRejectedValueOnce("network down");
    const jsx = await EventsPage();
    render(jsx);
    expect(screen.getByText("Failed to load events")).toBeInTheDocument();
  });

  it("renders event with image when imageUrl is set", async () => {
    mockList.mockResolvedValueOnce([
      {
        id: "2",
        name: "With Image",
        startDate: "2025-09-01T18:00:00.000Z",
        endDate: "2025-09-01T22:00:00.000Z",
        imageUrl: "https://example.com/poster.jpg",
        description: null,
      },
    ]);
    const jsx = await EventsPage();
    render(jsx);
    const img = screen.getByRole("presentation");
    expect(img).toHaveAttribute("src", "https://example.com/poster.jpg");
    expect(screen.getByText("With Image")).toBeInTheDocument();
  });
});

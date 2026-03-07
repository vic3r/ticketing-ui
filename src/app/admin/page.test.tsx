import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminPage from "./page";

describe("AdminPage", () => {
  it("renders Admin heading and description", () => {
    render(<AdminPage />);
    expect(screen.getByRole("heading", { name: /^admin$/i })).toBeInTheDocument();
    expect(screen.getByText(/create events and manage venues/i)).toBeInTheDocument();
  });

  it("renders Create event and Venues links", () => {
    render(<AdminPage />);
    const createEventLink = screen.getByRole("link", { name: /create event/i });
    const venuesLink = screen.getByRole("link", { name: (name) => name.startsWith("Venues") });
    expect(createEventLink).toHaveAttribute("href", "/admin/events/new");
    expect(venuesLink).toHaveAttribute("href", "/admin/venues");
  });
});

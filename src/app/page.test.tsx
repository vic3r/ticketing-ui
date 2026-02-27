import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders hero heading and description", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        name: /your next live experience starts here/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/concerts, shows, and events/i)
    ).toBeInTheDocument();
  });

  it("has Browse events link to /events", () => {
    render(<HomePage />);
    const link = screen.getByRole("link", { name: /browse events/i });
    expect(link).toHaveAttribute("href", "/events");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./header";

const mockUseAuth = vi.fn();
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("Header", () => {
  it("renders TicketFlow and Events link", () => {
    mockUseAuth.mockReturnValue({ user: null, ready: true });
    render(<Header />);
    expect(screen.getByText("TicketFlow")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /events/i })).toBeInTheDocument();
  });

  it("shows Log in and Sign up when not authenticated", () => {
    mockUseAuth.mockReturnValue({ user: null, ready: true });
    render(<Header />);
    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  it("shows user name and Log out when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "a@b.com", name: "Alice", role: "user" },
      ready: true,
      logout: vi.fn(),
    });
    render(<Header />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("calls logout when Log out is clicked", async () => {
    const logout = vi.fn();
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "a@b.com", name: "Alice", role: "user" },
      ready: true,
      logout,
    });
    render(<Header />);
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AdminVenuesPage from "./page";

const mockUseAuth = vi.fn();
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockVenuesList = vi.fn();
vi.mock("@/lib/api", () => ({
  api: { venues: { list: (...args: unknown[]) => mockVenuesList(...args) } },
}));

describe("AdminVenuesPage", () => {
  const adminAuth = {
    user: { id: "a1", email: "admin@example.com", name: "Admin", role: "admin" as const },
    ready: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(adminAuth);
    mockVenuesList.mockResolvedValue([]);
  });

  it("returns null when not ready or no user", () => {
    mockUseAuth.mockReturnValue({ user: null, ready: true });
    const { container } = render(<AdminVenuesPage />);
    expect(container.firstChild).toBeNull();
  });

  it("shows loading then empty state when no venues", async () => {
    render(<AdminVenuesPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/no venues yet/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /create your first venue/i })).toHaveAttribute("href", "/admin/venues/new");
  });

  it("shows error when venues list fails", async () => {
    mockVenuesList.mockRejectedValue(new Error("Network error"));
    render(<AdminVenuesPage />);
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it("shows list of venues with Add / edit seats links", async () => {
    mockVenuesList.mockResolvedValue([
      { id: "v1", name: "Arena", address: "1 Main St", city: "City", state: "ST", zip: "123", country: "US", organizerId: null, description: null, createdAt: "", updatedAt: "" },
    ]);
    render(<AdminVenuesPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /arena/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/1 Main St, City, ST 123/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add \/ edit seats/i })).toHaveAttribute("href", "/admin/venues/v1/seats");
  });

  it("shows Add venue button", async () => {
    render(<AdminVenuesPage />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /add venue/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /add venue/i })).toHaveAttribute("href", "/admin/venues/new");
  });
});

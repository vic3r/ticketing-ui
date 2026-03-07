import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VenueSeatsPage from "./page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "v1" }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const mockUseAuth = vi.fn();
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockVenuesGet = vi.fn();
const mockVenuesAddSeats = vi.fn();
vi.mock("@/lib/api", () => ({
  api: {
    venues: {
      get: (...args: unknown[]) => mockVenuesGet(...args),
      addSeats: (...args: unknown[]) => mockVenuesAddSeats(...args),
    },
  },
}));

describe("VenueSeatsPage", () => {
  const adminAuth = {
    user: { id: "a1", email: "admin@example.com", name: "Admin", role: "admin" as const },
    token: "admin-token",
    ready: true,
  };

  const venue = {
    id: "v1",
    name: "Main Hall",
    address: "1 St",
    city: "City",
    state: "ST",
    zip: "123",
    country: "US",
    organizerId: null,
    description: null,
    createdAt: "",
    updatedAt: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(adminAuth);
    mockVenuesGet.mockResolvedValue(venue);
  });

  it("returns null when not ready or no user", () => {
    mockUseAuth.mockReturnValue({ user: null, ready: true });
    const { container } = render(<VenueSeatsPage />);
    expect(container.firstChild).toBeNull();
  });

  it("shows loading then venue name and bulk form", async () => {
    render(<VenueSeatsPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /seats for main hall/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/section/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add seats/i })).toBeInTheDocument();
  });

  it("shows error when venue load fails", async () => {
    mockVenuesGet.mockRejectedValue(new Error("Not found"));
    render(<VenueSeatsPage />);
    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });

  it("calls api.venues.addSeats and shows success", async () => {
    mockVenuesAddSeats.mockResolvedValue({ count: 10 });
    render(<VenueSeatsPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /seats for main hall/i })).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole("button", { name: /add seats/i }));
    await waitFor(() => {
      expect(mockVenuesAddSeats).toHaveBeenCalledWith("v1", expect.objectContaining({ seats: expect.any(Array) }), "admin-token");
    });
    await waitFor(() => {
      expect(screen.getByText(/added 10 seats/i)).toBeInTheDocument();
    });
  });
});

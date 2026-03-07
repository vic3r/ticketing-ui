import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewEventPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const mockUseAuth = vi.fn();
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockVenuesList = vi.fn();
const mockEventsCreate = vi.fn();
vi.mock("@/lib/api", () => ({
  api: {
    venues: { list: (...args: unknown[]) => mockVenuesList(...args) },
    events: { create: (...args: unknown[]) => mockEventsCreate(...args) },
  },
}));

describe("NewEventPage", () => {
  const adminAuth = {
    user: { id: "a1", email: "admin@example.com", name: "Admin", role: "admin" as const },
    token: "admin-token",
    ready: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(adminAuth);
    mockVenuesList.mockResolvedValue([]);
  });

  it("shows loading then empty state when no venues", async () => {
    render(<NewEventPage />);
    expect(screen.getByText(/loading venues/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/no venues yet/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /create venue/i })).toHaveAttribute("href", "/admin/venues/new");
  });

  it("shows form with venue select when venues exist", async () => {
    mockVenuesList.mockResolvedValue([
      { id: "v1", name: "Main Hall", address: "1 St", city: "City", state: "ST", zip: "123", country: "US", organizerId: null, description: null, createdAt: "", updatedAt: "" },
    ]);
    render(<NewEventPage />);
    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: /venue/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("textbox", { name: /event name/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create event/i })).toBeInTheDocument();
  });

  it("shows validation error when submitting without name", async () => {
    mockVenuesList.mockResolvedValue([
      { id: "v1", name: "Hall", address: "1 St", city: "City", state: "ST", zip: "123", country: "US", organizerId: null, description: null, createdAt: "", updatedAt: "" },
    ]);
    render(<NewEventPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create event/i })).toBeInTheDocument();
    });
    // Fill event name with spaces so HTML5 required passes but our validation fails; fill dates so form submits
    await userEvent.type(screen.getByRole("textbox", { name: /event name/i }), "   ");
    await userEvent.type(screen.getByLabelText(/start date/i), "2025-08-01");
    await userEvent.type(screen.getByLabelText(/end date/i), "2025-08-01");
    await userEvent.click(screen.getByRole("button", { name: /create event/i }));
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("select a venue") && content.includes("event name"))).toBeInTheDocument();
    });
  });

  it("calls api.events.create when form is valid and submitted", async () => {
    mockVenuesList.mockResolvedValue([
      { id: "v1", name: "Hall", address: "1 St", city: "City", state: "ST", zip: "123", country: "US", organizerId: null, description: null, createdAt: "", updatedAt: "" },
    ]);
    mockEventsCreate.mockResolvedValue({ id: "ev1", name: "Concert" });

    render(<NewEventPage />);
    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: /venue/i })).toBeInTheDocument();
    });
    await userEvent.type(screen.getByRole("textbox", { name: /event name/i }), "Concert");
    await userEvent.type(screen.getByLabelText(/start date/i), "2025-08-01");
    await userEvent.type(screen.getByLabelText(/end date/i), "2025-08-01");
    await userEvent.click(screen.getByRole("button", { name: /create event/i }));

    await waitFor(() => {
      expect(mockEventsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          venueId: "v1",
          name: "Concert",
          organizerId: null,
        }),
        "admin-token"
      );
    });
  });
});

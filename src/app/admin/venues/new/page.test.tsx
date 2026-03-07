import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewVenuePage from "./page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));

const mockUseAuth = vi.fn();
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockVenuesCreate = vi.fn();
vi.mock("@/lib/api", () => ({
  api: { venues: { create: (...args: unknown[]) => mockVenuesCreate(...args) } },
}));

describe("NewVenuePage", () => {
  const adminAuth = {
    user: { id: "a1", email: "admin@example.com", name: "Admin", role: "admin" as const },
    token: "admin-token",
    ready: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(adminAuth);
  });

  it("returns null when not ready or no user", () => {
    mockUseAuth.mockReturnValue({ user: null, ready: true });
    const { container } = render(<NewVenuePage />);
    expect(container.firstChild).toBeNull();
  });

  it("renders Add venue heading and form fields", () => {
    render(<NewVenuePage />);
    expect(screen.getByRole("heading", { name: /add venue/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/venue name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create venue/i })).toBeInTheDocument();
  });

  it("shows validation error when submitting with empty required fields", async () => {
    render(<NewVenuePage />);
    // Fill name with only spaces so HTML5 required passes but our validation fails
    await userEvent.type(screen.getByLabelText(/venue name/i), "   ");
    await userEvent.type(screen.getByLabelText(/address/i), "123 Main");
    await userEvent.type(screen.getByLabelText(/city/i), "City");
    await userEvent.type(screen.getByLabelText(/state/i), "ST");
    await userEvent.type(screen.getByLabelText(/zip/i), "12345");
    await userEvent.type(screen.getByLabelText(/country/i), "US");
    await userEvent.click(screen.getByRole("button", { name: /create venue/i }));
    expect(await screen.findByText((content) => content.includes("fill in name") && content.includes("address"))).toBeInTheDocument();
    expect(mockVenuesCreate).not.toHaveBeenCalled();
  });

  it("calls api.venues.create and redirects on success", async () => {
    mockVenuesCreate.mockResolvedValue({ id: "v1", name: "New Hall" });
    render(<NewVenuePage />);
    await userEvent.type(screen.getByLabelText(/venue name/i), "New Hall");
    await userEvent.type(screen.getByLabelText(/address/i), "123 Main St");
    await userEvent.type(screen.getByLabelText(/city/i), "City");
    await userEvent.type(screen.getByLabelText(/state/i), "ST");
    await userEvent.type(screen.getByLabelText(/zip/i), "12345");
    await userEvent.clear(screen.getByLabelText(/country/i));
    await userEvent.type(screen.getByLabelText(/country/i), "US");
    await userEvent.click(screen.getByRole("button", { name: /create venue/i }));

    await waitFor(() => {
      expect(mockVenuesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Hall",
          address: "123 Main St",
          city: "City",
          state: "ST",
          zip: "12345",
          country: "US",
        }),
        "admin-token"
      );
    });
  });
});

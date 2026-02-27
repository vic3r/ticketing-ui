import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SeatsPage from "@/app/events/[id]/seats/page";

const { mockGet, mockSeats, mockReservationsCreate } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockSeats: vi.fn(),
  mockReservationsCreate: vi.fn(),
}));
vi.mock("@/lib/api", () => ({
  api: {
    events: { get: mockGet, seats: mockSeats },
    reservations: { create: mockReservationsCreate },
  },
}));

const mockPush = vi.fn();
const mockUseAuth = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "ev1" }),
  useRouter: () => ({ push: mockPush }),
}));
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("SeatsPage", () => {
  const mockEvent = {
    id: "ev1",
    name: "Concert",
    startDate: "",
    endDate: "",
    imageUrl: null,
    description: null,
  };
  const mockSeatsList = [
    { id: "s1", section: "A", row: "1", seatNumber: 1, status: "available" as const },
    { id: "s2", section: "A", row: "1", seatNumber: 2, status: "available" as const },
  ];

  beforeEach(() => {
    mockGet.mockReset();
    mockSeats.mockReset();
    mockReservationsCreate.mockReset();
    mockPush.mockReset();
    mockGet.mockResolvedValue(mockEvent);
    mockSeats.mockResolvedValue(mockSeatsList);
  });

  it("shows login prompt when user not authenticated", async () => {
    mockUseAuth.mockReturnValue({ user: null, token: null });
    render(<SeatsPage />);
    await waitFor(() => {
      expect(screen.getByText(/please log in to reserve seats/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  });

  it("loads event and seats and shows seat selection when authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "a@b.com", name: "Alice", role: "user" },
      token: "jwt",
    });
    render(<SeatsPage />);
    await waitFor(() => {
      expect(screen.getByText("Choose your seats")).toBeInTheDocument();
    });
    expect(screen.getByText("Concert")).toBeInTheDocument();
    expect(screen.getByText("Section A")).toBeInTheDocument();
  });

  it("toggles seat selection and calls reserve then redirects", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "a@b.com", name: "Alice", role: "user" },
      token: "jwt",
    });
    mockReservationsCreate.mockResolvedValueOnce({ seats: [] });
    render(<SeatsPage />);
    await waitFor(() => {
      expect(screen.getByText("Section A")).toBeInTheDocument();
    });
    const seatButtons = screen.getAllByRole("button", { name: /1|2/ });
    await userEvent.click(seatButtons[0]);
    expect(screen.getByText(/1 seat selected/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /continue to checkout/i }));
    await waitFor(() => {
      expect(mockReservationsCreate).toHaveBeenCalledWith(
        { eventId: "ev1", seatIds: ["s1"] },
        "jwt"
      );
    });
    expect(mockPush).toHaveBeenCalledWith(
      "/events/ev1/checkout?seatIds=s1"
    );
  });

  it("shows generic error when load fails with non-Error", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "a@b.com", name: "Alice", role: "user" },
      token: "jwt",
    });
    mockGet.mockRejectedValueOnce("fetch failed");
    render(<SeatsPage />);
    await waitFor(() => {
      expect(screen.getByText("Failed to load")).toBeInTheDocument();
    });
  });

  it("shows generic error when reserve fails with non-Error", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "a@b.com", name: "Alice", role: "user" },
      token: "jwt",
    });
    mockReservationsCreate.mockRejectedValueOnce("server error");
    render(<SeatsPage />);
    await waitFor(() => {
      expect(screen.getByText("Section A")).toBeInTheDocument();
    });
    const seatButtons = screen.getAllByRole("button", { name: /1|2/ });
    await userEvent.click(seatButtons[0]);
    await userEvent.click(screen.getByRole("button", { name: /continue to checkout/i }));
    await waitFor(() => {
      expect(screen.getByText("Reservation failed")).toBeInTheDocument();
    });
  });
});
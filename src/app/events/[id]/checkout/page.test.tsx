import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import CheckoutPage from "@/app/events/[id]/checkout/page";

const { mockCheckout } = vi.hoisted(() => ({ mockCheckout: vi.fn() }));
vi.mock("@/lib/api", () => ({
  api: { orders: { checkout: mockCheckout } },
}));

const mockUseAuth = vi.fn();
const seatIdsRef = vi.hoisted(() => ({ value: "s1,s2" }));
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "ev1" }),
  useSearchParams: () => ({
    get: (key: string) => (key === "seatIds" ? seatIdsRef.value : null),
  }),
}));

describe("CheckoutPage", () => {
  beforeEach(() => {
    mockCheckout.mockReset();
    seatIdsRef.value = "s1,s2";
  });

  it("shows login prompt when user not authenticated", () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<CheckoutPage />);
    expect(screen.getByText(/please log in to complete checkout/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  });

  it("shows loading then success when checkout succeeds", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "a@b.com", name: "Alice", role: "user" },
    });
    mockCheckout.mockResolvedValue({
      orderId: "ord_1",
      clientSecret: "pi_secret",
    });
    render(<CheckoutPage />);
    expect(screen.getByText(/preparing checkout/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Complete payment")).toBeInTheDocument();
    });
    expect(screen.getByText(/order ord_1/i)).toBeInTheDocument();
    expect(screen.getByText(/payment intent ready/i)).toBeInTheDocument();
  });

  it("shows error when checkout fails", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "a@b.com", name: "Alice", role: "user" },
    });
    mockCheckout.mockRejectedValue(new Error("Seats no longer available"));
    render(<CheckoutPage />);
    await waitFor(() => {
      expect(screen.getByText("Seats no longer available")).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /back to seat selection/i })).toHaveAttribute(
      "href",
      "/events/ev1/seats"
    );
  });

  it("shows error when user present but seatIds missing", async () => {
    seatIdsRef.value = "";
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "a@b.com", name: "Alice", role: "user" },
    });
    render(<CheckoutPage />);
    await waitFor(() => {
      expect(screen.getByText(/missing user, seats, or event/i)).toBeInTheDocument();
    });
  });

  it("shows error when checkout returns no clientSecret", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "a@b.com", name: "Alice", role: "user" },
    });
    mockCheckout.mockResolvedValue({
      orderId: "ord_2",
      clientSecret: null,
    });
    render(<CheckoutPage />);
    await waitFor(() => {
      expect(screen.getByText("No payment intent returned.")).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /back to seat selection/i })).toHaveAttribute(
      "href",
      "/events/ev1/seats"
    );
  });

  it("shows generic error when checkout rejects with non-Error", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "a@b.com", name: "Alice", role: "user" },
    });
    mockCheckout.mockRejectedValue("Something went wrong");
    render(<CheckoutPage />);
    await waitFor(() => {
      expect(screen.getByText("Checkout failed")).toBeInTheDocument();
    });
  });
});
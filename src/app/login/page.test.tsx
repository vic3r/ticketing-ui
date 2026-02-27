import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";

const mockLogin = vi.fn();
const mockPush = vi.fn();
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({ login: mockLogin }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockPush.mockReset();
  });

  it("renders login form with email and password", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("submits with form values and redirects on success", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/email/i), "alice@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("alice@example.com", "secret123");
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/events");
    });
  });

  it("shows error message when login fails", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("shows generic error when login rejects with non-Error", async () => {
    mockLogin.mockRejectedValueOnce("something went wrong");
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/password/i), "pass");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText("Login failed")).toBeInTheDocument();
    });
  });

  it("has link to register", () => {
    render(<LoginPage />);
    const link = screen.getByRole("link", { name: /sign up/i });
    expect(link).toHaveAttribute("href", "/register");
  });
});

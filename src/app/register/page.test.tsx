import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/register/page";

const mockRegister = vi.fn();
const mockPush = vi.fn();
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({ register: mockRegister }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockPush.mockReset();
  });

  it("renders sign up form with name, email, password", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("heading", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("submits with form values and redirects on success", async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/name/i), "Alice");
    await userEvent.type(screen.getByLabelText(/email/i), "alice@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith("alice@example.com", "secret123", "Alice");
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/events");
    });
  });

  it("shows error when registration fails", async () => {
    mockRegister.mockRejectedValueOnce(new Error("Email already taken"));
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/name/i), "Bob");
    await userEvent.type(screen.getByLabelText(/email/i), "bob@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "pass");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText("Email already taken")).toBeInTheDocument();
    });
  });

  it("shows generic error when register rejects with non-Error", async () => {
    mockRegister.mockRejectedValueOnce("server error");
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/name/i), "Bob");
    await userEvent.type(screen.getByLabelText(/email/i), "bob@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "pass");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText("Registration failed")).toBeInTheDocument();
    });
  });

  it("has link to log in", () => {
    render(<RegisterPage />);
    const link = screen.getByRole("link", { name: /log in/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});

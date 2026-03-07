import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminLayout from "./layout";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockUseAuth = vi.fn();
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Loading when not ready", () => {
    mockUseAuth.mockReturnValue({ user: null, ready: false });
    render(
      <AdminLayout>
        <span>Child content</span>
      </AdminLayout>
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Child content")).not.toBeInTheDocument();
  });

  it("shows Loading when user is null and ready", () => {
    mockUseAuth.mockReturnValue({ user: null, ready: true });
    render(
      <AdminLayout>
        <span>Child content</span>
      </AdminLayout>
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("shows Loading and redirects to /events when user is not admin", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "u@u.com", name: "User", role: "user" },
      ready: true,
    });
    render(
      <AdminLayout>
        <span>Child content</span>
      </AdminLayout>
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/events");
  });

  it("renders nav and children when user is admin and ready", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "a1", email: "admin@example.com", name: "Admin", role: "admin" },
      ready: true,
    });
    render(
      <AdminLayout>
        <span>Child content</span>
      </AdminLayout>
    );
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create event/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /venues/i })).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

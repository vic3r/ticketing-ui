import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

function TestConsumer() {
  const auth = useAuth();
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [registerError, setRegisterError] = React.useState<string | null>(null);
  return (
    <div>
      <span data-testid="ready">{String(auth.ready)}</span>
      <span data-testid="user">{auth.user?.name ?? "none"}</span>
      {loginError && <span data-testid="login-error">{loginError}</span>}
      {registerError && <span data-testid="register-error">{registerError}</span>}
      <button type="button" onClick={() => auth.logout()}>
        Logout
      </button>
      <button
        type="button"
        onClick={() =>
          auth.login("u@e.com", "pass").catch((e: Error) => setLoginError(e.message))
        }
      >
        Login
      </button>
      <button
        type="button"
        onClick={() =>
          auth
            .register("u@e.com", "pass", "User")
            .catch((e: Error) => setRegisterError(e.message))
        }
      >
        Register
      </button>
      <button type="button" onClick={() => auth.setToken("new-token")}>
        SetToken
      </button>
      <button
        type="button"
        onClick={() =>
          auth.setUser({
            id: "99",
            email: "x@x.com",
            name: "SetUser",
            role: "user",
          })
        }
      >
        SetUser
      </button>
    </div>
  );
}

describe("AuthProvider / useAuth", () => {
  const mockFetch = vi.fn();
  let getItem: ReturnType<typeof vi.fn>;
  let setItem: ReturnType<typeof vi.fn>;
  let removeItem: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    getItem = vi.fn();
    setItem = vi.fn();
    removeItem = vi.fn();
    Object.defineProperty(global, "localStorage", {
      value: { getItem, setItem, removeItem },
      writable: true,
    });
  });

  it("throws when useAuth is used outside provider", () => {
    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used within AuthProvider"
    );
  });

  it("provides ready and null user initially", async () => {
    getItem.mockReturnValue(null);
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("restores user from localStorage", async () => {
    const stored = {
      token: "jwt",
      user: { id: "1", email: "a@b.com", name: "Stored", role: "user" as const },
    };
    getItem.mockReturnValue(JSON.stringify(stored));
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Stored");
    });
  });

  it("login updates state and persists", async () => {
    getItem.mockReturnValue(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: "t",
          user: { id: "1", email: "u@e.com", name: "User", role: "user" },
        }),
    });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });
    await userEvent.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("User");
    });
    expect(setItem).toHaveBeenCalledWith(
      "ticketing-auth",
      expect.stringContaining("User")
    );
  });

  it("register updates state and persists", async () => {
    getItem.mockReturnValue(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: "t",
          user: { id: "2", email: "u@e.com", name: "User", role: "user" },
        }),
    });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: /register/i }));
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("User");
    });
    expect(setItem).toHaveBeenCalled();
  });

  it("logout clears state and storage", async () => {
    getItem.mockReturnValue(
      JSON.stringify({
        token: "t",
        user: { id: "1", email: "a@b.com", name: "Alice", role: "user" },
      })
    );
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Alice");
    });
    await userEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(screen.getByTestId("user")).toHaveTextContent("none");
    expect(removeItem).toHaveBeenCalledWith("ticketing-auth");
  });

  it("login throws with default message when res not ok and json fails", async () => {
    getItem.mockReturnValue(null);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error("no json")),
    });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByTestId("login-error")).toHaveTextContent("Login failed");
    });
  });

  it("register throws with default message when res not ok and json fails", async () => {
    getItem.mockReturnValue(null);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error("no json")),
    });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: /register/i }));
    await waitFor(() => {
      expect(screen.getByTestId("register-error")).toHaveTextContent(
        "Registration failed"
      );
    });
  });

  it("setToken and setUser update state", async () => {
    getItem.mockReturnValue(null);
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("none");
    await userEvent.click(screen.getByRole("button", { name: /setuser/i }));
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("SetUser");
    });
    await userEvent.click(screen.getByRole("button", { name: /settoken/i }));
    expect(screen.getByTestId("user")).toHaveTextContent("SetUser");
  });
});

import { test, expect } from "@playwright/test";

test.describe("Home and navigation", () => {
  test("home page loads and shows TicketFlow", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "TicketFlow" })).toBeVisible();
  });

  test("Browse events link goes to /events", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /browse events/i }).click();
    await expect(page).toHaveURL(/\/events/);
  });
});

test.describe("Login page", () => {
  test("login form is visible", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /log in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
  });

  test("sign up link goes to register", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("main").getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/register");
  });
});

test.describe("Events page", () => {
  test("events page loads", async ({ page }) => {
    await page.goto("/events");
    await expect(page).toHaveURL(/\/events/);
    // Page shows one of: heading when list loads, empty state, or API error
    await expect(
      page.getByRole("heading", { name: /upcoming events/i }).or(
        page.getByText(/no events yet/i)
      ).or(
        page.getByText(/ensure the ticketing api|failed to load events/i)
      )
    ).toBeVisible();
  });
});

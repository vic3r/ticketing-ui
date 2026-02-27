import { describe, it, expect } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("formats a Date object", () => {
    const d = new Date("2025-06-15T19:00:00.000Z");
    const result = formatDate(d);
    expect(result).toMatch(/\w{3}, \w{3} \d{1,2}, \d{4}, \d{1,2}:\d{2} [AP]M/);
  });

  it("formats an ISO string", () => {
    const result = formatDate("2025-08-01T18:00:00.000Z");
    expect(result).toMatch(/\w{3}, \w{3} \d{1,2}, \d{4}/);
  });

  it("returns a string", () => {
    expect(formatDate(new Date())).toBeTypeOf("string");
  });
});

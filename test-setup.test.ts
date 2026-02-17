import { describe, it, expect } from "bun:test";
import { parseSimaiChart } from "@/lib/simai";

describe("bun test infrastructure", () => {
  it("should resolve @/ path aliases", () => {
    const result = parseSimaiChart("(120){4}1,2,E");
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

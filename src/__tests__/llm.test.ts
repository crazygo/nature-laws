import { describe, it, expect } from "vitest";
import { createFallbackObject } from "@/lib/llm";

describe("llm", () => {
  describe("createFallbackObject", () => {
    it("creates a fallback object with correct defaults", () => {
      const obj = createFallbackObject("wooden table");
      expect(obj.name).toBe("Wooden table");
      expect(obj.description).toBe("wooden table");
      expect(obj.width).toBeCloseTo(0.6);
      expect(obj.height).toBeCloseTo(0.6);
      expect(obj.shape_type).toBe("polygon");
      expect(obj.vertices).toHaveLength(4);
      expect(obj.id).toBeTruthy();
    });

    it("capitalizes first letter of name", () => {
      const obj = createFallbackObject("a red ball");
      expect(obj.name).toBe("A red ball");
    });

    it("generates unique IDs", () => {
      const obj1 = createFallbackObject("object 1");
      const obj2 = createFallbackObject("object 2");
      expect(obj1.id).not.toBe(obj2.id);
    });

    it("has valid physics properties", () => {
      const obj = createFallbackObject("test");
      expect(obj.mass).toBeGreaterThan(0);
      expect(obj.friction).toBeGreaterThanOrEqual(0);
      expect(obj.friction).toBeLessThanOrEqual(1);
      expect(obj.restitution).toBeGreaterThanOrEqual(0);
      expect(obj.restitution).toBeLessThanOrEqual(1);
      expect(obj.density).toBeGreaterThan(0);
    });
  });
});

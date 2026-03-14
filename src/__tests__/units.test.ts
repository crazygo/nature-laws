import { describe, it, expect } from "vitest";
import { SCALE, toMeters, toUnits } from "@/lib/units";

describe("units", () => {
  describe("SCALE", () => {
    it("equals 50 units per meter", () => {
      expect(SCALE).toBe(50);
    });
  });

  describe("toUnits", () => {
    it("converts meters to Matter.js units", () => {
      expect(toUnits(1)).toBe(50);
      expect(toUnits(2)).toBe(100);
      expect(toUnits(0)).toBe(0);
    });

    it("converts common real-world objects to expected unit sizes", () => {
      // Basketball: 24 cm diameter → 12 units diameter (0.24 m * 50 = 12 units)
      expect(toUnits(0.24)).toBeCloseTo(12, 5);
      // Adult human height: 1.7 m → 85 units
      expect(toUnits(1.7)).toBeCloseTo(85, 5);
      // Basketball court width: 28 m → 1400 units
      expect(toUnits(28)).toBeCloseTo(1400, 5);
    });

    it("is the inverse of toMeters", () => {
      expect(toUnits(toMeters(100))).toBeCloseTo(100, 10);
      expect(toUnits(toMeters(1))).toBeCloseTo(1, 10);
    });
  });

  describe("toMeters", () => {
    it("converts Matter.js units to meters", () => {
      expect(toMeters(50)).toBe(1);
      expect(toMeters(100)).toBe(2);
      expect(toMeters(0)).toBe(0);
    });

    it("is the inverse of toUnits", () => {
      expect(toMeters(toUnits(1.7))).toBeCloseTo(1.7, 10);
      expect(toMeters(toUnits(0.24))).toBeCloseTo(0.24, 10);
    });
  });

  describe("gravity validation", () => {
    it("gravity scale produces realistic acceleration near 9.81 m/s²", () => {
      // gravity.scale = 9.81 * SCALE / 1e6 (units/ms²)
      // After 1 second (60 frames at 16.67ms delta):
      // displacement ≈ 0.5 * g_units * t_s² = 0.5 * (9.81 * SCALE) * 1² ≈ 245 units
      const gravityScale = (9.81 * SCALE) / 1e6;
      const deltaMs = 1000 / 60;
      const frames = 60; // 1 second

      // Verlet: displacement = Σ(a * deltaMs²) for each frame
      // = frames * (frames + 1) / 2 * gravityScale * deltaMs²
      const displacement =
        ((frames * (frames + 1)) / 2) * gravityScale * deltaMs * deltaMs;

      // Expected: 0.5 * 9.81 m/s² * 1 s² * SCALE units/m ≈ 245 units
      // Allow ±5% tolerance for discrete frame summation vs. continuous integration
      // toBeCloseTo(1, 1) checks the ratio is within ±0.05 (5%)
      const expected = 0.5 * 9.81 * SCALE;
      expect(displacement / expected).toBeCloseTo(1, 1);
    });
  });
});

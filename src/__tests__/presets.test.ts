import { describe, it, expect } from "vitest";
import { PRESETS, PRESET_CATEGORIES } from "@/lib/presets";
import { Preset } from "@/lib/types";

describe("presets", () => {
  describe("PRESETS array", () => {
    it("is non-empty", () => {
      expect(PRESETS.length).toBeGreaterThan(0);
    });

    it("includes all initial preset ids", () => {
      const ids = PRESETS.map((p) => p.id);
      // Verify specific required preset IDs rather than a hard-coded count
      expect(ids).toContain("preset-cube");
      expect(ids).toContain("preset-plank");
      expect(ids).toContain("preset-ball-soccer");
      expect(ids).toContain("preset-ball-basketball");
      expect(ids).toContain("preset-ramp");
      expect(ids).toContain("preset-springboard");
      expect(ids).toContain("preset-fixed-platform");
      expect(ids).toContain("preset-wall");
      expect(ids).toContain("preset-hinge");
      expect(ids).toContain("preset-elastic-rope");
      expect(ids).toContain("preset-switch-trigger");
      expect(ids).toContain("preset-conveyor-belt");
      expect(ids).toContain("preset-magnet");
      expect(ids).toContain("preset-gear");
      expect(ids).toContain("preset-one-way-gate");
      expect(ids).toContain("preset-gravity-zone");
      expect(ids).toContain("preset-lego-figure");
    });

    it("every preset has required fields", () => {
      for (const preset of PRESETS) {
        expect(preset.id, `${preset.name} missing id`).toBeTruthy();
        expect(preset.name, `${preset.id} missing name`).toBeTruthy();
        expect(preset.description, `${preset.id} missing description`).toBeTruthy();
        expect(preset.category, `${preset.id} missing category`).toBeTruthy();
        expect(typeof preset.width).toBe("number");
        expect(typeof preset.height).toBe("number");
        expect(preset.width).toBeGreaterThan(0);
        expect(preset.height).toBeGreaterThan(0);
        expect(preset.color, `${preset.id} missing color`).toBeTruthy();
        expect(typeof preset.friction).toBe("number");
        expect(typeof preset.restitution).toBe("number");
        expect(typeof preset.density).toBe("number");
        expect(["polygon", "circle", "composite"]).toContain(preset.shape_type);
      }
    });

    it("all preset ids are unique", () => {
      const ids = PRESETS.map((p) => p.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it("all preset ids start with 'preset-'", () => {
      for (const preset of PRESETS) {
        expect(preset.id).toMatch(/^preset-/);
      }
    });

    it("polygon presets have vertices arrays with at least 3 points", () => {
      const polygonPresets = PRESETS.filter(
        (p) => p.shape_type === "polygon" && !p.pending
      );
      for (const preset of polygonPresets) {
        expect(
          preset.vertices,
          `${preset.name} is polygon but missing vertices`
        ).toBeDefined();
        expect(preset.vertices!.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe("native presets (non-pending)", () => {
    const nativePresets = PRESETS.filter((p: Preset) => !p.pending);

    it("has at least 8 native presets", () => {
      expect(nativePresets.length).toBeGreaterThanOrEqual(8);
    });

    it("static presets (fixed-platform, wall) have isStatic=true", () => {
      const staticPresets = nativePresets.filter((p) => p.isStatic);
      const staticIds = staticPresets.map((p) => p.id);
      expect(staticIds).toContain("preset-fixed-platform");
      expect(staticIds).toContain("preset-wall");
    });

    it("ball presets have circle shape_type", () => {
      const soccer = PRESETS.find((p) => p.id === "preset-ball-soccer");
      const basketball = PRESETS.find((p) => p.id === "preset-ball-basketball");
      expect(soccer?.shape_type).toBe("circle");
      expect(basketball?.shape_type).toBe("circle");
    });

    it("basketball has higher restitution than soccer ball", () => {
      const soccer = PRESETS.find((p) => p.id === "preset-ball-soccer")!;
      const basketball = PRESETS.find(
        (p) => p.id === "preset-ball-basketball"
      )!;
      expect(basketball.restitution).toBeGreaterThan(soccer.restitution);
    });

    it("springboard has high restitution (>= 0.8)", () => {
      const springboard = PRESETS.find((p) => p.id === "preset-springboard")!;
      expect(springboard.restitution).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("pending presets", () => {
    const pendingPresets = PRESETS.filter((p: Preset) => p.pending === true);

    it("has pending presets", () => {
      expect(pendingPresets.length).toBeGreaterThan(0);
    });

    it("pending presets include custom mechanisms", () => {
      const ids = pendingPresets.map((p) => p.id);
      expect(ids).toContain("preset-conveyor-belt");
      expect(ids).toContain("preset-magnet");
      expect(ids).toContain("preset-gear");
      expect(ids).toContain("preset-one-way-gate");
      expect(ids).toContain("preset-gravity-zone");
      expect(ids).toContain("preset-lego-figure");
    });

    it("pending presets still have valid physics properties", () => {
      for (const preset of pendingPresets) {
        expect(preset.width).toBeGreaterThan(0);
        expect(preset.height).toBeGreaterThan(0);
        expect(preset.restitution).toBeGreaterThanOrEqual(0);
        expect(preset.friction).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("PRESET_CATEGORIES", () => {
    it("maps all categories used by presets to display names", () => {
      const usedCategories = new Set(PRESETS.map((p) => p.category));
      for (const cat of usedCategories) {
        expect(
          PRESET_CATEGORIES[cat],
          `Missing display name for category "${cat}"`
        ).toBeTruthy();
      }
    });
  });
});

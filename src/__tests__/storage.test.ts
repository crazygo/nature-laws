import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadAssets,
  saveAssets,
  loadVersions,
  saveVersions,
  loadAIConfig,
  saveAIConfig,
} from "@/lib/storage";
import { GeneratedObject, CanvasVersion, AIConfig } from "@/lib/types";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("assets", () => {
    it("returns empty array when no assets saved", () => {
      expect(loadAssets()).toEqual([]);
    });

    it("saves and loads assets", () => {
      const assets: GeneratedObject[] = [
        {
          id: "test-1",
          name: "Test Object",
          description: "A test object",
          svg_path: "M0,0 L10,0 L10,10 L0,10 Z",
          width: 50,
          height: 50,
          color: "#ff0000",
          mass: 1,
          friction: 0.5,
          frictionStatic: 0.5,
          restitution: 0.3,
          density: 0.001,
          shape_type: "polygon",
          vertices: [
            { x: 0, y: 0 },
            { x: 50, y: 0 },
            { x: 50, y: 50 },
            { x: 0, y: 50 },
          ],
        },
      ];

      saveAssets(assets);
      const loaded = loadAssets();
      expect(loaded).toEqual(assets);
      expect(loaded).toHaveLength(1);
      expect(loaded[0].name).toBe("Test Object");
    });

    it("handles corrupt localStorage data", () => {
      localStorage.setItem("nature_laws_assets", "not-valid-json");
      expect(loadAssets()).toEqual([]);
    });
  });

  describe("versions", () => {
    it("returns empty array when no versions saved", () => {
      expect(loadVersions()).toEqual([]);
    });

    it("saves and loads versions", () => {
      const versions: CanvasVersion[] = [
        {
          id: "v-1",
          name: "Tower v1",
          objects: [
            {
              id: "obj-1",
              assetId: "asset-1",
              x: 100,
              y: 200,
              angle: 0,
              velocityX: 0,
              velocityY: 0,
            },
          ],
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      saveVersions(versions);
      const loaded = loadVersions();
      expect(loaded).toEqual(versions);
      expect(loaded[0].name).toBe("Tower v1");
      expect(loaded[0].objects).toHaveLength(1);
    });
  });

  describe("AI config", () => {
    it("returns null when no config saved", () => {
      expect(loadAIConfig()).toBeNull();
    });

    it("saves and loads AI config", () => {
      const config: AIConfig = {
        provider: "gemini",
        model: "gemini-2.0-flash",
        apiKey: "test-key",
      };

      saveAIConfig(config);
      const loaded = loadAIConfig();
      expect(loaded).toEqual(config);
      expect(loaded?.apiKey).toBe("test-key");
    });
  });
});

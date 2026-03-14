import { describe, it, expect } from "vitest";
import Matter from "matter-js";
import {
  addObjectToWorld,
  clearWorld,
  checkStability,
} from "@/lib/physics";
import { GeneratedObject } from "@/lib/types";

function createTestEngine(): Matter.Engine {
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 },
  });

  // Add ground
  const ground = Matter.Bodies.rectangle(400, 610, 800, 20, {
    isStatic: true,
    label: "ground",
  });
  Matter.Composite.add(engine.world, ground);

  return engine;
}

const testAsset: GeneratedObject = {
  id: "test-asset",
  name: "Test Box",
  description: "A test box",
  svg_path: "M0,0 L1,0 L1,1 L0,1 Z",
  width: 1.0,
  height: 1.0,
  color: "#ff0000",
  mass: 1,
  friction: 0.5,
  frictionStatic: 0.5,
  restitution: 0.3,
  density: 0.001,
  shape_type: "polygon",
  vertices: [
    { x: 0, y: 0 },
    { x: 1.0, y: 0 },
    { x: 1.0, y: 1.0 },
    { x: 0, y: 1.0 },
  ],
};

const circleAsset: GeneratedObject = {
  id: "test-circle",
  name: "Test Ball",
  description: "A test ball",
  svg_path: "",
  width: 0.8,
  height: 0.8,
  color: "#00ff00",
  mass: 1,
  friction: 0.5,
  frictionStatic: 0.5,
  restitution: 0.8,
  density: 0.001,
  shape_type: "circle",
};

describe("physics", () => {
  describe("addObjectToWorld", () => {
    it("adds a polygon body to the world", () => {
      const engine = createTestEngine();
      const body = addObjectToWorld(engine, testAsset, 200, 100);

      expect(body).toBeDefined();
      expect(body.position.x).toBeCloseTo(200, 0);
      expect(body.position.y).toBeCloseTo(100, 0);
      expect(body.label).toBe("test-asset");

      const allBodies = Matter.Composite.allBodies(engine.world);
      const dynamicBodies = allBodies.filter((b) => !b.isStatic);
      expect(dynamicBodies).toHaveLength(1);

      Matter.Engine.clear(engine);
    });

    it("adds a circle body to the world", () => {
      const engine = createTestEngine();
      const body = addObjectToWorld(engine, circleAsset, 300, 150);

      expect(body).toBeDefined();
      expect(body.label).toBe("test-circle");

      Matter.Engine.clear(engine);
    });

    it("applies correct physics properties", () => {
      const engine = createTestEngine();
      const body = addObjectToWorld(engine, testAsset, 200, 100);

      expect(body.friction).toBe(0.5);
      expect(body.frictionStatic).toBe(0.5);
      expect(body.restitution).toBe(0.3);
      expect(body.density).toBe(0.001);

      Matter.Engine.clear(engine);
    });

    it("applies optional angle and velocity", () => {
      const engine = createTestEngine();
      const body = addObjectToWorld(engine, testAsset, 200, 100, {
        angle: Math.PI / 4,
        velocityX: 2,
        velocityY: -1,
      });

      expect(body.angle).toBeCloseTo(Math.PI / 4);
      expect(body.velocity.x).toBeCloseTo(2);
      expect(body.velocity.y).toBeCloseTo(-1);

      Matter.Engine.clear(engine);
    });
  });

  describe("clearWorld", () => {
    it("removes all dynamic bodies but keeps static ones", () => {
      const engine = createTestEngine();
      addObjectToWorld(engine, testAsset, 200, 100);
      addObjectToWorld(engine, circleAsset, 300, 100);

      const beforeAll = Matter.Composite.allBodies(engine.world);
      const beforeDynamic = beforeAll.filter((b) => !b.isStatic);
      expect(beforeDynamic).toHaveLength(2);

      clearWorld(engine);

      const afterAll = Matter.Composite.allBodies(engine.world);
      const afterDynamic = afterAll.filter((b) => !b.isStatic);
      const afterStatic = afterAll.filter((b) => b.isStatic);
      expect(afterDynamic).toHaveLength(0);
      expect(afterStatic.length).toBeGreaterThan(0);

      Matter.Engine.clear(engine);
    });
  });

  describe("checkStability", () => {
    it("returns false when no dynamic bodies exist", () => {
      const engine = createTestEngine();
      const isStable = checkStability(engine, 600);
      expect(isStable).toBe(false);

      Matter.Engine.clear(engine);
    });

    it("returns true when objects are at rest", () => {
      const engine = createTestEngine();
      const body = addObjectToWorld(engine, testAsset, 200, 580);

      // Manually set velocity to zero (simulating rest)
      Matter.Body.setVelocity(body, { x: 0, y: 0 });

      const isStable = checkStability(engine, 600);
      expect(isStable).toBe(true);

      Matter.Engine.clear(engine);
    });

    it("returns false when objects are moving fast", () => {
      const engine = createTestEngine();
      const body = addObjectToWorld(engine, testAsset, 200, 100);

      // Set high velocity (simulating falling)
      Matter.Body.setVelocity(body, { x: 0, y: 5 });

      const isStable = checkStability(engine, 600);
      expect(isStable).toBe(false);

      Matter.Engine.clear(engine);
    });
  });
});

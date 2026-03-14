import Matter from "matter-js";
import { GeneratedObject } from "./types";
import { SCALE, toUnits } from "./units";

const {
  Engine,
  Bodies,
  Composite,
  Mouse,
  MouseConstraint,
  Runner,
} = Matter;

export interface PhysicsWorld {
  engine: Matter.Engine;
  runner: Matter.Runner;
  ground: Matter.Body;
  wallLeft: Matter.Body;
  wallRight: Matter.Body;
  mouseConstraint: Matter.MouseConstraint | null;
}

export function createPhysicsWorld(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): PhysicsWorld {
  const engine = Engine.create({
    // Realistic gravity: 9.81 m/s² expressed in Matter.js units.
    // gravity.scale = g * SCALE / (1000 ms/s)^2, giving ~9.81 m/s² at SCALE=50.
    gravity: { x: 0, y: 1, scale: (9.81 * SCALE) / 1e6 },
  });

  const wallThickness = 50;
  const ground = Bodies.rectangle(
    width / 2,
    height + wallThickness / 2,
    width * 2,
    wallThickness,
    {
      isStatic: true,
      label: "ground",
      render: { fillStyle: "#4a5568" },
      friction: 0.8,
      frictionStatic: 1.0,
    }
  );

  const wallLeft = Bodies.rectangle(
    -wallThickness / 2,
    height / 2,
    wallThickness,
    height * 2,
    {
      isStatic: true,
      label: "wallLeft",
      render: { fillStyle: "transparent" },
    }
  );

  const wallRight = Bodies.rectangle(
    width + wallThickness / 2,
    height / 2,
    wallThickness,
    height * 2,
    {
      isStatic: true,
      label: "wallRight",
      render: { fillStyle: "transparent" },
    }
  );

  Composite.add(engine.world, [ground, wallLeft, wallRight]);

  const mouse = Mouse.create(canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false },
    },
  });
  Composite.add(engine.world, mouseConstraint);

  const runner = Runner.create();
  Runner.run(runner, engine);

  return { engine, runner, ground, wallLeft, wallRight, mouseConstraint };
}

export function addObjectToWorld(
  engine: Matter.Engine,
  asset: GeneratedObject,
  x: number,
  y: number,
  options?: { angle?: number; velocityX?: number; velocityY?: number }
): Matter.Body {
  let body: Matter.Body;

  const sharedOptions = {
    label: asset.id,
    density: asset.density,
    friction: asset.friction,
    frictionStatic: asset.frictionStatic,
    restitution: asset.restitution,
    isStatic: asset.isStatic ?? false,
    render: { fillStyle: asset.color },
  };

  if (asset.shape_type === "circle") {
    const radius = toUnits(Math.min(asset.width, asset.height) / 2);
    body = Bodies.circle(x, y, radius, sharedOptions);
  } else if (
    asset.shape_type === "polygon" &&
    asset.vertices &&
    asset.vertices.length >= 3
  ) {
    const centeredVertices = asset.vertices.map((v) => ({
      x: toUnits(v.x) - toUnits(asset.width) / 2,
      y: toUnits(v.y) - toUnits(asset.height) / 2,
    }));
    body = Bodies.fromVertices(x, y, [centeredVertices], sharedOptions);
  } else {
    body = Bodies.rectangle(
      x,
      y,
      toUnits(asset.width),
      toUnits(asset.height),
      sharedOptions
    );
  }

  Composite.add(engine.world, body);

  if (options?.angle !== undefined) {
    Matter.Body.setAngle(body, options.angle);
  }
  if (options?.velocityX !== undefined || options?.velocityY !== undefined) {
    Matter.Body.setVelocity(body, {
      x: options?.velocityX ?? 0,
      y: options?.velocityY ?? 0,
    });
  }

  return body;
}

export function removeBodyFromWorld(
  engine: Matter.Engine,
  body: Matter.Body
): void {
  Composite.remove(engine.world, body);
}

export function clearWorld(engine: Matter.Engine): void {
  const bodies = Composite.allBodies(engine.world);
  const dynamicBodies = bodies.filter((b) => !b.isStatic);
  for (const body of dynamicBodies) {
    Composite.remove(engine.world, body);
  }
}

export function getGroundY(height: number): number {
  return height;
}

export function checkStability(
  engine: Matter.Engine,
  groundY: number
): boolean {
  const bodies = Composite.allBodies(engine.world);
  const dynamicBodies = bodies.filter((b) => !b.isStatic);

  for (const body of dynamicBodies) {
    const speed = Math.sqrt(
      body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y
    );
    if (speed > 0.5) {
      return false;
    }
    if (body.position.y > groundY + 10) {
      return false;
    }
  }

  return dynamicBodies.length > 0;
}

export function destroyPhysicsWorld(world: PhysicsWorld): void {
  Runner.stop(world.runner);
  Engine.clear(world.engine);
}

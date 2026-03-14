import Matter from "matter-js";
import { GeneratedObject } from "./types";

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
    gravity: { x: 0, y: 1, scale: 0.001 },
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
  y: number
): Matter.Body {
  let body: Matter.Body;

  if (asset.shape_type === "circle") {
    const radius = Math.min(asset.width, asset.height) / 2;
    body = Bodies.circle(x, y, radius, {
      label: asset.id,
      density: asset.density,
      friction: asset.friction,
      frictionStatic: asset.frictionStatic,
      restitution: asset.restitution,
      render: { fillStyle: asset.color },
    });
  } else if (
    asset.shape_type === "polygon" &&
    asset.vertices &&
    asset.vertices.length >= 3
  ) {
    const centeredVertices = asset.vertices.map((v) => ({
      x: v.x - asset.width / 2,
      y: v.y - asset.height / 2,
    }));
    body = Bodies.fromVertices(x, y, [centeredVertices], {
      label: asset.id,
      density: asset.density,
      friction: asset.friction,
      frictionStatic: asset.frictionStatic,
      restitution: asset.restitution,
      render: { fillStyle: asset.color },
    });
  } else {
    body = Bodies.rectangle(x, y, asset.width, asset.height, {
      label: asset.id,
      density: asset.density,
      friction: asset.friction,
      frictionStatic: asset.frictionStatic,
      restitution: asset.restitution,
      render: { fillStyle: asset.color },
    });
  }

  Composite.add(engine.world, body);
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

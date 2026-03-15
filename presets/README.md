# Preset Component Library

This directory contains JSON definitions for the physics sandbox preset objects.
Each file defines one component that appears in the **Presets** panel of the UI.

## File Format

Each JSON file must conform to the `Preset` interface (see `src/lib/types.ts`).

```jsonc
{
  // Unique identifier — must start with "preset-" and be kebab-case
  "id": "preset-my-component",

  // Display name shown in the UI
  "name": "My Component",

  // Short description of the component's purpose
  "description": "What this component does",

  // Category used to group components in the panel
  // Valid values: "basic" | "ball" | "surface" | "structure" | "constraint" | "mechanism" | "figure"
  "category": "basic",

  // SVG path in meters (coordinates go from 0,0 to width×height).
  // Leave empty string "" for circles — they render automatically.
  "svg_path": "M0,0 L1,0 L1,1 L0,1 Z",

  // Bounding box dimensions in meters
  "width": 1.0,
  "height": 1.0,

  // Fill color (CSS color string)
  "color": "#8B5E3C",

  // Physical properties
  "mass": 2,           // kg
  "friction": 0.6,
  "frictionStatic": 0.8,
  "restitution": 0.2,  // bounciness 0–1
  "density": 0.003,

  // Shape used by the physics engine
  // "polygon" | "circle" | "composite"
  "shape_type": "polygon",

  // Required when shape_type is "polygon".
  // List of vertices in meters (top-left of bounding box is origin).
  "vertices": [
    { "x": 0,   "y": 0   },
    { "x": 1.0, "y": 0   },
    { "x": 1.0, "y": 1.0 },
    { "x": 0,   "y": 1.0 }
  ],

  // Optional: makes the body immovable when placed on the canvas
  "isStatic": false,

  // Optional: marks the component as not yet fully implemented.
  // It will appear greyed-out with a "soon" badge and cannot be dragged.
  "pending": false
}
```

## Adding a New Preset

1. Create a new JSON file in this directory, e.g. `my-component.json`.
2. Fill in all required fields following the format above.
3. Open `src/lib/presets.ts` and add an import for the new file, then add it to the `PRESETS` array.
4. Run `npm test` to verify nothing is broken.
5. Run `npm run build` to make sure the project compiles.

## Existing Presets

### Native Support (fully functional)

| File | Name | Category |
|------|------|----------|
| `cube.json` | Cube | Basic Shapes |
| `plank.json` | Plank | Basic Shapes |
| `ball-soccer.json` | Soccer Ball | Balls |
| `ball-basketball.json` | Basketball | Balls |
| `ramp.json` | Ramp | Surfaces |
| `springboard.json` | Springboard | Surfaces |
| `fixed-platform.json` | Fixed Platform | Structures |
| `wall.json` | Wall | Structures |

### Pending Implementation

| File | Name | Category | Notes |
|------|------|----------|-------|
| `hinge.json` | Hinge / Pivot | Constraints | Requires Matter.js constraint |
| `elastic-rope.json` | Elastic Rope | Constraints | Requires Matter.js constraint |
| `switch-trigger.json` | Switch Trigger | Mechanisms | Requires collision event handling |
| `conveyor-belt.json` | Conveyor Belt | Mechanisms | Requires `Body.applyForce` on contact |
| `magnet.json` | Magnet | Mechanisms | Requires distance-based force calculation |
| `gear.json` | Gear | Mechanisms | Requires angular velocity coupling |
| `one-way-gate.json` | One-way Gate | Mechanisms | Requires `collisionFilter` + event logic |
| `gravity-zone.json` | Gravity Zone | Mechanisms | Requires area detection + custom force |
| `lego-figure.json` | Lego Figure | Figures | Requires compound body assembly |

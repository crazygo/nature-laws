export interface GeneratedObject {
  id: string;
  name: string;
  description: string;
  /** SVG path with coordinates in meters, matching the width × height bounding box */
  svg_path: string;
  /** Width in meters */
  width: number;
  /** Height in meters */
  height: number;
  color: string;
  /** Mass in kg */
  mass: number;
  friction: number;
  frictionStatic: number;
  restitution: number;
  density: number;
  shape_type: "polygon" | "circle" | "composite";
  /** Vertices in meters, expected/used when shape_type is polygon */
  vertices?: Array<{ x: number; y: number }>;
  /** If true, the body is immovable (static) in the physics simulation */
  isStatic?: boolean;
}

/** A preset component available in the preset library. */
export interface Preset extends GeneratedObject {
  /** Category grouping for display in the preset library */
  category: string;
  /**
   * When true the special behaviour for this component is not yet implemented.
   * The object can still be placed on the canvas with basic physics.
   */
  pending?: boolean;
}

export interface CanvasObject {
  id: string;
  assetId: string;
  x: number;
  y: number;
  angle: number;
  velocityX: number;
  velocityY: number;
}

export interface CanvasVersion {
  id: string;
  name: string;
  objects: CanvasObject[];
  createdAt: string;
}

export interface CanvasState {
  id: string;
  name: string;
  objects: CanvasObject[];
  versions: CanvasVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface AIConfig {
  provider: "gemini";
  model: string;
  apiKey: string;
}

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

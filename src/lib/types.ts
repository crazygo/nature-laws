export interface GeneratedObject {
  id: string;
  name: string;
  description: string;
  svg_path: string;
  width: number;
  height: number;
  color: string;
  mass: number;
  friction: number;
  frictionStatic: number;
  restitution: number;
  density: number;
  shape_type: "polygon" | "circle" | "composite";
  vertices?: Array<{ x: number; y: number }>;
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

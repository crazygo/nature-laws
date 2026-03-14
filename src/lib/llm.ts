import { GeneratedObject } from "./types";

const SYSTEM_PROMPT = `You are an object generator for a 2D physics stacking game called "Nature Laws".

Given a description of an object, generate a JSON object with these properties:
- name: A clean, title-cased name for the object
- description: Brief description of the object
- svg_path: An SVG path string (d attribute) that represents the object's silhouette. The path should be a closed shape within a coordinate system where (0,0) is top-left. Keep paths simple (under 30 vertices).
- width: Width in pixels (10-300)
- height: Height in pixels (10-300)
- color: A hex color string representing the object's primary color
- mass: Mass in kg (0.1-100)
- friction: Friction coefficient (0-1)
- frictionStatic: Static friction coefficient (0-1)
- restitution: Bounciness (0-1, where 0 = no bounce, 1 = perfect bounce)
- density: Material density (0.0001-0.01)
- shape_type: One of "polygon", "circle", or "composite"
- vertices: Array of {x, y} points defining the shape outline (required for polygon type). Points should be in clockwise order, relative to top-left (0,0). Keep under 8 vertices for stability.

Material reference:
| Material | Friction | Restitution | Density |
|----------|----------|-------------|---------|
| Wood     | 0.5      | 0.3         | 0.001   |
| Metal    | 0.4      | 0.2         | 0.008   |
| Glass    | 0.2      | 0.1         | 0.003   |
| Rubber   | 0.9      | 0.8         | 0.001   |
| Stone    | 0.7      | 0.1         | 0.006   |

IMPORTANT: Return ONLY valid JSON, no markdown, no code fences, no explanation. Just the JSON object.
For simple rectangular objects (tables, books, boxes), use shape_type "polygon" with 4 corner vertices.
For round objects (balls, bottles), use shape_type "circle".
Make the shapes realistic but simple enough for a physics engine.`;

export async function generateObject(
  description: string,
  apiKey: string,
  model: string = "gemini-2.0-flash"
): Promise<GeneratedObject> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              {
                text: `Generate a physics object for: "${description}"`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No response from LLM");
  }

  const parsed = JSON.parse(text);

  const obj: GeneratedObject = {
    id: crypto.randomUUID(),
    name: parsed.name || description,
    description: parsed.description || description,
    svg_path: parsed.svg_path || "",
    width: clamp(parsed.width || 50, 10, 300),
    height: clamp(parsed.height || 50, 10, 300),
    color: parsed.color || "#8B4513",
    mass: clamp(parsed.mass || 1, 0.1, 100),
    friction: clamp(parsed.friction || 0.5, 0, 1),
    frictionStatic: clamp(parsed.frictionStatic || 0.5, 0, 1),
    restitution: clamp(parsed.restitution || 0.3, 0, 1),
    density: clamp(parsed.density || 0.001, 0.0001, 0.01),
    shape_type: parsed.shape_type || "polygon",
    vertices: parsed.vertices,
  };

  return obj;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function createFallbackObject(description: string): GeneratedObject {
  return {
    id: crypto.randomUUID(),
    name: description.charAt(0).toUpperCase() + description.slice(1),
    description,
    svg_path: "M0,0 L60,0 L60,60 L0,60 Z",
    width: 60,
    height: 60,
    color: "#8B4513",
    mass: 1,
    friction: 0.5,
    frictionStatic: 0.5,
    restitution: 0.3,
    density: 0.001,
    shape_type: "polygon",
    vertices: [
      { x: 0, y: 0 },
      { x: 60, y: 0 },
      { x: 60, y: 60 },
      { x: 0, y: 60 },
    ],
  };
}

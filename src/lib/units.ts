/**
 * Physics unit mapping: 1 Matter.js unit = 2 cm (0.02 m)
 *
 * This scale keeps common objects in Matter.js's recommended 10–1000 unit
 * range for stable simulation:
 *   - Adult human (1.7 m)  →  85 units  ✓
 *   - Basketball court (28 m) → 1400 units (acceptable)
 *
 * All scene data is stored in real-world units (meters, kg, m/s).
 * Conversion to Matter.js units happens only when creating physics bodies.
 */
export const SCALE = 50; // units per meter

/**
 * Convert Matter.js units to meters.
 */
export function toMeters(units: number): number {
  return units / SCALE;
}

/**
 * Convert meters to Matter.js units.
 */
export function toUnits(meters: number): number {
  return meters * SCALE;
}

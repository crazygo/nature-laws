import { GeneratedObject, CanvasVersion, AIConfig } from "./types";

const ASSET_LIBRARY_KEY = "nature_laws_assets";
const VERSIONS_KEY = "nature_laws_versions";
const AI_CONFIG_KEY = "nature_laws_ai_config";

export function loadAssets(): GeneratedObject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ASSET_LIBRARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAssets(assets: GeneratedObject[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASSET_LIBRARY_KEY, JSON.stringify(assets));
}

export function loadVersions(): CanvasVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VERSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVersions(versions: CanvasVersion[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
}

export function loadAIConfig(): AIConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAIConfig(config: AIConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

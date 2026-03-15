"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Matter from "matter-js";
import PhysicsCanvas from "@/components/PhysicsCanvas";
import AssetLibrary from "@/components/AssetLibrary";
import MobileBottomDrawer from "@/components/MobileBottomDrawer";
import ObjectInput from "@/components/ObjectInput";
import Toolbar from "@/components/Toolbar";
import VersionPanel from "@/components/VersionPanel";
import ToastContainer from "@/components/ToastContainer";
import SettingsModal from "@/components/SettingsModal";
import { GeneratedObject, CanvasVersion, Toast, AIConfig, CanvasObject } from "@/lib/types";
import { generateObject, createFallbackObject } from "@/lib/llm";
import { PhysicsWorld, checkStability, clearWorld, addObjectToWorld, ENV_BODY_LABELS } from "@/lib/physics";
import { PRESETS } from "@/lib/presets";
import {
  loadAssets,
  saveAssets,
  loadVersions,
  saveVersions,
  loadAIConfig,
} from "@/lib/storage";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PAN_STEP = 100; // canvas pixels per arrow click

export default function Home() {
  const [assets, setAssets] = useState<GeneratedObject[]>([]);
  const [versions, setVersions] = useState<CanvasVersion[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testCountdown, setTestCountdown] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [droppingAsset, setDroppingAsset] = useState<{
    asset: GeneratedObject;
    x: number;
    y: number;
  } | null>(null);

  // Mobile canvas pan offset (in canvas pixels)
  const [panOffset, setPanOffset] = useState(0);
  // Measured container width for scaling
  const [containerWidth, setContainerWidth] = useState<number>(CANVAS_WIDTH);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const physicsWorldRef = useRef<PhysicsWorld | null>(null);
  const testIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Observe canvas container width for responsive scaling
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(container);
    setContainerWidth(container.clientWidth);
    return () => observer.disconnect();
  }, []);

  // Keep canvas at native scale; panning lets users navigate on narrow screens
  // Max pan offset: how many canvas pixels are hidden to the right
  const maxPan = Math.max(0, CANVAS_WIDTH - containerWidth);

  const handlePanLeft = useCallback(() => {
    setPanOffset((prev) => Math.max(0, prev - PAN_STEP));
  }, []);

  const handlePanRight = useCallback(() => {
    setPanOffset((prev) => Math.min(maxPan, prev + PAN_STEP));
  }, [maxPan]);

  // Reset pan when scale changes (e.g., window resize brings canvas back into view)
  useEffect(() => {
    setPanOffset((prev) => Math.min(prev, maxPan));
  }, [maxPan]);

  // Load persisted data
  useEffect(() => {
    setAssets(loadAssets());
    setVersions(loadVersions());
    setAiConfig(loadAIConfig());
  }, []);

  // Cleanup test interval on unmount
  useEffect(() => {
    return () => {
      if (testIntervalRef.current) {
        clearInterval(testIntervalRef.current);
      }
    };
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const toast: Toast = { id: crypto.randomUUID(), message, type };
      setToasts((prev) => [...prev, toast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleWorldReady = useCallback((world: PhysicsWorld) => {
    physicsWorldRef.current = world;
  }, []);

  const handleCreateObject = useCallback(
    async (description: string) => {
      const config = aiConfig || loadAIConfig();
      if (!config?.apiKey) {
        setSettingsOpen(true);
        addToast("Please configure your API key first", "error");
        return;
      }

      setIsLoading(true);
      try {
        const obj = await generateObject(description, config.apiKey, config.model);
        setAssets((prev) => {
          const next = [...prev, obj];
          saveAssets(next);
          return next;
        });
        addToast(`"${obj.name}" created!`, "success");
      } catch (error) {
        console.error("Failed to generate object:", error);
        addToast(
          `Failed to create object: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error"
        );
        // Add fallback object
        const fallback = createFallbackObject(description);
        setAssets((prev) => {
          const next = [...prev, fallback];
          saveAssets(next);
          return next;
        });
        addToast(`Created fallback "${fallback.name}" (LLM unavailable)`, "info");
      } finally {
        setIsLoading(false);
      }
    },
    [aiConfig, addToast]
  );

  const handleRemoveAsset = useCallback(
    (id: string) => {
      setAssets((prev) => {
        const next = prev.filter((a) => a.id !== id);
        saveAssets(next);
        return next;
      });
      addToast("Object removed from library", "info");
    },
    [addToast]
  );

  const handleTestStability = useCallback(() => {
    if (!physicsWorldRef.current || isTesting) return;

    // Clear any previous interval
    if (testIntervalRef.current) {
      clearInterval(testIntervalRef.current);
    }

    setIsTesting(true);
    setTestCountdown(3);

    let count = 3;
    testIntervalRef.current = setInterval(() => {
      count--;
      setTestCountdown(count);

      if (count <= 0) {
        if (testIntervalRef.current) {
          clearInterval(testIntervalRef.current);
        }
        testIntervalRef.current = null;
        const isStable = checkStability(
          physicsWorldRef.current!.engine,
          CANVAS_HEIGHT
        );
        setIsTesting(false);
        setTestCountdown(null);

        if (isStable) {
          addToast("Success! Structure is stable 🎉", "success");
        } else {
          addToast("Structure is not stable yet. Keep trying!", "error");
        }
      }
    }, 1000);
  }, [isTesting, addToast]);

  const handleSaveVersion = useCallback(() => {
    const name = prompt("Enter version name:", `Version ${versions.length + 1}`);
    if (!name) return;

    const canvasObjects: CanvasObject[] = [];

    // Capture current body positions from physics world
    if (physicsWorldRef.current) {
      const bodies = Matter.Composite.allBodies(
        physicsWorldRef.current.engine.world
      );
      for (const b of bodies) {
        // Skip environment bodies (ground, walls); include user-placed statics (e.g. Fixed Platform)
        if (ENV_BODY_LABELS.has(b.label)) continue;
        canvasObjects.push({
          id: crypto.randomUUID(),
          assetId: b.label,
          x: b.position.x,
          y: b.position.y,
          angle: b.angle,
          velocityX: b.velocity.x,
          velocityY: b.velocity.y,
        });
      }
    }

    const version: CanvasVersion = {
      id: crypto.randomUUID(),
      name,
      objects: canvasObjects,
      createdAt: new Date().toISOString(),
    };

    setVersions((prev) => {
      const next = [...prev, version];
      saveVersions(next);
      return next;
    });
    addToast(`Version "${name}" saved!`, "success");
  }, [versions, addToast]);

  const handleClearCanvas = useCallback(() => {
    if (!physicsWorldRef.current) return;
    clearWorld(physicsWorldRef.current.engine);
    addToast("Canvas cleared", "info");
  }, [addToast]);

  const handleRestoreVersion = useCallback(
    (version: CanvasVersion) => {
      if (!physicsWorldRef.current) return;
      clearWorld(physicsWorldRef.current.engine);

      // Add all objects directly to the physics world
      for (const obj of version.objects) {
        const asset =
          assets.find((a) => a.id === obj.assetId) ??
          PRESETS.find((p) => p.id === obj.assetId);
        if (asset) {
          addObjectToWorld(physicsWorldRef.current.engine, asset, obj.x, obj.y, {
            angle: obj.angle,
            velocityX: obj.velocityX,
            velocityY: obj.velocityY,
          });
        }
      }

      setVersionsOpen(false);
      addToast(`Version "${version.name}" restored`, "success");
    },
    [assets, addToast]
  );

  const handleDeleteVersion = useCallback(
    (id: string) => {
      setVersions((prev) => {
        const next = prev.filter((v) => v.id !== id);
        saveVersions(next);
        return next;
      });
      addToast("Version deleted", "info");
    },
    [addToast]
  );

  const handleDropComplete = useCallback(() => {
    setDroppingAsset(null);
  }, []);

  // Tap-to-add: places asset at the upper-centre of the canvas (mobile drawer tap)
  const handleAddToCanvas = useCallback((asset: GeneratedObject) => {
    setDroppingAsset({ asset, x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 4 });
  }, []);

  const handleSaveConfig = useCallback(
    (config: AIConfig) => {
      setAiConfig(config);
      addToast("Settings saved!", "success");
    },
    [addToast]
  );

  return (
    <div className="h-dvh overflow-hidden bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            🌿 Nature Laws
          </h1>
          {/* Object input icon on mobile (collapsed), subtitle on desktop */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-gray-500">
              2D Physics Stacking Game
            </span>
            <div className="md:hidden">
              <ObjectInput
                onSubmit={handleCreateObject}
                isLoading={isLoading}
                collapsed
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full min-h-0">
        {/* Asset Library Sidebar — desktop only */}
        <aside className="hidden md:block w-48 border-r border-gray-800 bg-gray-900/50">
          <AssetLibrary assets={assets} presets={PRESETS} onRemoveAsset={handleRemoveAsset} />
        </aside>

        {/* Canvas area */}
        <main className="flex-1 flex flex-col p-4 gap-4 min-w-0">
          {/* Toolbar */}
          <Toolbar
            onTestStability={handleTestStability}
            onSaveVersion={handleSaveVersion}
            onClearCanvas={handleClearCanvas}
            isTesting={isTesting}
            testCountdown={testCountdown}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenVersions={() => setVersionsOpen(true)}
          />

          {/* Physics Canvas with pan arrows */}
          <div className="flex-1 flex items-start gap-2">
            {/* Left pan arrow */}
            <button
              onClick={handlePanLeft}
              disabled={panOffset <= 0}
              className="flex-none p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-colors self-center"
              aria-label="Pan canvas left"
            >
              ◀
            </button>

            {/* Scaled canvas container */}
            <div
              ref={canvasContainerRef}
              className="flex-1 overflow-hidden"
              style={{ height: CANVAS_HEIGHT }}
            >
              <div
                style={{
                  transform: `translateX(${-panOffset}px)`,
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                }}
              >
                <PhysicsCanvas
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  assets={assets}
                  presets={PRESETS}
                  onWorldReady={handleWorldReady}
                  droppingAsset={droppingAsset}
                  onDropComplete={handleDropComplete}
                />
              </div>
            </div>

            {/* Right pan arrow */}
            <button
              onClick={handlePanRight}
              disabled={panOffset >= maxPan}
              className="flex-none p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-colors self-center"
              aria-label="Pan canvas right"
            >
              ▶
            </button>
          </div>

          {/* Object Input — desktop only (mobile uses header icon) */}
          <div className="hidden md:block">
            <ObjectInput
              onSubmit={handleCreateObject}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Drawer — mobile only */}
      <div className="md:hidden">
        <MobileBottomDrawer
          assets={assets}
          presets={PRESETS}
          onRemoveAsset={handleRemoveAsset}
          onAddToCanvas={handleAddToCanvas}
        />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveConfig}
      />

      <VersionPanel
        versions={versions}
        isOpen={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        onRestore={handleRestoreVersion}
        onDelete={handleDeleteVersion}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

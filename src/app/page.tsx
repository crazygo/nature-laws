"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Matter from "matter-js";
import PhysicsCanvas from "@/components/PhysicsCanvas";
import AssetLibrary from "@/components/AssetLibrary";
import ObjectInput from "@/components/ObjectInput";
import Toolbar from "@/components/Toolbar";
import VersionPanel from "@/components/VersionPanel";
import ToastContainer from "@/components/ToastContainer";
import SettingsModal from "@/components/SettingsModal";
import { GeneratedObject, CanvasVersion, Toast, AIConfig, CanvasObject } from "@/lib/types";
import { generateObject, createFallbackObject } from "@/lib/llm";
import { PhysicsWorld, checkStability, clearWorld } from "@/lib/physics";
import {
  loadAssets,
  saveAssets,
  loadVersions,
  saveVersions,
  loadAIConfig,
} from "@/lib/storage";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

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

  const physicsWorldRef = useRef<PhysicsWorld | null>(null);

  // Load persisted data
  useEffect(() => {
    setAssets(loadAssets());
    setVersions(loadVersions());
    setAiConfig(loadAIConfig());
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
        const obj = await generateObject(description, config.apiKey);
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

    setIsTesting(true);
    setTestCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      setTestCountdown(count);

      if (count <= 0) {
        clearInterval(interval);
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
        if (b.isStatic) continue;
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

      // Re-add objects from version
      for (const obj of version.objects) {
        const asset = assets.find((a) => a.id === obj.assetId);
        if (asset) {
          setDroppingAsset({ asset, x: obj.x, y: obj.y });
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

  const handleSaveConfig = useCallback(
    (config: AIConfig) => {
      setAiConfig(config);
      addToast("Settings saved!", "success");
    },
    [addToast]
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            🌿 Nature Laws
          </h1>
          <span className="text-xs text-gray-500">
            2D Physics Stacking Game
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Asset Library Sidebar */}
        <aside className="w-48 border-r border-gray-800 bg-gray-900/50">
          <AssetLibrary assets={assets} onRemoveAsset={handleRemoveAsset} />
        </aside>

        {/* Canvas area */}
        <main className="flex-1 flex flex-col p-4 gap-4">
          {/* Toolbar */}
          <Toolbar
            physicsWorld={physicsWorldRef.current}
            canvasHeight={CANVAS_HEIGHT}
            onTestStability={handleTestStability}
            onSaveVersion={handleSaveVersion}
            onClearCanvas={handleClearCanvas}
            isTesting={isTesting}
            testCountdown={testCountdown}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenVersions={() => setVersionsOpen(true)}
          />

          {/* Physics Canvas */}
          <div className="flex-1 flex items-center justify-center">
            <PhysicsCanvas
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              assets={assets}
              onWorldReady={handleWorldReady}
              droppingAsset={droppingAsset}
              onDropComplete={handleDropComplete}
            />
          </div>

          {/* Object Input */}
          <ObjectInput
            onSubmit={handleCreateObject}
            isLoading={isLoading}
          />
        </main>
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

"use client";

import React from "react";
import { PhysicsWorld } from "@/lib/physics";

interface ToolbarProps {
  physicsWorld: PhysicsWorld | null;
  canvasHeight: number;
  onTestStability: () => void;
  onSaveVersion: () => void;
  onClearCanvas: () => void;
  isTesting: boolean;
  testCountdown: number | null;
  onOpenSettings: () => void;
  onOpenVersions: () => void;
}

export default function Toolbar({
  onTestStability,
  onSaveVersion,
  onClearCanvas,
  isTesting,
  testCountdown,
  onOpenSettings,
  onOpenVersions,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onTestStability}
        disabled={isTesting}
        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors flex items-center gap-1"
        title="Test if your structure is stable for 3 seconds"
      >
        {isTesting ? (
          <>
            <span className="animate-pulse">⏱</span>
            {testCountdown !== null ? `${testCountdown}s` : "Testing..."}
          </>
        ) : (
          <>🧪 Test</>
        )}
      </button>

      <button
        onClick={onSaveVersion}
        className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-500 transition-colors"
        title="Save current canvas state"
      >
        💾 Save
      </button>

      <button
        onClick={onOpenVersions}
        className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        title="View saved versions"
      >
        📋 Versions
      </button>

      <div className="flex-1" />

      <button
        onClick={onClearCanvas}
        className="px-3 py-1.5 bg-red-600/80 text-white text-sm rounded-lg hover:bg-red-500 transition-colors"
        title="Clear all objects from canvas"
      >
        🗑 Clear
      </button>

      <button
        onClick={onOpenSettings}
        className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";

interface ToolbarProps {
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
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "More" menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Primary actions — always visible */}
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

      {/* Secondary actions — visible on desktop, hidden on mobile */}
      <button
        onClick={onOpenVersions}
        className="hidden md:flex px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        title="View saved versions"
      >
        📋 Versions
      </button>

      <div className="flex-1" />

      <button
        onClick={onClearCanvas}
        className="hidden md:flex px-3 py-1.5 bg-red-600/80 text-white text-sm rounded-lg hover:bg-red-500 transition-colors"
        title="Clear all objects from canvas"
      >
        🗑 Clear
      </button>

      <button
        onClick={onOpenSettings}
        className="hidden md:flex px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        title="Settings"
      >
        ⚙️
      </button>

      {/* "More" button — visible on mobile only */}
      <div className="relative md:hidden" ref={moreRef}>
        <button
          onClick={() => setMoreOpen((v) => !v)}
          className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
          aria-label="More options"
          aria-expanded={moreOpen}
        >
          ···
        </button>
        {moreOpen && (
          <div className="absolute right-0 bottom-full mb-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
            <button
              onClick={() => { onOpenVersions(); setMoreOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
            >
              📋 Versions
            </button>
            <button
              onClick={() => { onClearCanvas(); setMoreOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
            >
              🗑 Clear Canvas
            </button>
            <button
              onClick={() => { onOpenSettings(); setMoreOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
            >
              ⚙️ Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

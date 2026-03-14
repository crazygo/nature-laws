"use client";

import React, { useState } from "react";
import { GeneratedObject, Preset } from "@/lib/types";
import { PRESET_CATEGORIES } from "@/lib/presets";

interface AssetLibraryProps {
  assets: GeneratedObject[];
  presets: Preset[];
  onRemoveAsset: (id: string) => void;
}

function AssetThumbnail({
  asset,
  pending,
}: {
  asset: GeneratedObject;
  pending?: boolean;
}) {
  const handleDragStart = (e: React.DragEvent) => {
    if (pending) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("assetId", asset.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  const renderShape = () => {
    if (asset.svg_path) {
      return (
        <path
          d={asset.svg_path}
          fill={asset.color}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.01"
        />
      );
    }
    if (asset.shape_type === "circle") {
      const r = Math.min(asset.width, asset.height) / 2;
      return (
        <circle
          cx={asset.width / 2}
          cy={asset.height / 2}
          r={r}
          fill={asset.color}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.01"
        />
      );
    }
    return (
      <rect
        x={0}
        y={0}
        width={asset.width}
        height={asset.height}
        fill={asset.color}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.01"
      />
    );
  };

  return (
    <div
      draggable={!pending}
      onDragStart={handleDragStart}
      className={`bg-gray-800 rounded-lg p-2 border border-gray-700 transition-colors ${
        pending
          ? "opacity-50 cursor-not-allowed"
          : "cursor-grab active:cursor-grabbing hover:bg-gray-700 hover:border-blue-500"
      }`}
      title={
        pending
          ? `${asset.name} — pending implementation`
          : `${asset.name}\nDrag to canvas`
      }
    >
      <div className="w-full aspect-square flex items-center justify-center mb-1 overflow-hidden relative">
        <svg
          viewBox={`0 0 ${asset.width} ${asset.height}`}
          className="w-full h-full"
          style={{ maxWidth: 80, maxHeight: 80 }}
        >
          {renderShape()}
        </svg>
        {pending && (
          <span className="absolute bottom-0 right-0 text-[8px] bg-yellow-600 text-white px-1 rounded">
            soon
          </span>
        )}
      </div>
      <p className="text-xs text-gray-300 truncate text-center">{asset.name}</p>
      <div className="flex gap-1 mt-1 text-[10px] text-gray-500 justify-center">
        {pending ? (
          <span className="text-yellow-600">pending</span>
        ) : (
          <>
            <span title="Mass">{asset.mass.toFixed(1)}kg</span>
            <span>·</span>
            <span title="Friction">f:{asset.friction.toFixed(1)}</span>
            <span>·</span>
            <span title="Bounciness">b:{asset.restitution.toFixed(1)}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function AssetLibrary({
  assets,
  presets,
  onRemoveAsset,
}: AssetLibraryProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "library">("presets");

  // Group presets by category
  const presetsByCategory = presets.reduce<Record<string, Preset[]>>(
    (acc, preset) => {
      const cat = preset.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(preset);
      return acc;
    },
    {}
  );

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-700 text-xs">
        <button
          onClick={() => setActiveTab("presets")}
          className={`flex-1 py-2 font-medium transition-colors ${
            activeTab === "presets"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Presets
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={`flex-1 py-2 font-medium transition-colors ${
            activeTab === "library"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Library ({assets.length})
        </button>
      </div>

      {/* Presets tab */}
      {activeTab === "presets" && (
        <div className="flex-1 overflow-y-auto p-2">
          {Object.entries(presetsByCategory).map(([cat, items]) => (
            <div key={cat} className="mb-3">
              <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 px-1">
                {PRESET_CATEGORIES[cat] ?? cat}
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {items.map((preset) => (
                  <AssetThumbnail
                    key={preset.id}
                    asset={preset}
                    pending={preset.pending}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Library tab */}
      {activeTab === "library" && (
        <>
          {assets.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-gray-500 text-sm text-center">
                No objects yet.
                <br />
                Create one using the input below!
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {assets.map((asset) => (
                <div key={asset.id} className="relative group">
                  <AssetThumbnail asset={asset} />
                  <button
                    onClick={() => onRemoveAsset(asset.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500"
                    aria-label="Remove from library"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="p-2 border-t border-gray-700">
        <p className="text-[10px] text-gray-500 text-center">
          Drag objects to the canvas
        </p>
      </div>
    </div>
  );
}

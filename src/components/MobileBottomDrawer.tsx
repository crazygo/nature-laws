"use client";

import React, { useState } from "react";
import { GeneratedObject, Preset } from "@/lib/types";
import { PRESET_CATEGORIES } from "@/lib/presets";

interface MobileBottomDrawerProps {
  assets: GeneratedObject[];
  presets: Preset[];
  onRemoveAsset: (id: string) => void;
}

type DrawerTab = "basic" | "items" | "library";

function AssetCard({
  asset,
  pending,
  onRemove,
}: {
  asset: GeneratedObject;
  pending?: boolean;
  onRemove?: () => void;
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
      className={`relative bg-gray-800 rounded-lg p-2 border border-gray-700 transition-colors ${
        pending
          ? "opacity-50 cursor-not-allowed"
          : "cursor-grab active:cursor-grabbing hover:bg-gray-700 hover:border-blue-500"
      }`}
      title={pending ? `${asset.name} — pending` : `${asset.name}\nDrag to canvas`}
    >
      <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${asset.width} ${asset.height}`}
          className="w-full h-full"
          style={{ maxWidth: 56, maxHeight: 56 }}
        >
          {renderShape()}
        </svg>
      </div>
      <p className="text-[10px] text-gray-300 truncate text-center mt-1">{asset.name}</p>
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-red-500"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </div>
  );
}

// Basic shape preset categories shown in first tab
const BASIC_CATEGORIES = ["basic", "ball"];
// Items/mechanisms in second tab
const ITEMS_CATEGORIES = ["surface", "structure", "constraint", "mechanism", "figure"];

export default function MobileBottomDrawer({
  assets,
  presets,
  onRemoveAsset,
}: MobileBottomDrawerProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<DrawerTab>("basic");

  const basicPresets = presets.filter((p) => BASIC_CATEGORIES.includes(p.category));
  const itemPresets = presets.filter((p) => ITEMS_CATEGORIES.includes(p.category));

  const handleTabClick = (tab: DrawerTab) => {
    if (activeTab === tab && expanded) {
      setExpanded(false);
    } else {
      setActiveTab(tab);
      setExpanded(true);
    }
  };

  const renderGrid = () => {
    if (activeTab === "basic") {
      // Group by category
      return (
        <div className="p-2 overflow-y-auto max-h-48">
          {BASIC_CATEGORIES.map((cat) => {
            const items = basicPresets.filter((p) => p.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="mb-2">
                <h3 className="text-[9px] uppercase tracking-wider text-gray-500 mb-1 px-1">
                  {PRESET_CATEGORIES[cat] ?? cat}
                </h3>
                <div className="grid grid-cols-5 gap-1">
                  {items.map((preset) => (
                    <AssetCard key={preset.id} asset={preset} pending={preset.pending} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === "items") {
      return (
        <div className="p-2 overflow-y-auto max-h-48">
          {ITEMS_CATEGORIES.map((cat) => {
            const items = itemPresets.filter((p) => p.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="mb-2">
                <h3 className="text-[9px] uppercase tracking-wider text-gray-500 mb-1 px-1">
                  {PRESET_CATEGORIES[cat] ?? cat}
                </h3>
                <div className="grid grid-cols-5 gap-1">
                  {items.map((preset) => (
                    <AssetCard key={preset.id} asset={preset} pending={preset.pending} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // library tab
    if (assets.length === 0) {
      return (
        <div className="flex items-center justify-center h-24">
          <p className="text-gray-500 text-xs text-center">
            No custom objects yet.
            <br />
            Use the ✏️ button to create one!
          </p>
        </div>
      );
    }
    return (
      <div className="p-2 overflow-y-auto max-h-48">
        <div className="grid grid-cols-5 gap-1">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onRemove={() => onRemoveAsset(asset.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="border-t border-gray-700 bg-gray-900">
      {/* Expanded grid */}
      {expanded && renderGrid()}

      {/* Tab bar */}
      <div className="flex items-center border-t border-gray-700">
        <button
          onClick={() => handleTabClick("basic")}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
            activeTab === "basic" && expanded
              ? "text-blue-400 border-t-2 border-blue-400 -mt-px"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          🔵 Basic
        </button>
        <button
          onClick={() => handleTabClick("items")}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
            activeTab === "items" && expanded
              ? "text-blue-400 border-t-2 border-blue-400 -mt-px"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          ⚙️ Items
        </button>
        <button
          onClick={() => handleTabClick("library")}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
            activeTab === "library" && expanded
              ? "text-blue-400 border-t-2 border-blue-400 -mt-px"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          📦 Library {assets.length > 0 ? `(${assets.length})` : ""}
        </button>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="px-3 py-2.5 text-gray-400 hover:text-gray-200 text-xs"
          aria-label={expanded ? "Collapse drawer" : "Expand drawer"}
        >
          {expanded ? "▼" : "▲"}
        </button>
      </div>
    </div>
  );
}

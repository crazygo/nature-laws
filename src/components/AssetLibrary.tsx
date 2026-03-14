"use client";

import React from "react";
import { GeneratedObject } from "@/lib/types";

interface AssetLibraryProps {
  assets: GeneratedObject[];
  onRemoveAsset: (id: string) => void;
}

function AssetThumbnail({ asset }: { asset: GeneratedObject }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("assetId", asset.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-gray-800 rounded-lg p-2 cursor-grab active:cursor-grabbing hover:bg-gray-700 transition-colors border border-gray-700 hover:border-blue-500"
      title={`${asset.name}\nDrag to canvas`}
    >
      <div className="w-full aspect-square flex items-center justify-center mb-1 overflow-hidden">
        <svg
          viewBox={`0 0 ${asset.width} ${asset.height}`}
          className="w-full h-full"
          style={{ maxWidth: 80, maxHeight: 80 }}
        >
          <path d={asset.svg_path} fill={asset.color} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </svg>
      </div>
      <p className="text-xs text-gray-300 truncate text-center">{asset.name}</p>
      <div className="flex gap-1 mt-1 text-[10px] text-gray-500 justify-center">
        <span title="Mass">{asset.mass.toFixed(1)}kg</span>
        <span>·</span>
        <span title="Friction">f:{asset.friction.toFixed(1)}</span>
        <span>·</span>
        <span title="Bounciness">b:{asset.restitution.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function AssetLibrary({
  assets,
  onRemoveAsset,
}: AssetLibraryProps) {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-sm font-semibold text-gray-300 px-2 py-2 border-b border-gray-700">
        Asset Library ({assets.length})
      </h2>

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
                title="Remove from library"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-2 border-t border-gray-700">
        <p className="text-[10px] text-gray-500 text-center">
          Drag objects to the canvas
        </p>
      </div>
    </div>
  );
}

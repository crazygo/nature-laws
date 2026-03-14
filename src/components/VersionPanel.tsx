"use client";

import React from "react";
import { CanvasVersion } from "@/lib/types";

interface VersionPanelProps {
  versions: CanvasVersion[];
  isOpen: boolean;
  onClose: () => void;
  onRestore: (version: CanvasVersion) => void;
  onDelete: (id: string) => void;
}

export default function VersionPanel({
  versions,
  isOpen,
  onClose,
  onRestore,
  onDelete,
}: VersionPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Saved Versions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {versions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No saved versions yet.
              <br />
              Use the Save button to save your canvas state.
            </p>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-white">
                      {version.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {version.objects.length} object
                    {version.objects.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onRestore(version)}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 transition-colors"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => onDelete(version.id)}
                      className="px-2 py-1 bg-red-600/80 text-white text-xs rounded hover:bg-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

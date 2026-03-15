"use client";

import React, { useState, useRef, useEffect } from "react";

interface ObjectInputProps {
  onSubmit: (description: string) => void;
  isLoading: boolean;
  /** When true, renders as a collapsed icon that opens a dialog on click (mobile mode). */
  collapsed?: boolean;
}

export default function ObjectInput({ onSubmit, isLoading, collapsed }: ObjectInputProps) {
  const [value, setValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (dialogOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [dialogOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue("");
    if (collapsed) setDialogOpen(false);
  };

  const form = (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Describe an object... e.g. "a wooden table"'
        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Creating...
          </>
        ) : (
          "Create"
        )}
      </button>
    </form>
  );

  if (!collapsed) {
    return form;
  }

  return (
    <>
      {/* Collapsed icon trigger */}
      <button
        onClick={() => setDialogOpen(true)}
        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors shadow-lg"
        aria-label="Create new object"
        title="Create new object"
      >
        ✏️
      </button>

      {/* Dialog overlay */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDialogOpen(false);
          }}
        >
          <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Create Object</h3>
              <button
                onClick={() => setDialogOpen(false)}
                className="text-gray-400 hover:text-white text-lg leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {form}
          </div>
        </div>
      )}
    </>
  );
}


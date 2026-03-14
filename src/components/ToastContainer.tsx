"use client";

import React, { useEffect } from "react";
import { Toast as ToastType } from "@/lib/types";

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const typeStyles: Record<string, string> = {
  success: "bg-green-600 border-green-500",
  error: "bg-red-600 border-red-500",
  info: "bg-blue-600 border-blue-500",
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastType;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`${typeStyles[toast.type] || typeStyles.info} border text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-in slide-in-from-top-2 max-w-sm`}
    >
      {toast.message}
    </div>
  );
}

export default function ToastContainer({
  toasts,
  onRemove,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

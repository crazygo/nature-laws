"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import {
  createPhysicsWorld,
  addObjectToWorld,
  destroyPhysicsWorld,
  PhysicsWorld,
  ENV_BODY_LABELS,
} from "@/lib/physics";
import { GeneratedObject, Preset } from "@/lib/types";
import { SCALE, toUnits } from "@/lib/units";

interface PhysicsCanvasProps {
  width: number;
  height: number;
  assets: GeneratedObject[];
  /** Preset objects available for drag-drop in addition to user assets. */
  presets?: Preset[];
  onWorldReady: (world: PhysicsWorld) => void;
  droppingAsset: { asset: GeneratedObject; x: number; y: number } | null;
  onDropComplete: () => void;
}

export default function PhysicsCanvas({
  width,
  height,
  assets,
  presets = [],
  onWorldReady,
  droppingAsset,
  onDropComplete,
}: PhysicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<PhysicsWorld | null>(null);
  const renderLoopRef = useRef<number | null>(null);
  const assetsRef = useRef<GeneratedObject[]>(assets);
  const presetsRef = useRef<Preset[]>(presets);

  // Keep refs in sync
  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  useEffect(() => {
    presetsRef.current = presets;
  }, [presets]);

  // Initialize physics world and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const world = createPhysicsWorld(canvas, width, height);
    worldRef.current = world;
    onWorldReady(world);

    function renderScene() {
      const ctx = canvas!.getContext("2d");
      if (!ctx || !worldRef.current) return;

      ctx.clearRect(0, 0, width, height);

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#1a1a2e");
      gradient.addColorStop(1, "#16213e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw ground line
      ctx.strokeStyle = "#4a5568";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(width, height);
      ctx.stroke();

      // Draw ground surface
      ctx.fillStyle = "#2d3748";
      ctx.fillRect(0, height - 2, width, 4);

      // Draw all bodies
      const currentAssets = assetsRef.current;
      const currentPresets = presetsRef.current;
      const allObjects = [...currentAssets, ...currentPresets];
      const bodies = Matter.Composite.allBodies(worldRef.current.engine.world);
      for (const body of bodies) {
        // Skip environment static bodies (ground, walls); draw user-placed statics
        if (ENV_BODY_LABELS.has(body.label)) continue;

        const asset = allObjects.find((a) => a.id === body.label);

        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        if (asset && asset.svg_path) {
          // Draw SVG path
          ctx.fillStyle = asset.color || "#8B4513";
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.lineWidth = 1;

          const path = new Path2D(asset.svg_path);
          // Translate to center the SVG and scale from meters to units.
          // lineWidth is set after scaling so that ctx.scale(SCALE, SCALE)
          // does not magnify it; 1/SCALE produces a 1-pixel-equivalent stroke.
          ctx.save();
          ctx.translate(-toUnits(asset.width) / 2, -toUnits(asset.height) / 2);
          ctx.scale(SCALE, SCALE);
          ctx.lineWidth = 1 / SCALE;
          ctx.fill(path);
          ctx.stroke(path);
          ctx.restore();
        } else {
          // Fallback: draw body shape from vertices
          const vertices = body.vertices;
          ctx.fillStyle =
            (body.render as { fillStyle?: string }).fillStyle || "#8B4513";
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(
            vertices[0].x - body.position.x,
            vertices[0].y - body.position.y
          );
          for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(
              vertices[i].x - body.position.x,
              vertices[i].y - body.position.y
            );
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Draw label
        if (asset) {
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(asset.name, 0, -toUnits(asset.height) / 2 - 5);
        }

        ctx.restore();
      }

      // Draw empty state hint — show when no user-placed bodies exist (dynamic or static preset)
      const userBodies = bodies.filter((b) => !ENV_BODY_LABELS.has(b.label));
      if (userBodies.length === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "Create objects and drag them here!",
          width / 2,
          height / 2
        );
      }

      renderLoopRef.current = requestAnimationFrame(renderScene);
    }

    renderLoopRef.current = requestAnimationFrame(renderScene);

    return () => {
      if (renderLoopRef.current) {
        cancelAnimationFrame(renderLoopRef.current);
      }
      destroyPhysicsWorld(world);
      worldRef.current = null;
    };
  }, [width, height, onWorldReady]);

  // Handle dropping asset
  useEffect(() => {
    if (!droppingAsset || !worldRef.current) return;

    addObjectToWorld(
      worldRef.current.engine,
      droppingAsset.asset,
      droppingAsset.x,
      droppingAsset.y
    );
    onDropComplete();
  }, [droppingAsset, onDropComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const assetId = e.dataTransfer.getData("assetId");
      if (!assetId || !worldRef.current) return;

      const asset =
        assets.find((a) => a.id === assetId) ??
        presets.find((p) => p.id === assetId);
      if (!asset) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Compensate for any CSS transform scale applied to the canvas wrapper
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      addObjectToWorld(worldRef.current.engine, asset, x, y);
    },
    [assets, presets, width, height]
  );

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-700 rounded-lg cursor-grab active:cursor-grabbing"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    />
  );
}

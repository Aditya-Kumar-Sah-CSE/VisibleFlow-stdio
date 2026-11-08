'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text as KonvaText, Arrow, Group, Transformer, Image as KonvaImage } from 'react-konva';
import { useEditorStore } from '@/stores/editor-store';
import type { CanvasElement } from '@visualflow/shared-types';
import { snapPointToGrid } from '@visualflow/editor-core';

function URLImage({ el, onSelect, onDragEnd, isSelected }: any) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!el.imageUrl) return;
    const img = new window.Image();
    img.src = el.imageUrl;
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
  }, [el.imageUrl]);

  return (
    <KonvaImage
      id={el.id}
      image={image || undefined}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      draggable={!el.isLocked}
      cornerRadius={el.style?.cornerRadius || 8}
      opacity={el.style?.opacity ?? 1}
      stroke={isSelected ? '#3b82f6' : el.style?.stroke || 'transparent'}
      strokeWidth={isSelected ? 2 : el.style?.strokeWidth || 0}
      onClick={onSelect}
      onDragEnd={onDragEnd}
    />
  );
}

interface KonvaCanvasRendererProps {
  pageWidth: number;
  pageHeight: number;
}

export default function KonvaCanvasRenderer({ pageWidth, pageHeight }: KonvaCanvasRendererProps) {
  const {
    project,
    activePageIndex,
    selectedElementIds,
    selectElement,
    deselectAll,
    updateElement,
    zoom,
    panOffset,
    showGrid,
    snapToGrid,
    gridSize,
  } = useEditorStore();

  const [mounted, setMounted] = useState(false);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activePage = project?.pages[activePageIndex];
  const elements = activePage?.elements || [];

  // Update Transformer selection
  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;
    const stage = stageRef.current;
    const selectedNodes = selectedElementIds
      .map((id) => stage.findOne('#' + id))
      .filter(Boolean);

    trRef.current.nodes(selectedNodes);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedElementIds, elements]);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
        Initializing Canvas...
      </div>
    );
  }

  const handleStageClick = (e: any) => {
    // If clicked on stage background (not on an element), deselect
    if (e.target === e.target.getStage()) {
      deselectAll();
    }
  };

  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center relative bg-slate-900 canvas-grid-pattern">
      {/* Outer Paper Canvas Shadow Wrapper */}
      <div
        style={{
          width: pageWidth * zoom,
          height: pageHeight * zoom,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          backgroundColor: activePage?.background?.color || '#ffffff',
          position: 'relative',
        }}
        className="rounded-sm transition-all"
      >
        <Stage
          ref={stageRef}
          width={pageWidth * zoom}
          height={pageHeight * zoom}
          scaleX={zoom}
          scaleY={zoom}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {elements.map((el) => {
              const isSelected = selectedElementIds.includes(el.id);

              if (el.type === 'shape') {
                if (el.shapeKind === 'circle') {
                  return (
                    <Circle
                      key={el.id}
                      id={el.id}
                      x={el.x + el.width / 2}
                      y={el.y + el.height / 2}
                      radius={Math.min(el.width, el.height) / 2}
                      fill={el.style?.fill || '#3b82f6'}
                      stroke={el.style?.stroke || '#1d4ed8'}
                      strokeWidth={el.style?.strokeWidth || 1}
                      opacity={el.style?.opacity ?? 1}
                      draggable={!el.isLocked}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        selectElement(el.id, e.evt.shiftKey);
                      }}
                      onDragEnd={(e) => {
                        let newX = e.target.x() - el.width / 2;
                        let newY = e.target.y() - el.height / 2;
                        if (snapToGrid) {
                          const snapped = snapPointToGrid({ x: newX, y: newY }, gridSize);
                          newX = snapped.x;
                          newY = snapped.y;
                        }
                        updateElement(el.id, { x: newX, y: newY });
                      }}
                    />
                  );
                }

                // Default Rectangle / Rounded Rect
                return (
                  <Group
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    draggable={!el.isLocked}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      selectElement(el.id, e.evt.shiftKey);
                    }}
                    onDragEnd={(e) => {
                      let newX = e.target.x();
                      let newY = e.target.y();
                      if (snapToGrid) {
                        const snapped = snapPointToGrid({ x: newX, y: newY }, gridSize);
                        newX = snapped.x;
                        newY = snapped.y;
                      }
                      updateElement(el.id, { x: newX, y: newY });
                    }}
                  >
                    <Rect
                      width={el.width}
                      height={el.height}
                      fill={el.style?.fill || '#3b82f6'}
                      stroke={el.style?.stroke || '#1d4ed8'}
                      strokeWidth={el.style?.strokeWidth || 1}
                      cornerRadius={el.style?.cornerRadius || 0}
                      opacity={el.style?.opacity ?? 1}
                    />
                    {el.text && (
                      <KonvaText
                        text={el.text}
                        width={el.width}
                        height={el.height}
                        fontSize={el.style?.fontSize || 14}
                        fontFamily={el.style?.fontFamily || 'Inter'}
                        fill={el.style?.color || '#ffffff'}
                        align="center"
                        verticalAlign="middle"
                        padding={8}
                      />
                    )}
                  </Group>
                );
              }

              if (el.type === 'text') {
                return (
                  <KonvaText
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    text={el.text || 'Text'}
                    fontSize={el.style?.fontSize || 18}
                    fontFamily={el.style?.fontFamily || 'Inter'}
                    fontStyle={el.style?.fontWeight === 'bold' ? 'bold' : 'normal'}
                    fill={el.style?.color || '#0f172a'}
                    align={el.style?.textAlign || 'left'}
                    draggable={!el.isLocked}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      selectElement(el.id, e.evt.shiftKey);
                    }}
                    onDragEnd={(e) => {
                      let newX = e.target.x();
                      let newY = e.target.y();
                      if (snapToGrid) {
                        const snapped = snapPointToGrid({ x: newX, y: newY }, gridSize);
                        newX = snapped.x;
                        newY = snapped.y;
                      }
                      updateElement(el.id, { x: newX, y: newY });
                    }}
                  />
                );
              }

              if (el.type === 'arrow') {
                const pts = el.points || [0, 0, el.width, 0];
                return (
                  <Arrow
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    points={pts}
                    pointerLength={10}
                    pointerWidth={10}
                    fill={el.style?.stroke || '#1e293b'}
                    stroke={el.style?.stroke || '#1e293b'}
                    strokeWidth={el.style?.strokeWidth || 2}
                    draggable={!el.isLocked}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      selectElement(el.id, e.evt.shiftKey);
                    }}
                    onDragEnd={(e) => {
                      updateElement(el.id, { x: e.target.x(), y: e.target.y() });
                    }}
                  />
                );
              }

              if (el.type === 'image') {
                return (
                  <URLImage
                    key={el.id}
                    el={el}
                    isSelected={isSelected}
                    onSelect={(e: any) => {
                      e.cancelBubble = true;
                      selectElement(el.id, e.evt.shiftKey);
                    }}
                    onDragEnd={(e: any) => {
                      let newX = e.target.x();
                      let newY = e.target.y();
                      if (snapToGrid) {
                        const snapped = snapPointToGrid({ x: newX, y: newY }, gridSize);
                        newX = snapped.x;
                        newY = snapped.y;
                      }
                      updateElement(el.id, { x: newX, y: newY });
                    }}
                  />
                );
              }

              return null;
            })}

            {/* Selection Transform Controls */}
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 10 || newBox.height < 10) return oldBox;
                return newBox;
              }}
              borderStroke="#3b82f6"
              borderDash={[3, 3]}
              anchorStroke="#2563eb"
              anchorFill="#ffffff"
              anchorSize={8}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}


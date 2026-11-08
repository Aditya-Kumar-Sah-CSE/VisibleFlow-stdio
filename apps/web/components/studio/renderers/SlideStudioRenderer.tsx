'use client';

import React, { useState, useRef } from 'react';
import {
  Presentation,
  Play,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Type,
  Square,
  Sigma,
  Palette,
  Sparkles,
  Move,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { createDefaultElement } from '@visualflow/document-schema';
import katex from 'katex';
import { compileMathASTToLatex } from '@visualflow/editor-core';
import toast from 'react-hot-toast';

interface SlideStudioRendererProps {
  onOpenPresenterMode?: () => void;
  onOpenMathModal?: () => void;
}

export function SlideStudioRenderer({ onOpenPresenterMode, onOpenMathModal }: SlideStudioRendererProps) {
  const {
    project,
    activePageIndex,
    setActivePageIndex,
    selectedElementIds,
    selectElement,
    deselectAll,
    updateElement,
    addElement,
    deleteSelectedElements,
    addPage,
    duplicatePage,
    deletePage,
    movePage,
    updateActivePageBackground,
    recordHistory,
    zoom,
  } = useEditorStore();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const activePage = project?.pages[activePageIndex] || project?.pages[0];
  const slideWidth = activePage?.width || 1280;
  const slideHeight = activePage?.height || 720;
  const elements = activePage?.elements || [];

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    selectElement(id);
    recordHistory();
    setDraggingId(id);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !dragStart) return;
    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;

    const el = elements.find((item) => item.id === draggingId);
    if (!el || el.isLocked) return;

    updateElement(
      draggingId,
      {
        x: Math.round(Math.max(0, el.x + dx)),
        y: Math.round(Math.max(0, el.y + dy)),
      },
      false
    );
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setDragStart(null);
  };

  // Quick preset themes
  const applyTheme = (bgColor: string, name: string) => {
    updateActivePageBackground(bgColor);
    toast.success(`Applied ${name} theme`);
  };

  // Quick Add Helpers
  const handleAddSlideHeading = () => {
    const el = createDefaultElement('text', 100, 80, {
      text: 'Compelling Presentation Title',
      width: 900,
      height: 60,
      style: {
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
        opacity: 1,
        fontFamily: 'Inter, sans-serif',
        fontSize: 42,
        fontWeight: 'bold',
        color: activePage?.background?.color === '#ffffff' ? '#0f172a' : '#ffffff',
        textAlign: 'left',
      },
    });
    addElement(el);
    toast.success('Added slide title');
  };

  const handleAddSlideCard = () => {
    const el = createDefaultElement('shape', 100, 200, {
      name: 'Content Card',
      width: 320,
      height: 280,
      text: 'Key Pillar\n\nHigh-impact executive summary and architectural advantage for this work stream.',
      style: {
        fill: activePage?.background?.color === '#ffffff' ? '#f8fafc' : '#1e293b',
        stroke: activePage?.background?.color === '#ffffff' ? '#e2e8f0' : '#3b82f6',
        strokeWidth: 2,
        cornerRadius: 12,
        opacity: 1,
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        color: activePage?.background?.color === '#ffffff' ? '#1e293b' : '#f8fafc',
        textAlign: 'left',
        verticalAlign: 'top',
      },
    });
    addElement(el);
    toast.success('Added content card');
  };

  const handleAddPhotoCard = () => {
    const el = createDefaultElement('image', 500, 200, {
      name: 'Unsplash Visual',
      width: 440,
      height: 280,
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      style: {
        fill: 'transparent',
        stroke: '#3b82f6',
        strokeWidth: 1,
        cornerRadius: 12,
        opacity: 1,
      },
    });
    addElement(el);
    toast.success('Added image visual');
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="w-full h-full flex flex-col bg-slate-900 select-none overflow-hidden relative"
    >
      {/* Top Floating Slide Action Bar */}
      <div className="h-12 border-b border-slate-800 bg-slate-950/90 px-4 flex items-center justify-between z-10 shrink-0 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-white flex items-center space-x-1.5">
            <Presentation className="w-4 h-4 text-orange-400" />
            <span>
              Slide {activePageIndex + 1} of {project?.pages.length || 1}
            </span>
          </span>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Quick Add Buttons */}
          <button
            onClick={handleAddSlideHeading}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-medium text-slate-300 hover:text-white flex items-center space-x-1 transition-colors"
          >
            <Type className="w-3 h-3 text-blue-400" />
            <span>+ Title</span>
          </button>
          <button
            onClick={handleAddSlideCard}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-medium text-slate-300 hover:text-white flex items-center space-x-1 transition-colors"
          >
            <Square className="w-3 h-3 text-emerald-400" />
            <span>+ Card</span>
          </button>
          <button
            onClick={handleAddPhotoCard}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-medium text-slate-300 hover:text-white flex items-center space-x-1 transition-colors"
          >
            <ImageIcon className="w-3 h-3 text-purple-400" />
            <span>+ Photo</span>
          </button>
        </div>

        {/* Right: Theme Quick Selector & Presenter Button */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold mr-1">Theme</span>
            <button
              onClick={() => applyTheme('#090d16', 'Dark Executive')}
              className="w-4 h-4 rounded-full bg-[#090d16] border border-slate-700 hover:scale-110 transition-transform"
              title="Dark Executive"
            />
            <button
              onClick={() => applyTheme('#ffffff', 'Clean Modern')}
              className="w-4 h-4 rounded-full bg-white border border-slate-400 hover:scale-110 transition-transform"
              title="Clean Modern"
            />
            <button
              onClick={() => applyTheme('#0f172a', 'Midnight Tech')}
              className="w-4 h-4 rounded-full bg-[#0f172a] border border-blue-500/50 hover:scale-110 transition-transform"
              title="Midnight Tech"
            />
            <button
              onClick={() => applyTheme('#022c22', 'Emerald Luxury')}
              className="w-4 h-4 rounded-full bg-[#022c22] border border-emerald-500/50 hover:scale-110 transition-transform"
              title="Emerald Luxury"
            />
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {onOpenPresenterMode && (
            <button
              onClick={onOpenPresenterMode}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-orange-600/20 transition-all"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Present (F5)</span>
            </button>
          )}
        </div>
      </div>

      {/* Center 16:9 Editing Canvas Area */}
      <div
        onClick={deselectAll}
        className="flex-1 overflow-auto flex items-center justify-center p-8 bg-slate-900 canvas-grid-pattern relative"
      >
        <div
          id="slide-artboard"
          style={{
            width: `${slideWidth * zoom}px`,
            height: `${slideHeight * zoom}px`,
            backgroundColor: activePage?.background?.color || '#090d16',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
            transformOrigin: 'center center',
          }}
          className="relative rounded-lg border border-slate-800 transition-all overflow-hidden shrink-0"
        >
          {elements.map((el) => {
            const isSelected = selectedElementIds.includes(el.id);
            const isEditing = editingTextId === el.id;

            return (
              <div
                key={el.id}
                onMouseDown={(e) => handleDragStart(e, el.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  selectElement(el.id, e.shiftKey);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (el.type === 'text' || el.type === 'shape') {
                    setEditingTextId(el.id);
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `${el.x * zoom}px`,
                  top: `${el.y * zoom}px`,
                  width: `${el.width * zoom}px`,
                  height: el.height ? `${el.height * zoom}px` : 'auto',
                  cursor: draggingId === el.id ? 'grabbing' : 'grab',
                  zIndex: el.zIndex || 1,
                }}
                className={`group transition-shadow ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : 'hover:ring-1 hover:ring-blue-400/50'
                }`}
              >
                {/* Element Renderers */}
                {el.type === 'text' && (
                  <div
                    style={{
                      fontSize: `${(el.style?.fontSize || 20) * zoom}px`,
                      fontFamily: el.style?.fontFamily || 'Inter, sans-serif',
                      fontWeight: el.style?.fontWeight || 'normal',
                      color: el.style?.color || '#ffffff',
                      textAlign: el.style?.textAlign || 'left',
                      opacity: el.style?.opacity ?? 1,
                    }}
                    className="w-full h-full outline-none leading-snug p-1"
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      setEditingTextId(null);
                      updateElement(el.id, { text: e.currentTarget.innerText });
                    }}
                  >
                    {el.text}
                  </div>
                )}

                {el.type === 'shape' && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: el.style?.fill || '#1e293b',
                      borderColor: el.style?.stroke || '#3b82f6',
                      borderWidth: `${(el.style?.strokeWidth || 1) * zoom}px`,
                      borderRadius: `${(el.style?.cornerRadius || 8) * zoom}px`,
                      color: el.style?.color || '#ffffff',
                      opacity: el.style?.opacity ?? 1,
                      fontSize: `${(el.style?.fontSize || 14) * zoom}px`,
                      fontFamily: el.style?.fontFamily || 'Inter, sans-serif',
                      textAlign: el.style?.textAlign || 'left',
                    }}
                    className="p-4 flex flex-col justify-start overflow-hidden shadow-lg whitespace-pre-line leading-relaxed"
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      setEditingTextId(null);
                      updateElement(el.id, { text: e.currentTarget.innerText });
                    }}
                  >
                    {el.text}
                  </div>
                )}

                {el.type === 'image' && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: `${(el.style?.cornerRadius || 8) * zoom}px`,
                      borderColor: el.style?.stroke || '#3b82f6',
                      borderWidth: `${(el.style?.strokeWidth || 0) * zoom}px`,
                      opacity: el.style?.opacity ?? 1,
                    }}
                    className="overflow-hidden shadow-xl"
                  >
                    <img
                      src={el.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'}
                      alt={el.name}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                )}

                {el.type === 'equation' && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: el.style?.fill || '#0f172a',
                      borderColor: el.style?.stroke || '#6366f1',
                      borderWidth: '1.5px',
                      borderRadius: `${(el.style?.cornerRadius || 8) * zoom}px`,
                      color: '#c7d2fe',
                    }}
                    className="flex items-center justify-center p-3 shadow-lg"
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        try {
                          const latex = compileMathASTToLatex((el as any).equationAst);
                          return katex.renderToString(latex, { throwOnError: false });
                        } catch {
                          return el.name;
                        }
                      })(),
                    }}
                  />
                )}

                {/* Selected Drag Pill */}
                {isSelected && (
                  <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow flex items-center space-x-1 pointer-events-none">
                    <Move className="w-2.5 h-2.5" />
                    <span>
                      {Math.round(el.x)}, {Math.round(el.y)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide Deck Navigation Bar (Bottom) */}
      <div className="h-24 bg-slate-950 border-t border-slate-800 px-4 py-2 flex items-center space-x-3 overflow-x-auto shrink-0 z-20">
        {(project?.pages || []).map((p, idx) => {
          const isActive = idx === activePageIndex;
          return (
            <div
              key={p.id}
              onClick={() => setActivePageIndex(idx)}
              className={`h-18 w-32 rounded-lg border cursor-pointer relative overflow-hidden shrink-0 transition-all flex flex-col justify-between p-2 ${
                isActive
                  ? 'border-orange-500 bg-slate-900 shadow-md ring-2 ring-orange-500/30'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-white">Slide {idx + 1}</span>
                <div className="flex items-center space-x-1">
                  {idx > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        movePage(idx, 'left');
                      }}
                      className="hover:text-white"
                      title="Move left"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  )}
                  {idx < (project?.pages.length || 0) - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        movePage(idx, 'right');
                      }}
                      className="hover:text-white"
                      title="Move right"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicatePage(idx);
                      toast.success(`Duplicated slide ${idx + 1}`);
                    }}
                    className="hover:text-white"
                    title="Duplicate slide"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {(project?.pages.length || 0) > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePage(idx);
                        toast.success(`Deleted slide ${idx + 1}`);
                      }}
                      className="hover:text-rose-400"
                      title="Delete slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[11px] font-semibold text-slate-300 truncate">
                {p.name || `Slide ${idx + 1}`}
              </div>

              <div className="text-[9px] text-slate-500 font-mono">
                {p.elements?.length || 0} elements
              </div>
            </div>
          );
        })}

        <button
          onClick={() => {
            addPage();
            toast.success('Added new slide');
          }}
          className="h-18 w-24 rounded-lg border border-dashed border-slate-800 hover:border-orange-500 hover:bg-slate-900/60 flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
          title="Add new slide"
        >
          <Plus className="w-4 h-4 mb-1 text-orange-400" />
          <span className="text-[10px] font-semibold">New Slide</span>
        </button>
      </div>
    </div>
  );
}

export default SlideStudioRenderer;


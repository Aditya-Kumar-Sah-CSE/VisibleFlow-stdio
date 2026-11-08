'use client';

import React from 'react';
import {
  Layers,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Group,
  Ungroup,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sliders,
  Palette,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import toast from 'react-hot-toast';

export function PropertiesPanel() {
  const {
    project,
    activePageIndex,
    selectedElementIds,
    updateElement,
    deleteSelectedElements,
    duplicateSelectedElements,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    groupSelected,
    ungroupSelected,
  } = useEditorStore();

  const activePage = project?.pages[activePageIndex];
  const selectedElements = (activePage?.elements || []).filter((el) =>
    selectedElementIds.includes(el.id)
  );

  const primaryElement = selectedElements[0];

  const handleStyleChange = (key: string, value: any) => {
    if (!primaryElement) return;
    updateElement(primaryElement.id, {
      style: {
        ...primaryElement.style,
        [key]: value,
      },
    });
  };

  const handlePropertyChange = (key: string, value: any) => {
    if (!primaryElement) return;
    updateElement(primaryElement.id, {
      [key]: value,
    });
  };

  return (
    <aside className="w-72 bg-slate-950 border-l border-slate-800 flex flex-col select-none shrink-0 z-20 text-xs text-slate-300">
      {/* Header */}
      <div className="h-11 border-b border-slate-800 px-4 flex items-center justify-between font-bold text-white uppercase tracking-wider text-[11px]">
        <span>{primaryElement ? `${primaryElement.type} Inspector` : 'Page Properties'}</span>
        {primaryElement && (
          <span className="font-mono text-[10px] text-slate-400 font-normal">
            ID: {primaryElement.id.slice(-5)}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {primaryElement ? (
          <>
            {/* Layer Operations Bar */}
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <button
                onClick={bringForward}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Bring Forward"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={sendBackward}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Send Backward"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={bringToFront}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Bring to Front"
              >
                <ChevronsUp className="w-4 h-4" />
              </button>
              <button
                onClick={sendToBack}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Send to Back"
              >
                <ChevronsDown className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-800" />
              <button
                onClick={duplicateSelectedElements}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={deleteSelectedElements}
                className="p-1.5 hover:bg-rose-900/60 rounded text-rose-400 hover:text-rose-200"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Multi-Selection Grouping */}
            {selectedElementIds.length > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={groupSelected}
                  className="flex-1 py-1.5 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded text-xs flex items-center justify-center space-x-1"
                >
                  <Group className="w-3.5 h-3.5" />
                  <span>Group ({selectedElementIds.length})</span>
                </button>
                <button
                  onClick={ungroupSelected}
                  className="flex-1 py-1.5 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded text-xs flex items-center justify-center space-x-1"
                >
                  <Ungroup className="w-3.5 h-3.5" />
                  <span>Ungroup</span>
                </button>
              </div>
            )}

            {/* Position & Dimensions */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Geometry
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">X Position</label>
                  <input
                    type="number"
                    value={Math.round(primaryElement.x)}
                    onChange={(e) => handlePropertyChange('x', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Y Position</label>
                  <input
                    type="number"
                    value={Math.round(primaryElement.y)}
                    onChange={(e) => handlePropertyChange('y', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Width</label>
                  <input
                    type="number"
                    value={Math.round(primaryElement.width)}
                    onChange={(e) => handlePropertyChange('width', Math.max(10, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Height</label>
                  <input
                    type="number"
                    value={Math.round(primaryElement.height)}
                    onChange={(e) => handlePropertyChange('height', Math.max(10, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Text Inspector (if element has text or is text element) */}
            {(primaryElement.type === 'text' || primaryElement.text !== undefined) && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Typography
                </span>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400">Content</label>
                    <textarea
                      value={primaryElement.text || ''}
                      onChange={(e) => handlePropertyChange('text', e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Font Size</label>
                      <input
                        type="number"
                        value={primaryElement.style?.fontSize || 16}
                        onChange={(e) => handleStyleChange('fontSize', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Text Color</label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="color"
                          value={primaryElement.style?.color || '#0f172a'}
                          onChange={(e) => handleStyleChange('color', e.target.value)}
                          className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[11px]">{primaryElement.style?.color || '#0f172a'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Formatting Buttons */}
                  <div className="flex items-center justify-between bg-slate-900 p-1 rounded border border-slate-800">
                    <button
                      onClick={() =>
                        handleStyleChange(
                          'fontWeight',
                          primaryElement.style?.fontWeight === 'bold' ? 'normal' : 'bold'
                        )
                      }
                      className={`p-1.5 rounded ${
                        primaryElement.style?.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        handleStyleChange(
                          'fontStyle',
                          primaryElement.style?.fontStyle === 'italic' ? 'normal' : 'italic'
                        )
                      }
                      className={`p-1.5 rounded ${
                        primaryElement.style?.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-3.5 bg-slate-800" />
                    <button
                      onClick={() => handleStyleChange('textAlign', 'left')}
                      className={`p-1.5 rounded ${
                        primaryElement.style?.textAlign === 'left' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStyleChange('textAlign', 'center')}
                      className={`p-1.5 rounded ${
                        primaryElement.style?.textAlign === 'center' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStyleChange('textAlign', 'right')}
                      className={`p-1.5 rounded ${
                        primaryElement.style?.textAlign === 'right' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Colors & Appearance */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Appearance
              </span>
              <div className="space-y-2.5">
                {/* Fill Color */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Fill Color</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryElement.style?.fill || '#3b82f6'}
                      onChange={(e) => handleStyleChange('fill', e.target.value)}
                      className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-[10px]">{primaryElement.style?.fill || '#3b82f6'}</span>
                  </div>
                </div>

                {/* Stroke Color & Width */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Border Color</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryElement.style?.stroke || '#1d4ed8'}
                      onChange={(e) => handleStyleChange('stroke', e.target.value)}
                      className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-[10px]">{primaryElement.style?.stroke || '#1d4ed8'}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Border Thickness</span>
                    <span>{primaryElement.style?.strokeWidth || 1}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    value={primaryElement.style?.strokeWidth || 1}
                    onChange={(e) => handleStyleChange('strokeWidth', Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Corner Radius */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Corner Radius</span>
                    <span>{primaryElement.style?.cornerRadius || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={primaryElement.style?.cornerRadius || 0}
                    onChange={(e) => handleStyleChange('cornerRadius', Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Opacity */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Opacity</span>
                    <span>{Math.round((primaryElement.style?.opacity ?? 1) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={primaryElement.style?.opacity ?? 1}
                    onChange={(e) => handleStyleChange('opacity', Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Page Properties when no element is selected */
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Canvas Setup
              </span>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Page Dimensions</span>
                  <span className="font-mono text-white">
                    {activePage?.width} × {activePage?.height} px
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Elements</span>
                  <span className="font-mono text-white">{activePage?.elements.length || 0}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Flow Nodes</span>
                  <span className="font-mono text-white">{activePage?.nodes?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-[11px] leading-relaxed">
              Click any element on canvas to inspect and edit its style, typography, coordinates, and layers.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

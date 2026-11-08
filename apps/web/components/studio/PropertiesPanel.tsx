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
  Grid,
  Magnet,
  Maximize2,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import toast from 'react-hot-toast';

export function PropertiesPanel() {
  const {
    project,
    activePageIndex,
    selectedElementIds,
    selectedNodeId,
    updateElement,
    deleteSelectedElements,
    duplicateSelectedElements,
    updateFlowNode,
    deleteSelectedNode,
    duplicateSelectedNode,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    groupSelected,
    ungroupSelected,
    showGrid,
    snapToGrid,
    toggleGrid,
    toggleSnap,
  } = useEditorStore();

  const activePage = project?.pages[activePageIndex];

  // Check if a flowchart node is currently selected
  const selectedNode = selectedNodeId
    ? (activePage?.nodes || []).find((n) => n.id === selectedNodeId)
    : null;

  // Check if a canvas element is selected
  const selectedElements = (activePage?.elements || []).filter((el) =>
    selectedElementIds.includes(el.id)
  );
  const primaryElement = !selectedNode ? selectedElements[0] : null;

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
        <span>
          {selectedNode
            ? 'Node Inspector'
            : primaryElement
            ? `${primaryElement.type} Inspector`
            : 'Page Properties'}
        </span>
        {selectedNode && (
          <span className="font-mono text-[10px] text-blue-400 font-normal">
            ID: {selectedNode.id.slice(-5)}
          </span>
        )}
        {primaryElement && !selectedNode && (
          <span className="font-mono text-[10px] text-slate-400 font-normal">
            ID: {primaryElement.id.slice(-5)}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* FLOWCHART NODE INSPECTOR */}
        {selectedNode ? (
          <div className="space-y-4">
            {/* Quick Actions Bar */}
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <button
                onClick={duplicateSelectedNode}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white flex items-center space-x-1"
                title="Duplicate Node"
              >
                <Copy className="w-4 h-4 text-blue-400" />
                <span className="text-[11px]">Duplicate</span>
              </button>

              <button
                onClick={deleteSelectedNode}
                className="p-1.5 hover:bg-rose-950/40 rounded text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                title="Delete Node"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span className="text-[11px]">Delete</span>
              </button>
            </div>

            {/* Label Input */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Node Label
              </label>
              <input
                type="text"
                value={selectedNode.data.label || ''}
                onChange={(e) =>
                  updateFlowNode(selectedNode.id, { label: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Node Type Selection */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Node Role / Semantic Type
              </label>
              <select
                value={selectedNode.data.nodeType || 'process'}
                onChange={(e) =>
                  updateFlowNode(selectedNode.id, { nodeType: e.target.value as any })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="process">Process Step (Action)</option>
                <option value="decision">Decision (Condition / Branch)</option>
                <option value="database">Database (Storage / SQL)</option>
                <option value="cloud">Cloud (API / Microservice)</option>
                <option value="start">Start (Workflow Ingress)</option>
                <option value="end">End (Workflow Completion)</option>
              </select>
            </div>

            {/* Shape Kind */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Geometric Silhouette
              </label>
              <select
                value={selectedNode.data.shapeKind || 'rectangle'}
                onChange={(e) =>
                  updateFlowNode(selectedNode.id, { shapeKind: e.target.value as any })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="rectangle">Rectangle</option>
                <option value="rounded-rect">Rounded Rectangle</option>
                <option value="circle">Circle / Pill</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>

            {/* Appearance Settings */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Color & Appearance
              </span>
              <div className="space-y-3">
                {/* Background Fill */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Fill Color</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={selectedNode.data.style?.fill || '#0f172a'}
                      onChange={(e) =>
                        updateFlowNode(selectedNode.id, {
                          style: { ...(selectedNode.data.style || {}), fill: e.target.value },
                        })
                      }
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
                    />
                    <span className="font-mono text-[11px] text-slate-300">
                      {selectedNode.data.style?.fill || '#0f172a'}
                    </span>
                  </div>
                </div>

                {/* Border Color */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Border Color</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={selectedNode.data.style?.stroke || '#3b82f6'}
                      onChange={(e) =>
                        updateFlowNode(selectedNode.id, {
                          style: { ...(selectedNode.data.style || {}), stroke: e.target.value },
                        })
                      }
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
                    />
                    <span className="font-mono text-[11px] text-slate-300">
                      {selectedNode.data.style?.stroke || '#3b82f6'}
                    </span>
                  </div>
                </div>

                {/* Text Color */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Text Color</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={selectedNode.data.style?.color || '#ffffff'}
                      onChange={(e) =>
                        updateFlowNode(selectedNode.id, {
                          style: { ...(selectedNode.data.style || {}), color: e.target.value },
                        })
                      }
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
                    />
                    <span className="font-mono text-[11px] text-slate-300">
                      {selectedNode.data.style?.color || '#ffffff'}
                    </span>
                  </div>
                </div>

                {/* Border Thickness */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Border Thickness</span>
                    <span>{selectedNode.data.style?.strokeWidth || 2}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={selectedNode.data.style?.strokeWidth || 2}
                    onChange={(e) =>
                      updateFlowNode(selectedNode.id, {
                        style: {
                          ...(selectedNode.data.style || {}),
                          strokeWidth: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : primaryElement ? (
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
                title="Bring To Front"
              >
                <ChevronsUp className="w-4 h-4" />
              </button>
              <button
                onClick={sendToBack}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Send To Back"
              >
                <ChevronsDown className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-slate-800" />

              <button
                onClick={duplicateSelectedElements}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={deleteSelectedElements}
                className="p-1.5 hover:bg-rose-950/40 rounded text-rose-400 hover:text-rose-300"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Geometry Inspector */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Geometry
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">X Position</label>
                  <input
                    type="number"
                    value={Math.round(primaryElement.x)}
                    onChange={(e) => handlePropertyChange('x', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Y Position</label>
                  <input
                    type="number"
                    value={Math.round(primaryElement.y)}
                    onChange={(e) => handlePropertyChange('y', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Width</label>
                  <input
                    type="number"
                    value={Math.round(primaryElement.width)}
                    onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Height</label>
                  <input
                    type="number"
                    value={Math.round(primaryElement.height)}
                    onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Appearance
              </span>
              <div className="space-y-3">
                {/* Fill Color */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Fill Color</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryElement.style?.fill || '#ffffff'}
                      onChange={(e) => handleStyleChange('fill', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
                    />
                    <span className="font-mono text-[11px] text-slate-300">
                      {primaryElement.style?.fill || '#ffffff'}
                    </span>
                  </div>
                </div>

                {/* Border Color */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Border Color</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryElement.style?.stroke || '#000000'}
                      onChange={(e) => handleStyleChange('stroke', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
                    />
                    <span className="font-mono text-[11px] text-slate-300">
                      {primaryElement.style?.stroke || '#000000'}
                    </span>
                  </div>
                </div>

                {/* Border Thickness */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Border Thickness</span>
                    <span>{primaryElement.style?.strokeWidth || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={primaryElement.style?.strokeWidth || 0}
                    onChange={(e) => handleStyleChange('strokeWidth', Number(e.target.value))}
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
          /* Page Properties when nothing is selected */
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Project & Canvas Setup
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Studio Mode</span>
                  <span className="font-bold text-blue-400 uppercase">{project?.type || 'Standard'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Page Dimensions</span>
                  <span className="font-mono text-white">
                    {activePage?.width || 1280} × {activePage?.height || 720} px
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Flowchart Nodes</span>
                  <span className="font-mono text-emerald-400">{activePage?.nodes?.length || 0}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Canvas Elements</span>
                  <span className="font-mono text-blue-400">{activePage?.elements?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Grid & Snapping Controls */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Editor Assistance
              </span>

              <button
                onClick={toggleGrid}
                className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
                  showGrid
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Grid className="w-3.5 h-3.5" />
                  <span>Background Grid</span>
                </div>
                <span className="text-[10px] uppercase font-mono">{showGrid ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={toggleSnap}
                className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
                  snapToGrid
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Magnet className="w-3.5 h-3.5" />
                  <span>Snap to Grid</span>
                </div>
                <span className="text-[10px] uppercase font-mono">{snapToGrid ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-[11px] leading-relaxed">
              Click any element or node on the canvas to inspect its geometry, colors, labels, and layers.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

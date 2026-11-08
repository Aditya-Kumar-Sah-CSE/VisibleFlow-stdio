'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Grid,
  Magnet,
  Sparkles,
  Download,
  Play,
  Save,
  CheckCircle2,
  FileText,
  Presentation,
  GitBranch,
  Network,
  BarChart3,
  FileCheck2,
  Sigma,
  Loader2,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface StudioNavbarProps {
  onOpenMathModal: () => void;
  onOpenAIModal: () => void;
  onOpenExportModal: () => void;
  onOpenPresenterMode: () => void;
}

export function StudioNavbar({
  onOpenMathModal,
  onOpenAIModal,
  onOpenExportModal,
  onOpenPresenterMode,
}: StudioNavbarProps) {
  const {
    project,
    setProject,
    zoom,
    setZoom,
    showGrid,
    toggleGrid,
    snapToGrid,
    toggleSnap,
    canUndo,
    canRedo,
    undo,
    redo,
    isSaving,
    saveStatus,
    triggerAutosave,
  } = useEditorStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(project?.title || '');

  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !titleValue.trim()) return;
    setIsEditingTitle(false);
    if (titleValue.trim() !== project.title) {
      const updated = { ...project, title: titleValue.trim() };
      setProject(updated);
      await api.updateProject(project.id, { title: titleValue.trim() });
      toast.success('Project renamed');
    }
  };

  const getStudioIcon = (type?: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'slide':
        return <Presentation className="w-4 h-4 text-orange-400" />;
      case 'flowchart':
        return <GitBranch className="w-4 h-4 text-emerald-400" />;
      case 'diagram':
        return <Network className="w-4 h-4 text-purple-400" />;
      case 'chart':
        return <BarChart3 className="w-4 h-4 text-cyan-400" />;
      default:
        return <FileCheck2 className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between text-slate-200 select-none z-30">
      {/* Left: Back & Title */}
      <div className="flex items-center space-x-3">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Back to Dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="p-1 rounded bg-slate-900 border border-slate-800">
            {getStudioIcon(project?.type)}
          </div>

          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit}>
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSubmit}
                autoFocus
                className="bg-slate-900 border border-blue-500 rounded px-2 py-0.5 text-xs font-bold text-white focus:outline-none w-56"
              />
            </form>
          ) : (
            <div
              onClick={() => {
                setTitleValue(project?.title || '');
                setIsEditingTitle(true);
              }}
              className="font-bold text-sm text-white hover:bg-slate-900 px-2 py-1 rounded cursor-pointer transition-colors max-w-[200px] truncate"
              title="Click to rename"
            >
              {project?.title || 'Untitled Project'}
            </div>
          )}

          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            {project?.type || 'flowchart'}
          </span>
        </div>

        {/* Save Status */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 pl-3">
          {isSaving ? (
            <span className="flex items-center text-amber-400 space-x-1 text-[11px]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : saveStatus === 'saved' ? (
            <span className="flex items-center text-emerald-400 space-x-1 text-[11px]">
              <CheckCircle2 className="w-3 h-3" />
              <span>Saved</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">Unsaved</span>
          )}
        </div>
      </div>

      {/* Center: History & Viewport Controls */}
      <div className="flex items-center space-x-1 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-lg">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-1" />

        <button
          onClick={() => setZoom((z) => Math.max(z - 0.1, 0.2))}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="text-xs font-mono px-2 py-1 hover:bg-slate-800 rounded text-slate-300"
          title="Reset Zoom (100%)"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.1, 3.0))}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-1" />

        <button
          onClick={toggleGrid}
          className={`p-1.5 rounded transition-colors ${showGrid ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800'}`}
          title="Toggle Grid (G)"
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={toggleSnap}
          className={`p-1.5 rounded transition-colors ${snapToGrid ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800'}`}
          title="Toggle Snap to Grid (S)"
        >
          <Magnet className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Actions (AI, Math, Presenter, Export) */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenMathModal}
          className="px-2.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          title="Visual Equation Builder (Zero-LaTeX)"
        >
          <Sigma className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Visual Math</span>
        </button>

        <button
          onClick={onOpenAIModal}
          className="px-2.5 py-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900 border border-blue-700/60 text-blue-300 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          title="AI Assistant Generator"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {project?.type === 'slide' && (
          <button
            onClick={onOpenPresenterMode}
            className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            title="Present Slides (F5)"
          >
            <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="hidden sm:inline">Present</span>
          </button>
        )}

        <button
          onClick={onOpenExportModal}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}

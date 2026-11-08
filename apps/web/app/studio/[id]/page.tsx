'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEditorStore } from '@/stores/editor-store';
import { api } from '@/lib/api-client';
import { StudioNavbar } from '@/components/studio/StudioNavbar';
import { ElementLibrarySidebar } from '@/components/studio/ElementLibrarySidebar';
import { PropertiesPanel } from '@/components/studio/PropertiesPanel';
import { VisualMathModal } from '@/components/studio/modals/VisualMathModal';
import { AIAssistantDrawer } from '@/components/studio/modals/AIAssistantDrawer';
import { ExportModal } from '@/components/studio/modals/ExportModal';
import { PresenterModeModal } from '@/components/studio/modals/PresenterModeModal';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  Presentation,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Dynamically import client-only renderers
const KonvaCanvasRenderer = dynamic(
  () => import('@/components/studio/renderers/KonvaCanvasRenderer'),
  { ssr: false }
);

const FlowchartRenderer = dynamic(
  () => import('@/components/studio/renderers/FlowchartRenderer'),
  { ssr: false }
);

const DocumentRenderer = dynamic(
  () => import('@/components/studio/renderers/DocumentRenderer'),
  { ssr: false }
);

const ChartRenderer = dynamic(
  () => import('@/components/studio/renderers/ChartRenderer'),
  { ssr: false }
);

export default function StudioPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const {
    project,
    setProject,
    activePageIndex,
    setActivePageIndex,
    addPage,
    duplicatePage,
    deletePage,
  } = useEditorStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPresenterModeOpen, setIsPresenterModeOpen] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      setIsLoading(true);
      try {
        const data = await api.getProject(projectId);
        setProject(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load project');
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <span className="text-sm font-semibold">Loading VisualFlow Studio...</span>
      </div>
    );
  }

  const activePage = project.pages[activePageIndex] || project.pages[0];

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden text-slate-100 select-none">
      {/* Top Navbar */}
      <StudioNavbar
        onOpenMathModal={() => setIsMathModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPresenterMode={() => setIsPresenterModeOpen(true)}
      />

      {/* Main Studio Body Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Element Library Sidebar */}
        <ElementLibrarySidebar onOpenMathModal={() => setIsMathModalOpen(true)} />

        {/* Center Editing Canvas Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-900">
          <div className="flex-1 relative overflow-hidden">
            {project.type === 'flowchart' || project.type === 'diagram' ? (
              <FlowchartRenderer />
            ) : project.type === 'document' ? (
              <DocumentRenderer onOpenMathModal={() => setIsMathModalOpen(true)} />
            ) : project.type === 'chart' ? (
              <ChartRenderer />
            ) : (
              <KonvaCanvasRenderer
                pageWidth={activePage.width || 1280}
                pageHeight={activePage.height || 720}
              />
            )}
          </div>

          {/* Slide Deck Navigation Bar (for Slide Studio) */}
          {project.type === 'slide' && (
            <div className="h-24 bg-slate-950 border-t border-slate-800 px-4 py-2 flex items-center space-x-3 overflow-x-auto shrink-0 z-10">
              {project.pages.map((p, idx) => {
                const isActive = idx === activePageIndex;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActivePageIndex(idx)}
                    className={`h-18 w-32 rounded-lg border cursor-pointer relative overflow-hidden shrink-0 transition-all flex flex-col justify-between p-1.5 ${
                      isActive
                        ? 'border-blue-500 bg-slate-900 shadow-md ring-2 ring-blue-500/30'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Slide {idx + 1}</span>
                      <div className="flex items-center space-x-1 opacity-0 hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicatePage(idx);
                          }}
                          className="hover:text-white"
                          title="Duplicate slide"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {project.pages.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePage(idx);
                            }}
                            className="hover:text-rose-400"
                            title="Delete slide"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-300 truncate">
                      {p.name || `Slide ${idx + 1}`}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={addPage}
                className="h-18 w-24 rounded-lg border border-dashed border-slate-800 hover:border-blue-500 hover:bg-slate-900/60 flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
                title="Add new slide"
              >
                <Plus className="w-4 h-4 mb-1" />
                <span className="text-[10px] font-semibold">New Slide</span>
              </button>
            </div>
          )}
        </main>

        {/* Right Properties Panel */}
        <PropertiesPanel />
      </div>

      {/* Modals & Drawers */}
      <VisualMathModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
      />

      <AIAssistantDrawer
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <PresenterModeModal
        isOpen={isPresenterModeOpen}
        onClose={() => setIsPresenterModeOpen(false)}
      />
    </div>
  );
}

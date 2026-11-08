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

const PdfStudioRenderer = dynamic(
  () => import('@/components/studio/renderers/PdfStudioRenderer'),
  { ssr: false }
);

const SlideStudioRenderer = dynamic(
  () => import('@/components/studio/renderers/SlideStudioRenderer'),
  { ssr: false }
);

const LiveVideoRecorderWidget = dynamic(
  () =>
    import('@/components/studio/recording/LiveVideoRecorderWidget').then(
      (mod) => mod.LiveVideoRecorderWidget
    ),
  { ssr: false }
);

import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

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

  useKeyboardShortcuts({
    onOpenMathModal: () => setIsMathModalOpen(true),
    onOpenAIModal: () => setIsAIModalOpen(true),
    onOpenExportModal: () => setIsExportModalOpen(true),
    onOpenPresenterMode: () => setIsPresenterModeOpen(true),
  });

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
        <main id="studio-canvas-container" className="flex-1 flex flex-col overflow-hidden relative bg-slate-900">
          <div className="flex-1 relative overflow-hidden">
            {project.type === 'flowchart' || project.type === 'diagram' ? (
              <FlowchartRenderer />
            ) : project.type === 'document' ? (
              <DocumentRenderer onOpenMathModal={() => setIsMathModalOpen(true)} />
            ) : project.type === 'chart' ? (
              <ChartRenderer />
            ) : project.type === 'pdf' ? (
              <PdfStudioRenderer />
            ) : project.type === 'slide' ? (
              <SlideStudioRenderer
                onOpenPresenterMode={() => setIsPresenterModeOpen(true)}
                onOpenMathModal={() => setIsMathModalOpen(true)}
              />
            ) : (
              <KonvaCanvasRenderer
                pageWidth={activePage.width || 1280}
                pageHeight={activePage.height || 720}
              />
            )}
          </div>

          {/* Floating Live Video & Screen Recorder */}
          <LiveVideoRecorderWidget />
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


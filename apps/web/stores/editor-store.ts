import { create } from 'zustand';
import type {
  UniversalProject,
  UniversalPage,
  CanvasElement,
  ShapeKind,
  FlowNode,
  FlowEdge,
} from '@visualflow/shared-types';
import { HistoryManager } from '@visualflow/editor-core';
import {
  bringForward as coreBringForward,
  sendBackward as coreSendBackward,
  bringToFront as coreBringToFront,
  sendToBack as coreSendToBack,
  groupElements as coreGroupElements,
  ungroupElements as coreUngroupElements,
} from '@visualflow/editor-core';
import { api } from '@/lib/api-client';

export type ToolType =
  | 'select'
  | 'hand'
  | 'text'
  | 'shape'
  | 'arrow'
  | 'connector'
  | 'image'
  | 'equation'
  | 'chart';

interface EditorState {
  project: UniversalProject | null;
  activePageIndex: number;
  selectedElementIds: string[];
  activeTool: ToolType;
  selectedShapeKind: ShapeKind;

  // Viewport
  zoom: number;
  panOffset: { x: number; y: number };

  // Canvas Settings
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;

  // Save State
  isSaving: boolean;
  lastSavedAt: string | null;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';

  // History
  history: HistoryManager<UniversalPage> | null;
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  setProject: (project: UniversalProject) => void;
  setActivePageIndex: (index: number) => void;
  setActiveTool: (tool: ToolType) => void;
  setSelectedShapeKind: (kind: ShapeKind) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPanOffset: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;

  // Selection
  selectElement: (id: string, multi?: boolean) => void;
  deselectAll: () => void;
  setSelectedElementIds: (ids: string[]) => void;

  // Canvas Element Mutations
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateElementsBatch: (updates: Array<{ id: string; changes: Partial<CanvasElement> }>) => void;
  deleteSelectedElements: () => void;
  duplicateSelectedElements: () => void;

  // Layer Ordering & Grouping
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;

  // Flowchart Node/Edge Mutations
  updateFlowNodes: (nodes: FlowNode[]) => void;
  updateFlowEdges: (edges: FlowEdge[]) => void;

  // Document Content & Chart Mutations
  updateDocumentContent: (content: any) => void;
  updateChartConfig: (config: any) => void;

  // Page Management
  addPage: () => void;
  duplicatePage: (index: number) => void;
  deletePage: (index: number) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  recordHistory: () => void;

  // Autosave
  triggerAutosave: () => Promise<void>;
}

let autosaveTimer: NodeJS.Timeout | null = null;

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  activePageIndex: 0,
  selectedElementIds: [],
  activeTool: 'select',
  selectedShapeKind: 'rectangle',

  zoom: 1,
  panOffset: { x: 0, y: 0 },

  showGrid: true,
  snapToGrid: true,
  gridSize: 20,

  isSaving: false,
  lastSavedAt: null,
  saveStatus: 'saved',

  history: null,
  canUndo: false,
  canRedo: false,

  setProject: (project) => {
    const firstPage = project.pages[0];
    const history = firstPage ? new HistoryManager<UniversalPage>(firstPage) : null;
    set({
      project,
      activePageIndex: 0,
      selectedElementIds: [],
      history,
      canUndo: false,
      canRedo: false,
      lastSavedAt: project.updatedAt,
      saveStatus: 'saved',
    });
  },

  setActivePageIndex: (index) => {
    const { project } = get();
    if (!project || !project.pages[index]) return;
    const targetPage = project.pages[index];
    const history = new HistoryManager<UniversalPage>(targetPage);
    set({
      activePageIndex: index,
      selectedElementIds: [],
      history,
      canUndo: false,
      canRedo: false,
    });
  },

  setActiveTool: (tool) => set({ activeTool: tool }),
  setSelectedShapeKind: (kind) => set({ selectedShapeKind: kind }),

  setZoom: (updater) => {
    set((state) => {
      const nextZoom = typeof updater === 'function' ? updater(state.zoom) : updater;
      const clamped = Math.min(Math.max(nextZoom, 0.1), 4.0);
      return { zoom: Math.round(clamped * 100) / 100 };
    });
  },

  setPanOffset: (updater) => {
    set((state) => {
      const nextOffset = typeof updater === 'function' ? updater(state.panOffset) : updater;
      return { panOffset: nextOffset };
    });
  },

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  selectElement: (id, multi = false) => {
    set((state) => {
      if (multi) {
        const exists = state.selectedElementIds.includes(id);
        const updated = exists
          ? state.selectedElementIds.filter((item) => item !== id)
          : [...state.selectedElementIds, id];
        return { selectedElementIds: updated };
      }
      return { selectedElementIds: [id] };
    });
  },

  deselectAll: () => set({ selectedElementIds: [] }),
  setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),

  addElement: (element) => {
    const { project, activePageIndex, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;

    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    currentPage.elements = [...currentPage.elements, element];
    updatedPages[activePageIndex] = currentPage;

    set({
      project: { ...project, pages: updatedPages },
      selectedElementIds: [element.id],
      saveStatus: 'unsaved',
    });

    triggerAutosave();
  },

  updateElement: (id, updates) => {
    const { project, activePageIndex, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;

    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    currentPage.elements = currentPage.elements.map((el) => {
      if (el.id === id) {
        return { ...el, ...updates, style: { ...el.style, ...(updates.style || {}) } };
      }
      return el;
    });
    updatedPages[activePageIndex] = currentPage;

    set({
      project: { ...project, pages: updatedPages },
      saveStatus: 'unsaved',
    });

    triggerAutosave();
  },

  updateElementsBatch: (batch) => {
    const { project, activePageIndex, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;

    const map = new Map(batch.map((b) => [b.id, b.changes]));
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };

    currentPage.elements = currentPage.elements.map((el) => {
      if (map.has(el.id)) {
        const changes = map.get(el.id)!;
        return { ...el, ...changes, style: { ...el.style, ...(changes.style || {}) } };
      }
      return el;
    });
    updatedPages[activePageIndex] = currentPage;

    set({
      project: { ...project, pages: updatedPages },
      saveStatus: 'unsaved',
    });

    triggerAutosave();
  },

  deleteSelectedElements: () => {
    const { project, activePageIndex, selectedElementIds, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex] || selectedElementIds.length === 0) return;

    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    currentPage.elements = currentPage.elements.filter((el) => !selectedElementIds.includes(el.id));
    updatedPages[activePageIndex] = currentPage;

    set({
      project: { ...project, pages: updatedPages },
      selectedElementIds: [],
      saveStatus: 'unsaved',
    });

    triggerAutosave();
  },

  duplicateSelectedElements: () => {
    const { project, activePageIndex, selectedElementIds, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex] || selectedElementIds.length === 0) return;

    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    const toDuplicate = currentPage.elements.filter((el) => selectedElementIds.includes(el.id));

    const cloned = toDuplicate.map((el) => ({
      ...el,
      id: 'elem-' + Math.random().toString(36).substring(2, 9),
      x: el.x + 20,
      y: el.y + 20,
      name: `${el.name} (Copy)`,
    }));

    currentPage.elements = [...currentPage.elements, ...cloned];
    updatedPages[activePageIndex] = currentPage;

    set({
      project: { ...project, pages: updatedPages },
      selectedElementIds: cloned.map((c) => c.id),
      saveStatus: 'unsaved',
    });

    triggerAutosave();
  },

  bringForward: () => {
    const { project, activePageIndex, selectedElementIds, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    currentPage.elements = coreBringForward(currentPage.elements, selectedElementIds);
    updatedPages[activePageIndex] = currentPage;
    set({ project: { ...project, pages: updatedPages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  sendBackward: () => {
    const { project, activePageIndex, selectedElementIds, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    currentPage.elements = coreSendBackward(currentPage.elements, selectedElementIds);
    updatedPages[activePageIndex] = currentPage;
    set({ project: { ...project, pages: updatedPages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  bringToFront: () => {
    const { project, activePageIndex, selectedElementIds, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    currentPage.elements = coreBringToFront(currentPage.elements, selectedElementIds);
    updatedPages[activePageIndex] = currentPage;
    set({ project: { ...project, pages: updatedPages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  sendToBack: () => {
    const { project, activePageIndex, selectedElementIds, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    currentPage.elements = coreSendToBack(currentPage.elements, selectedElementIds);
    updatedPages[activePageIndex] = currentPage;
    set({ project: { ...project, pages: updatedPages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  groupSelected: () => {
    const { project, activePageIndex, selectedElementIds, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex] || selectedElementIds.length < 2) return;
    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    const { elements } = coreGroupElements(currentPage.elements, selectedElementIds);
    currentPage.elements = elements;
    updatedPages[activePageIndex] = currentPage;
    set({ project: { ...project, pages: updatedPages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  ungroupSelected: () => {
    const { project, activePageIndex, selectedElementIds, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    currentPage.elements = coreUngroupElements(currentPage.elements, selectedElementIds);
    updatedPages[activePageIndex] = currentPage;
    set({ project: { ...project, pages: updatedPages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  updateFlowNodes: (nodes) => {
    const { project, activePageIndex, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    const updatedPages = [...project.pages];
    updatedPages[activePageIndex] = { ...updatedPages[activePageIndex], nodes };
    set({ project: { ...project, pages: updatedPages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  updateFlowEdges: (edges) => {
    const { project, activePageIndex, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    const updatedPages = [...project.pages];
    updatedPages[activePageIndex] = { ...updatedPages[activePageIndex], edges };
    set({ project: { ...project, pages: updatedPages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  updateDocumentContent: (content) => {
    const { project, activePageIndex, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    const updatedPages = [...project.pages];
    updatedPages[activePageIndex] = { ...updatedPages[activePageIndex], documentContent: content };
    set({ project: { ...project, pages: updatedPages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  updateChartConfig: (chartConfig) => {
    const { project, activePageIndex, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    const updatedPages = [...project.pages];
    updatedPages[activePageIndex] = { ...updatedPages[activePageIndex], chartConfig };
    set({ project: { ...project, pages: updatedPages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  addPage: () => {
    const { project, triggerAutosave } = get();
    if (!project) return;
    const newPageOrder = project.pages.length;
    const newPage: UniversalPage = {
      id: 'page-' + Math.random().toString(36).substring(2, 9),
      order: newPageOrder,
      name: `Page ${newPageOrder + 1}`,
      width: project.pages[0]?.width || 1200,
      height: project.pages[0]?.height || 800,
      unit: 'px',
      background: { type: 'solid', color: '#ffffff' },
      elements: [],
      nodes: [],
      edges: [],
    };
    const updatedPages = [...project.pages, newPage];
    set({
      project: { ...project, pages: updatedPages },
      activePageIndex: newPageOrder,
      selectedElementIds: [],
      saveStatus: 'unsaved',
    });
    triggerAutosave();
  },

  duplicatePage: (index) => {
    const { project, triggerAutosave } = get();
    if (!project || !project.pages[index]) return;
    const target = project.pages[index];
    const duplicated: UniversalPage = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'page-' + Math.random().toString(36).substring(2, 9),
      name: `${target.name} (Copy)`,
      order: index + 1,
    };
    const updatedPages = [...project.pages];
    updatedPages.splice(index + 1, 0, duplicated);
    set({
      project: { ...project, pages: updatedPages },
      activePageIndex: index + 1,
      selectedElementIds: [],
      saveStatus: 'unsaved',
    });
    triggerAutosave();
  },

  deletePage: (index) => {
    const { project, triggerAutosave } = get();
    if (!project || project.pages.length <= 1) return;
    const updatedPages = project.pages.filter((_, i) => i !== index);
    const nextIndex = Math.max(0, index - 1);
    set({
      project: { ...project, pages: updatedPages },
      activePageIndex: nextIndex,
      selectedElementIds: [],
      saveStatus: 'unsaved',
    });
    triggerAutosave();
  },

  recordHistory: () => {
    const { project, activePageIndex, history } = get();
    if (!project || !project.pages[activePageIndex] || !history) return;
    history.push(project.pages[activePageIndex]);
    set({
      canUndo: history.canUndo,
      canRedo: history.canRedo,
    });
  },

  undo: () => {
    const { project, activePageIndex, history, triggerAutosave } = get();
    if (!project || !history || !history.canUndo) return;
    const previousPage = history.undo();
    if (!previousPage) return;

    const updatedPages = [...project.pages];
    updatedPages[activePageIndex] = previousPage;
    set({
      project: { ...project, pages: updatedPages },
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      selectedElementIds: [],
      saveStatus: 'unsaved',
    });
    triggerAutosave();
  },

  redo: () => {
    const { project, activePageIndex, history, triggerAutosave } = get();
    if (!project || !history || !history.canRedo) return;
    const nextPage = history.redo();
    if (!nextPage) return;

    const updatedPages = [...project.pages];
    updatedPages[activePageIndex] = nextPage;
    set({
      project: { ...project, pages: updatedPages },
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      selectedElementIds: [],
      saveStatus: 'unsaved',
    });
    triggerAutosave();
  },

  triggerAutosave: async () => {
    if (autosaveTimer) clearTimeout(autosaveTimer);

    set({ saveStatus: 'unsaved' });

    autosaveTimer = setTimeout(async () => {
      const { project, activePageIndex } = get();
      if (!project) return;

      set({ isSaving: true, saveStatus: 'saving' });

      try {
        const currentPage = project.pages[activePageIndex];
        if (currentPage) {
          await api.savePage(project.id, currentPage);
        }
        set({
          isSaving: false,
          saveStatus: 'saved',
          lastSavedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Autosave error', err);
        set({ isSaving: false, saveStatus: 'error' });
      }
    }, 1500); // 1.5s debounced autosave as specified in architecture
  },
}));

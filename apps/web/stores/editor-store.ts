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
  selectedNodeId: string | null;
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
  undoStack: UniversalPage[];
  redoStack: UniversalPage[];
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
  selectNode: (id: string | null) => void;
  deselectAll: () => void;
  setSelectedElementIds: (ids: string[]) => void;

  // Canvas Element Mutations
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>, shouldRecord?: boolean) => void;
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
  addFlowNode: (node: FlowNode) => void;
  updateFlowNode: (id: string, updates: Partial<FlowNode['data']> & { position?: { x: number; y: number } }) => void;
  deleteSelectedNode: () => void;
  duplicateSelectedNode: () => void;
  updateFlowNodes: (nodes: FlowNode[], shouldRecord?: boolean) => void;
  updateFlowEdges: (edges: FlowEdge[], shouldRecord?: boolean) => void;

  // Document Content & Chart Mutations
  updateDocumentContent: (content: any) => void;
  updateChartConfig: (config: any) => void;

  // Page Management
  addPage: () => void;
  duplicatePage: (index: number) => void;
  deletePage: (index: number) => void;
  movePage: (index: number, direction: 'left' | 'right') => void;
  updateActivePageBackground: (color: string) => void;
  setPageDimensions: (width: number, height: number) => void;

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
  selectedNodeId: null,
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

  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  setProject: (project) => {
    set({
      project,
      activePageIndex: 0,
      selectedElementIds: [],
      selectedNodeId: null,
      undoStack: [],
      redoStack: [],
      canUndo: false,
      canRedo: false,
      lastSavedAt: project.updatedAt,
      saveStatus: 'saved',
    });
  },

  setActivePageIndex: (index) => {
    const { project } = get();
    if (!project || !project.pages[index]) return;
    set({
      activePageIndex: index,
      selectedElementIds: [],
      selectedNodeId: null,
      undoStack: [],
      redoStack: [],
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
        return { selectedElementIds: updated, selectedNodeId: null };
      }
      return { selectedElementIds: [id], selectedNodeId: null };
    });
  },

  selectNode: (id) => set({ selectedNodeId: id, selectedElementIds: [] }),
  deselectAll: () => set({ selectedElementIds: [], selectedNodeId: null }),
  setSelectedElementIds: (ids) => set({ selectedElementIds: ids, selectedNodeId: null }),

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

  updateElement: (id, updates, shouldRecord = true) => {
    const { project, activePageIndex, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;

    if (shouldRecord) {
      recordHistory();
    }
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

  addFlowNode: (node) => {
    const { project, activePageIndex, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    const currentNodes = currentPage.nodes || [];
    currentPage.nodes = [...currentNodes, node];
    updatedPages[activePageIndex] = currentPage;
    set({
      project: { ...project, pages: updatedPages },
      selectedNodeId: node.id,
      selectedElementIds: [],
      saveStatus: 'unsaved',
    });
    triggerAutosave();
  },

  updateFlowNode: (id, updates) => {
    const { project, activePageIndex, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    const currentNodes = currentPage.nodes || [];
    currentPage.nodes = currentNodes.map((n) => {
      if (n.id === id) {
        return {
          ...n,
          position: updates.position || n.position,
          data: {
            ...n.data,
            ...updates,
            style: {
              ...(n.data.style || {}),
              ...(updates.style || {}),
            },
          },
        };
      }
      return n;
    });
    updatedPages[activePageIndex] = currentPage;
    set({ project: { ...project, pages: updatedPages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  deleteSelectedNode: () => {
    const { project, activePageIndex, selectedNodeId, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex] || !selectedNodeId) return;
    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    const currentNodes = currentPage.nodes || [];
    const currentEdges = currentPage.edges || [];
    currentPage.nodes = currentNodes.filter((n) => n.id !== selectedNodeId);
    currentPage.edges = currentEdges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId);
    updatedPages[activePageIndex] = currentPage;
    set({
      project: { ...project, pages: updatedPages },
      selectedNodeId: null,
      saveStatus: 'unsaved',
    });
    triggerAutosave();
  },

  duplicateSelectedNode: () => {
    const { project, activePageIndex, selectedNodeId, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex] || !selectedNodeId) return;
    recordHistory();
    const updatedPages = [...project.pages];
    const currentPage = { ...updatedPages[activePageIndex] };
    const currentNodes = currentPage.nodes || [];
    const target = currentNodes.find((n) => n.id === selectedNodeId);
    if (!target) return;

    const cloned: FlowNode = {
      ...JSON.parse(JSON.stringify(target)),
      id: `node-${Math.random().toString(36).substring(2, 7)}`,
      position: { x: target.position.x + 30, y: target.position.y + 30 },
      data: {
        ...target.data,
        label: `${target.data.label} (Copy)`,
      },
    };
    currentPage.nodes = [...currentNodes, cloned];
    updatedPages[activePageIndex] = currentPage;
    set({
      project: { ...project, pages: updatedPages },
      selectedNodeId: cloned.id,
      saveStatus: 'unsaved',
    });
    triggerAutosave();
  },

  updateFlowNodes: (nodes, shouldRecord = true) => {
    const { project, activePageIndex, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    if (shouldRecord) {
      recordHistory();
    }
    const updatedPages = [...project.pages];
    updatedPages[activePageIndex] = { ...updatedPages[activePageIndex], nodes };
    set({ project: { ...project, pages: updatedPages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  updateFlowEdges: (edges, shouldRecord = true) => {
    const { project, activePageIndex, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    if (shouldRecord) {
      recordHistory();
    }
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
    const { project, recordHistory, triggerAutosave } = get();
    if (!project || project.pages.length <= 1) return;
    recordHistory();
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

  movePage: (index, direction) => {
    const { project, recordHistory, triggerAutosave } = get();
    if (!project) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.pages.length) return;
    recordHistory();
    const pages = [...project.pages];
    const temp = pages[index];
    pages[index] = pages[targetIndex];
    pages[targetIndex] = temp;
    set({ project: { ...project, pages }, activePageIndex: targetIndex, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  updateActivePageBackground: (color) => {
    const { project, activePageIndex, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    recordHistory();
    const pages = [...project.pages];
    pages[activePageIndex] = {
      ...pages[activePageIndex],
      background: { ...(pages[activePageIndex].background || { type: 'solid' }), color },
    };
    set({ project: { ...project, pages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  setPageDimensions: (width, height) => {
    const { project, activePageIndex, recordHistory, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex]) return;
    recordHistory();
    const pages = [...project.pages];
    pages[activePageIndex] = {
      ...pages[activePageIndex],
      width,
      height,
    };
    set({ project: { ...project, pages }, saveStatus: 'unsaved' });
    triggerAutosave();
  },

  recordHistory: () => {
    const { project, activePageIndex, undoStack } = get();
    if (!project || !project.pages[activePageIndex]) return;
    const snapshot = JSON.parse(JSON.stringify(project.pages[activePageIndex]));
    const nextUndoStack = [...undoStack.slice(-49), snapshot];
    set({
      undoStack: nextUndoStack,
      redoStack: [],
      canUndo: true,
      canRedo: false,
    });
  },

  undo: () => {
    const { project, activePageIndex, undoStack, redoStack, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex] || undoStack.length === 0) return;
    const nextUndoStack = [...undoStack];
    const previousPage = nextUndoStack.pop()!;
    const currentSnapshot = JSON.parse(JSON.stringify(project.pages[activePageIndex]));
    const nextRedoStack = [...redoStack, currentSnapshot];

    const updatedPages = [...project.pages];
    updatedPages[activePageIndex] = previousPage;

    set({
      project: { ...project, pages: updatedPages },
      undoStack: nextUndoStack,
      redoStack: nextRedoStack,
      canUndo: nextUndoStack.length > 0,
      canRedo: true,
      selectedElementIds: [],
      selectedNodeId: null,
      saveStatus: 'unsaved',
    });
    triggerAutosave();
  },

  redo: () => {
    const { project, activePageIndex, undoStack, redoStack, triggerAutosave } = get();
    if (!project || !project.pages[activePageIndex] || redoStack.length === 0) return;
    const nextRedoStack = [...redoStack];
    const nextPage = nextRedoStack.pop()!;
    const currentSnapshot = JSON.parse(JSON.stringify(project.pages[activePageIndex]));
    const nextUndoStack = [...undoStack, currentSnapshot];

    const updatedPages = [...project.pages];
    updatedPages[activePageIndex] = nextPage;

    set({
      project: { ...project, pages: updatedPages },
      undoStack: nextUndoStack,
      redoStack: nextRedoStack,
      canUndo: true,
      canRedo: nextRedoStack.length > 0,
      selectedElementIds: [],
      selectedNodeId: null,
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


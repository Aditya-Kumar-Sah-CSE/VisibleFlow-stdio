'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import toast from 'react-hot-toast';

export function useKeyboardShortcuts(options?: {
  onOpenMathModal?: () => void;
  onOpenAIModal?: () => void;
  onOpenExportModal?: () => void;
  onOpenPresenterMode?: () => void;
}) {
  const {
    undo,
    redo,
    deleteSelectedElements,
    duplicateSelectedElements,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    groupSelected,
    ungroupSelected,
    toggleGrid,
    toggleSnap,
    deselectAll,
    selectedElementIds,
    setZoom,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing inside an input, textarea, or contentEditable element
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('.tiptap')
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo / Redo
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if ((cmdOrCtrl && e.key.toLowerCase() === 'y') || (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedNodeId, deleteSelectedNode } = useEditorStore.getState();
        if (selectedNodeId) {
          e.preventDefault();
          deleteSelectedNode();
          toast.success('Deleted node');
          return;
        }
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          deleteSelectedElements();
          toast.success('Deleted element(s)');
          return;
        }
      }

      // Duplicate: Ctrl+D
      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const { selectedNodeId, duplicateSelectedNode } = useEditorStore.getState();
        if (selectedNodeId) {
          duplicateSelectedNode();
          return;
        }
        duplicateSelectedElements();
        return;
      }

      // Group: Ctrl+G / Ungroup: Ctrl+Shift+G
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        groupSelected();
        return;
      }
      if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        ungroupSelected();
        return;
      }

      // Layer ordering
      if (e.key === ']' && !cmdOrCtrl) {
        e.preventDefault();
        bringForward();
        return;
      }
      if (e.key === '[' && !cmdOrCtrl) {
        e.preventDefault();
        sendBackward();
        return;
      }
      if (cmdOrCtrl && e.key === ']') {
        e.preventDefault();
        bringToFront();
        return;
      }
      if (cmdOrCtrl && e.key === '[') {
        e.preventDefault();
        sendToBack();
        return;
      }

      // Grid & Snap toggles
      if (!cmdOrCtrl && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        toggleGrid();
        return;
      }
      if (!cmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        toggleSnap();
        return;
      }

      // Zoom Controls: Ctrl + / Ctrl - / Ctrl 0
      if (cmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom((z) => Math.min(z + 0.1, 3.0));
        return;
      }
      if (cmdOrCtrl && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setZoom((z) => Math.max(z - 0.1, 0.2));
        return;
      }
      if (cmdOrCtrl && e.key === '0') {
        e.preventDefault();
        setZoom(1);
        return;
      }

      // Presenter Mode (F5)
      if (e.key === 'F5') {
        e.preventDefault();
        options?.onOpenPresenterMode?.();
        return;
      }

      // Deselect (Escape)
      if (e.key === 'Escape') {
        deselectAll();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    deleteSelectedElements,
    duplicateSelectedElements,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    groupSelected,
    ungroupSelected,
    toggleGrid,
    toggleSnap,
    deselectAll,
    selectedElementIds,
    setZoom,
    options,
  ]);
}

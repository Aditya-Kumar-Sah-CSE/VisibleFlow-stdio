'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useEditorStore } from '@/stores/editor-store';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sigma,
} from 'lucide-react';

interface DocumentRendererProps {
  onOpenMathModal: () => void;
}

export default function DocumentRenderer({ onOpenMathModal }: DocumentRendererProps) {
  const { project, activePageIndex, updateDocumentContent } = useEditorStore();
  const activePage = project?.pages[activePageIndex];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: activePage?.documentContent?.content?.length
      ? activePage.documentContent
      : `
        <h1>System Architecture Specification</h1>
        <p>This document details the multi-studio visual document engine, mathematical formatting pipeline, and data synchronization layer.</p>
        <h2>1. Mathematical Formulations</h2>
        <p>The system computes spatial alignment guides using orthogonal bounding projections:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Parameter</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Expression</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Significance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">Coordinate Snapping</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">x' = round(x / G) * G</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">Aligns elements to 20px raster</td>
            </tr>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">Definite Integral</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">∫₀^∞ e^(-x²) dx = √π / 2</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">KaTeX Vector Typography</td>
            </tr>
          </tbody>
        </table>
        <h2>2. Data Pipeline Execution</h2>
        <p>Real-time updates stream via WebSocket presence channels with debounced persistence.</p>
      `,
    onUpdate: ({ editor }) => {
      updateDocumentContent(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[900px] text-slate-800 text-sm leading-relaxed',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 overflow-y-auto">
      {/* Document Floating Toolbar */}
      <div className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 px-6 py-2 flex items-center justify-center space-x-1 shadow-md backdrop-blur-md">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bold') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('italic') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('underline') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-1" />

        <button
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          className="p-1.5 rounded text-slate-300 hover:bg-slate-800 transition-colors"
          title="Insert Table (3x3)"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenMathModal}
          className="px-2.5 py-1 rounded bg-indigo-950/70 border border-indigo-700/60 text-indigo-300 text-xs font-semibold flex items-center space-x-1 hover:bg-indigo-900 transition-colors"
          title="Insert Equation (Zero-LaTeX)"
        >
          <Sigma className="w-3.5 h-3.5 text-indigo-400" />
          <span>Insert Math</span>
        </button>
      </div>

      {/* Paginated Paper Page Container (Standard A4 Dimension ~794px x 1123px) */}
      <div className="flex-1 py-12 flex justify-center items-start">
        <div
          className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-16 shadow-2xl rounded-sm border border-slate-200 relative"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Header Margins */}
          <div className="border-b border-slate-200 pb-3 mb-8 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>VisualFlow Studio Document</span>
            <span>A4 Document</span>
          </div>

          <EditorContent editor={editor} />

          {/* Footer Margins */}
          <div className="absolute bottom-6 left-16 right-16 border-t border-slate-200 pt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Confidential & Proprietary</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

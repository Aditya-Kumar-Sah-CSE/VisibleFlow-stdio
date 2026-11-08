'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Presentation,
  Image,
  Code,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import pptxgen from 'pptxgenjs';
import { toPng, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { project, activePageIndex } = useEditorStore();
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'pptx' | 'png' | 'svg' | 'json'>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !project) return null;

  const activePage = project.pages[activePageIndex] || project.pages[0];
  const filename = (project.title || 'visualflow-studio').toLowerCase().replace(/\s+/g, '-');

  const handleExport = async () => {
    setIsExporting(true);

    try {
      if (selectedFormat === 'json') {
        // Direct JSON export
        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Downloaded project JSON');
      } else if (selectedFormat === 'pptx') {
        // Native PptxGenJS client generation
        const pptx = new pptxgen();
        pptx.layout = 'LAYOUT_16x9';
        pptx.title = project.title;

        for (const page of project.pages) {
          const slide = pptx.addSlide();
          slide.background = { color: (page.background?.color || '#0f172a').replace('#', '') };

          for (const el of page.elements) {
            const xIn = (el.x / (page.width || 1280)) * 10;
            const yIn = (el.y / (page.height || 720)) * 5.625;
            const wIn = (el.width / (page.width || 1280)) * 10;
            const hIn = (el.height / (page.height || 720)) * 5.625;

            if (el.type === 'text') {
              slide.addText(el.text || '', {
                x: xIn,
                y: yIn,
                w: Math.max(wIn, 1),
                h: Math.max(hIn, 0.4),
                fontSize: el.style?.fontSize ? Math.round(el.style.fontSize * 0.75) : 18,
                color: (el.style?.color || '#ffffff').replace('#', ''),
                bold: el.style?.fontWeight === 'bold',
                align: el.style?.textAlign || 'left',
              });
            } else if (el.type === 'shape') {
              slide.addShape(pptx.ShapeType.rect, {
                x: xIn,
                y: yIn,
                w: wIn,
                h: hIn,
                fill: { color: (el.style?.fill || '#3b82f6').replace('#', '') },
                line: {
                  color: (el.style?.stroke || '#1d4ed8').replace('#', ''),
                  width: el.style?.strokeWidth || 1,
                },
              });
              if (el.text) {
                slide.addText(el.text, {
                  x: xIn,
                  y: yIn,
                  w: wIn,
                  h: hIn,
                  fontSize: 14,
                  color: (el.style?.color || '#ffffff').replace('#', ''),
                  align: 'center',
                });
              }
            }
          }
        }

        await pptx.writeFile({ fileName: `${filename}.pptx` });
        toast.success('Generated editable PPTX presentation');
      } else if (selectedFormat === 'png') {
        const node = document.getElementById('studio-canvas-container') || document.body;
        const dataUrl = await toPng(node, {
          cacheBust: true,
          backgroundColor: '#090d16',
          pixelRatio: 2,
        });

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Downloaded high-resolution PNG');
      } else if (selectedFormat === 'svg') {
        const node = document.getElementById('studio-canvas-container') || document.body;
        const dataUrl = await toSvg(node, { cacheBust: true });

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${filename}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Downloaded SVG vector graphic');
      } else if (selectedFormat === 'pdf') {
        const node = document.getElementById('studio-canvas-container') || document.body;
        const dataUrl = await toPng(node, {
          cacheBust: true,
          backgroundColor: '#090d16',
          pixelRatio: 2,
        });

        const w = activePage?.width || 1280;
        const h = activePage?.height || 720;
        const isLandscape = w >= h;

        const pdf = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'px',
          format: [w, h],
        });

        pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
        pdf.save(`${filename}.pdf`);
        toast.success('Downloaded high-quality PDF document');
      }

      onClose();
    } catch (err: any) {
      console.error('Export error:', err);
      toast.error('Export encountered an error');
    } finally {
      setIsExporting(false);
    }
  };

  const formats = [
    {
      id: 'pdf' as const,
      name: 'PDF Document',
      desc: 'High-DPI vector document ready for printing & archiving',
      icon: FileText,
    },
    {
      id: 'pptx' as const,
      name: 'PowerPoint (.pptx)',
      desc: 'Native Microsoft PowerPoint presentation with editable text and shapes',
      icon: Presentation,
    },
    {
      id: 'png' as const,
      name: 'PNG Image',
      desc: 'High-resolution raster graphic for sharing & presentations',
      icon: Image,
    },
    {
      id: 'svg' as const,
      name: 'Scalable Vector (.svg)',
      desc: 'Infinite resolution vector graphic for web and print assets',
      icon: Code,
    },
    {
      id: 'json' as const,
      name: 'Project Schema JSON',
      desc: 'Portable canonical JSON format preserving all structure and history',
      icon: Code,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Export Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Select Output Format
          </label>

          <div className="space-y-2">
            {formats.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = selectedFormat === fmt.id;
              return (
                <div
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-center space-x-3.5 transition-all ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{fmt.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{fmt.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md flex items-center space-x-1.5 transition-colors"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Check,
  RefreshCw,
  GitBranch,
  Presentation,
  FileText,
  BarChart3,
  Sigma,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useEditorStore } from '@/stores/editor-store';
import toast from 'react-hot-toast';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistantDrawer({ isOpen, onClose }: AIAssistantDrawerProps) {
  const { project, updateFlowNodes, updateFlowEdges, updateChartConfig, addPage } = useEditorStore();

  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<string>(project?.type || 'flowchart');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const result = await api.generateWithAI(prompt.trim(), category);
      setGeneratedResult(result);
      toast.success('Generated preview ready');
    } catch {
      toast.error('AI generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToStudio = () => {
    if (!generatedResult) return;

    if (category === 'flowchart' && generatedResult.nodes) {
      updateFlowNodes(generatedResult.nodes);
      if (generatedResult.edges) updateFlowEdges(generatedResult.edges);
      toast.success('Applied generated flowchart to canvas');
    } else if (category === 'chart' && generatedResult.chartConfig) {
      updateChartConfig(generatedResult.chartConfig);
      toast.success('Applied generated chart configuration');
    } else if (category === 'slide' && generatedResult.pages) {
      for (const p of generatedResult.pages) {
        addPage();
      }
      toast.success('Inserted AI presentation slides');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Studio Assistant</h2>
              <p className="text-[11px] text-slate-400">Structured generation for all visual studios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Studio Category Selection */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Target Studio Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('flowchart')}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                  category === 'flowchart' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Flowchart</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('slide')}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                  category === 'slide' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>Slides</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('chart')}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                  category === 'chart' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Chart</span>
              </button>
            </div>
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Generation Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Create an asynchronous customer order checkout pipeline with payment gateway and dead-letter retry"
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-600/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Schema...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Structure</span>
                </>
              )}
            </button>
          </form>

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  ✓ Validated Structured Output
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {generatedResult.nodes?.length || generatedResult.pages?.length || 1} entities
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 max-h-56 overflow-y-auto text-[11px] font-mono text-slate-300">
                <pre>{JSON.stringify(generatedResult, null, 2)}</pre>
              </div>

              <button
                onClick={handleApplyToStudio}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Apply & Insert into Project</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

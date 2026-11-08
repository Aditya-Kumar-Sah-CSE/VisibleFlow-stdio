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
  Zap,
  Cpu,
  KeyRound,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useEditorStore } from '@/stores/editor-store';
import toast from 'react-hot-toast';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistantDrawer({ isOpen, onClose }: AIAssistantDrawerProps) {
  const {
    project,
    updateFlowNodes,
    updateFlowEdges,
    updateChartConfig,
    updateDocumentContent,
    addPage,
    addElement,
  } = useEditorStore();

  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<string>(project?.type || 'flowchart');
  const [provider, setProvider] = useState<'gemini' | 'groq' | 'openrouter' | 'auto'>('gemini');
  const [customKey, setCustomKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const result = await api.generateWithAI(prompt.trim(), category, provider, customKey || undefined);
      setGeneratedResult(result);
      toast.success(
        result?._meta?.liveApi
          ? `Generated with live ${provider.toUpperCase()}`
          : 'Generated validated visual structure'
      );
    } catch {
      toast.error('AI generation encountered an issue, check prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToStudio = () => {
    if (!generatedResult) return;

    if ((category === 'flowchart' || category === 'diagram') && generatedResult.nodes) {
      updateFlowNodes(generatedResult.nodes);
      if (generatedResult.edges) updateFlowEdges(generatedResult.edges);
      toast.success('Applied generated diagram to canvas');
    } else if (category === 'chart' && generatedResult.chartConfig) {
      updateChartConfig(generatedResult.chartConfig);
      toast.success('Applied generated chart configuration');
    } else if (category === 'slide' && generatedResult.pages) {
      const { setProject, project: curProj, recordHistory, triggerAutosave } = useEditorStore.getState();
      if (curProj) {
        recordHistory();
        const newPages = generatedResult.pages.map((p: any, idx: number) => ({
          id: p.id || `slide-${Date.now()}-${idx}`,
          name: p.name || `Slide ${idx + 1}`,
          width: p.width || 1280,
          height: p.height || 720,
          unit: p.unit || 'px',
          background: p.background || { type: 'solid', color: idx === 0 ? '#090d16' : '#ffffff' },
          elements: p.elements || [],
          nodes: [],
          edges: [],
        }));
        setProject({
          ...curProj,
          pages: newPages,
        });
        triggerAutosave();
        toast.success(`Generated & applied ${newPages.length} modern presentation slides!`);
      }
    } else if (category === 'document' && generatedResult.content) {
      updateDocumentContent(generatedResult.content);
      toast.success('Updated document content');
    }

    onClose();
  };

  const providers = [
    {
      id: 'gemini',
      name: 'Google Gemini API',
      badge: '1M Ctx • Built-in Secret Active',
      keyPreview: 'AQ.Ab8RN6K9xH3IBqa98...-622V-oKetg93Q',
      icon: <Sparkles className="w-3.5 h-3.5 text-blue-400" />,
      color: 'border-blue-500/40 text-blue-300',
    },
    {
      id: 'groq',
      name: 'Groq LPU (Ultra-Fast 300+ Tokens/Sec)',
      badge: '<300ms • Built-in Secret Active',
      keyPreview: 'gsk_MjWwmFlIHBM7Tgd5...P9nxUPzki',
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
      color: 'border-amber-500/40 text-amber-300',
    },
    {
      id: 'openrouter',
      name: 'OpenRouter (Multi-Model Gateway)',
      badge: '100+ Models • Built-in Secret Active',
      keyPreview: 'sk-or-v1-5f270afaa72d...4dbe3acd16',
      icon: <Cpu className="w-3.5 h-3.5 text-purple-400" />,
      color: 'border-purple-500/40 text-purple-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>AI Studio Assistant</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-normal">
                  Online
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Structured visual generation for all studios</p>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* AI Provider Config Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                AI Engine & Provider
              </label>
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>{showKeyInput ? 'Hide Custom Key' : 'Override Key'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {providers.map((p) => {
                const isSelected = provider === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setProvider(p.id as any)}
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? `bg-slate-950 ${p.color} ring-1 ring-blue-500/50 shadow-md`
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {p.icon}
                        <span className="text-xs font-semibold text-white">{p.name}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
                        {p.badge}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-slate-500 truncate">
                      {p.keyPreview}
                    </div>
                  </div>
                );
              })}
            </div>

            {showKeyInput && (
              <div className="mt-2 p-2 bg-slate-950 border border-slate-800 rounded-lg">
                <label className="text-[10px] text-slate-400 block mb-1">
                  Custom API Key for {provider.toUpperCase()}
                </label>
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="Paste custom secret key..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Studio Target Category */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Output Studio Target
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
              <button
                type="button"
                onClick={() => setCategory('diagram')}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                  category === 'diagram' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Diagram</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('document')}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                  category === 'document' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Document</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('equation')}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                  category === 'equation' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Sigma className="w-3.5 h-3.5" />
                <span>Equation</span>
              </button>
            </div>
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Prompt Instructions
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt('Create an asynchronous customer order checkout pipeline with payment gateway, retry policy and database persistence')
                  }
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  Use Example
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Asynchronous event-driven order checkout architecture with microservice failover"
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-600/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing via {provider.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Structure with AI</span>
                </>
              )}
            </button>
          </form>

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Validated Schema Ready</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {generatedResult.nodes?.length
                    ? `${generatedResult.nodes.length} nodes`
                    : generatedResult.pages?.length
                    ? `${generatedResult.pages.length} slides`
                    : '1 structure'}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 max-h-52 overflow-y-auto text-[11px] font-mono text-slate-300">
                <pre>{JSON.stringify(generatedResult, null, 2)}</pre>
              </div>

              <button
                onClick={handleApplyToStudio}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-emerald-600/30"
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

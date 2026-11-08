'use client';

import React, { useState } from 'react';
import {
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  ArrowRight,
  GitBranch,
  Database,
  Cloud,
  FileText,
  Table,
  BarChart3,
  Sigma,
  Sparkles,
  Layers,
  Hexagon,
  MessageSquare,
  Plus,
  Image as ImageIcon,
  Wand2,
  Download,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { createDefaultElement } from '@visualflow/document-schema';
import type { ShapeKind, FlowNodeType } from '@visualflow/shared-types';
import { VISUAL_MATH_TEMPLATES } from '@visualflow/editor-core';
import toast from 'react-hot-toast';

interface ElementLibrarySidebarProps {
  onOpenMathModal: () => void;
}

export function ElementLibrarySidebar({ onOpenMathModal }: ElementLibrarySidebarProps) {
  const { project, addElement, addFlowNode, updateChartConfig } = useEditorStore();
  const [activeCategory, setActiveCategory] = useState<
    'shapes' | 'text' | 'flowchart' | 'arrows' | 'charts' | 'math' | 'images'
  >(project?.type === 'flowchart' ? 'flowchart' : project?.type === 'chart' ? 'charts' : 'shapes');

  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const handleInsertImage = (url: string, name = 'Visual Asset') => {
    const el = createDefaultElement('image', 200, 160, {
      imageUrl: url,
      name,
      width: 440,
      height: 260,
      style: {
        fill: 'transparent',
        stroke: '#3b82f6',
        strokeWidth: 1,
        cornerRadius: 12,
        opacity: 1,
      },
    });
    addElement(el);
    toast.success(`Inserted ${name}`);
  };

  const handleGenerateAIImage = (promptToUse?: string) => {
    const p = (promptToUse || aiImagePrompt).trim();
    if (!p) {
      toast.error('Please enter an image prompt');
      return;
    }

    setIsGeneratingImage(true);
    const seed = Math.floor(Math.random() * 900000) + 100000;
    const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      p
    )}?width=800&height=480&nologo=true&seed=${seed}`;

    handleInsertImage(generatedUrl, `AI: ${p.slice(0, 24)}`);
    setIsGeneratingImage(false);
    toast.success('Generated AI Visual & Added to Canvas');
  };

  const handleAddText = (fontSize = 20, fontWeight = 'normal', text = 'New Text Block') => {
    if (project?.type === 'flowchart' || project?.type === 'diagram') {
      const newNode = {
        id: `node-${Math.random().toString(36).substring(2, 7)}`,
        type: 'custom',
        position: { x: 220 + Math.random() * 60, y: 160 + Math.random() * 60 },
        data: {
          label: text,
          nodeType: 'process' as any,
          shapeKind: 'rectangle' as any,
          style: {
            fill: '#0f172a',
            stroke: '#3b82f6',
            strokeWidth: 1.5,
            color: '#f8fafc',
            fontSize,
          },
        },
      };
      addFlowNode(newNode);
      toast.success('Added text block to flowchart');
      return;
    }

    const el = createDefaultElement('text', 200, 200, {
      text,
      style: {
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
        opacity: 1,
        fontFamily: 'Inter, sans-serif',
        fontSize,
        fontWeight: fontWeight as any,
        color: '#0f172a',
        textAlign: 'left',
      },
    });
    addElement(el);
    toast.success('Added text block');
  };

  const handleAddShape = (shapeKind: ShapeKind, fill = '#3b82f6', stroke = '#1d4ed8') => {
    if (project?.type === 'flowchart' || project?.type === 'diagram') {
      const newNode = {
        id: `node-${Math.random().toString(36).substring(2, 7)}`,
        type: 'custom',
        position: { x: 200 + Math.random() * 70, y: 150 + Math.random() * 70 },
        data: {
          label: shapeKind.replace('-', ' ').toUpperCase(),
          nodeType: (shapeKind === 'diamond' ? 'decision' : 'process') as FlowNodeType,
          shapeKind,
          style: {
            fill,
            stroke,
            strokeWidth: 2,
            color: '#ffffff',
          },
        },
      };
      addFlowNode(newNode);
      toast.success(`Added ${shapeKind} node`);
      return;
    }

    const el = createDefaultElement('shape', 250, 200, {
      shapeKind,
      style: {
        fill,
        stroke,
        strokeWidth: 2,
        opacity: 1,
        cornerRadius: shapeKind === 'rounded-rect' ? 12 : 4,
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        color: '#ffffff',
        textAlign: 'center',
        verticalAlign: 'middle',
      },
    });
    addElement(el);
    toast.success(`Added ${shapeKind}`);
  };

  const handleAddArrow = (endArrow: 'arrow' | 'diamond' | 'circle' = 'arrow', strokeStyle: 'solid' | 'dashed' = 'solid') => {
    const el = createDefaultElement('arrow', 200, 250, {
      points: [0, 20, 180, 20],
      style: {
        fill: '#1e293b',
        stroke: '#1e293b',
        strokeWidth: 3,
        strokeStyle,
        endArrow,
        opacity: 1,
      },
    });
    addElement(el);
    toast.success('Added connector arrow');
  };

  const handleAddFlowNode = (nodeType: FlowNodeType, label: string) => {
    if (!project) return;
    const newNode = {
      id: `node-${Math.random().toString(36).substring(2, 7)}`,
      type: 'custom',
      position: { x: 220 + Math.random() * 80, y: 160 + Math.random() * 80 },
      data: {
        label,
        nodeType,
        style: {
          fill: '#0f172a',
          stroke: nodeType === 'decision' ? '#f59e0b' : nodeType === 'database' ? '#a855f7' : nodeType === 'cloud' ? '#06b6d4' : '#3b82f6',
          strokeWidth: 2,
          color: '#ffffff',
        },
      },
    };

    addFlowNode(newNode);
    toast.success(`Added ${label} node`);
  };

  const handleInsertMathTemplate = (key: string) => {
    const tmpl = VISUAL_MATH_TEMPLATES[key];
    if (!tmpl) return;

    if (project?.type === 'flowchart' || project?.type === 'diagram') {
      const newNode = {
        id: `node-${Math.random().toString(36).substring(2, 7)}`,
        type: 'custom',
        position: { x: 200 + Math.random() * 70, y: 150 + Math.random() * 70 },
        data: {
          label: tmpl.name,
          nodeType: 'process' as FlowNodeType,
          shapeKind: 'rounded-rect' as ShapeKind,
          equationAst: tmpl.ast,
          style: {
            fill: '#0f172a',
            stroke: '#6366f1',
            strokeWidth: 2,
            color: '#c7d2fe',
          },
        },
      };
      addFlowNode(newNode);
      toast.success(`Inserted ${tmpl.name} node`);
      return;
    }

    const el = createDefaultElement('equation', 220, 180, {
      name: tmpl.name,
      equationAst: tmpl.ast,
      width: 260,
      height: 80,
      style: {
        fill: '#ffffff',
        stroke: '#6366f1',
        strokeWidth: 1.5,
        cornerRadius: 8,
        opacity: 1,
      },
    });
    addElement(el);
    toast.success(`Inserted ${tmpl.name}`);
  };

  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col select-none shrink-0 z-20">
      {/* Category Tabs */}
      <div className="grid grid-cols-7 border-b border-slate-800 p-1 bg-slate-900/70 text-slate-400">
        <button
          onClick={() => setActiveCategory('shapes')}
          className={`p-2 rounded flex justify-center transition-colors ${
            activeCategory === 'shapes' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-white'
          }`}
          title="Shapes"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveCategory('text')}
          className={`p-2 rounded flex justify-center transition-colors ${
            activeCategory === 'text' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-white'
          }`}
          title="Text"
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveCategory('images')}
          className={`p-2 rounded flex justify-center transition-colors ${
            activeCategory === 'images' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-white'
          }`}
          title="Images & AI Visuals"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveCategory('flowchart')}
          className={`p-2 rounded flex justify-center transition-colors ${
            activeCategory === 'flowchart' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-white'
          }`}
          title="Flowchart Nodes"
        >
          <GitBranch className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveCategory('arrows')}
          className={`p-2 rounded flex justify-center transition-colors ${
            activeCategory === 'arrows' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-white'
          }`}
          title="Connectors & Arrows"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveCategory('charts')}
          className={`p-2 rounded flex justify-center transition-colors ${
            activeCategory === 'charts' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-white'
          }`}
          title="Charts"
        >
          <BarChart3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveCategory('math')}
          className={`p-2 rounded flex justify-center transition-colors ${
            activeCategory === 'math' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-white'
          }`}
          title="Visual Math Equations"
        >
          <Sigma className="w-4 h-4" />
        </button>
      </div>

      {/* Category Content Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* SHAPES CATEGORY */}
        {activeCategory === 'shapes' && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Geometric Shapes</div>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleAddShape('rectangle')}
                className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 hover:bg-slate-850 flex flex-col items-center justify-center space-y-1.5 transition-colors"
              >
                <div className="w-7 h-5 bg-blue-500/30 border border-blue-400 rounded-sm" />
                <span className="text-[10px] text-slate-300">Rectangle</span>
              </button>
              <button
                onClick={() => handleAddShape('rounded-rect')}
                className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 hover:bg-slate-850 flex flex-col items-center justify-center space-y-1.5 transition-colors"
              >
                <div className="w-7 h-5 bg-indigo-500/30 border border-indigo-400 rounded-lg" />
                <span className="text-[10px] text-slate-300">Rounded</span>
              </button>
              <button
                onClick={() => handleAddShape('circle')}
                className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 hover:bg-slate-850 flex flex-col items-center justify-center space-y-1.5 transition-colors"
              >
                <div className="w-6 h-6 bg-emerald-500/30 border border-emerald-400 rounded-full" />
                <span className="text-[10px] text-slate-300">Circle</span>
              </button>
              <button
                onClick={() => handleAddShape('diamond')}
                className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 hover:bg-slate-850 flex flex-col items-center justify-center space-y-1.5 transition-colors"
              >
                <div className="w-5 h-5 bg-amber-500/30 border border-amber-400 rotate-45" />
                <span className="text-[10px] text-slate-300">Diamond</span>
              </button>
              <button
                onClick={() => handleAddShape('triangle')}
                className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 hover:bg-slate-850 flex flex-col items-center justify-center space-y-1.5 transition-colors"
              >
                <Triangle className="w-6 h-6 text-purple-400" />
                <span className="text-[10px] text-slate-300">Triangle</span>
              </button>
              <button
                onClick={() => handleAddShape('star')}
                className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 hover:bg-slate-850 flex flex-col items-center justify-center space-y-1.5 transition-colors"
              >
                <Star className="w-6 h-6 text-amber-400" />
                <span className="text-[10px] text-slate-300">Star</span>
              </button>
            </div>
          </div>
        )}

        {/* TEXT CATEGORY */}
        {activeCategory === 'text' && (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Typography Presets</div>
            <button
              onClick={() => handleAddText(36, 'bold', 'Large Title')}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 text-left transition-colors"
            >
              <span className="font-extrabold text-lg text-white block">Heading 1</span>
              <span className="text-[11px] text-slate-400">Primary slide & document title</span>
            </button>
            <button
              onClick={() => handleAddText(24, 'bold', 'Section Subheading')}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 text-left transition-colors"
            >
              <span className="font-bold text-sm text-slate-200 block">Subheading</span>
              <span className="text-[11px] text-slate-400">Section heading and callouts</span>
            </button>
            <button
              onClick={() => handleAddText(16, 'normal', 'Paragraph body text with readable typography.')}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 text-left transition-colors"
            >
              <span className="text-xs text-slate-300 block">Body Text</span>
              <span className="text-[11px] text-slate-400">Multi-line editorial paragraph</span>
            </button>
          </div>
        )}

        {/* FLOWCHART CATEGORY */}
        {activeCategory === 'flowchart' && (
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Flowchart Nodes</div>
            <button
              onClick={() => handleAddFlowNode('start', 'Start Workflow')}
              className="w-full p-2.5 bg-slate-900 border border-emerald-500/40 rounded-lg hover:bg-slate-850 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  S
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Start / End Node</span>
                  <span className="text-[10px] text-slate-400">Rounded terminal</span>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => handleAddFlowNode('process', 'Process Action')}
              className="w-full p-2.5 bg-slate-900 border border-blue-500/40 rounded-lg hover:bg-slate-850 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  P
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Process Step</span>
                  <span className="text-[10px] text-slate-400">Execution action</span>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => handleAddFlowNode('decision', 'Condition Check?')}
              className="w-full p-2.5 bg-slate-900 border border-amber-500/40 rounded-lg hover:bg-slate-850 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  ?
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Decision Branch</span>
                  <span className="text-[10px] text-slate-400">True/False evaluation</span>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => handleAddFlowNode('database', 'Database Storage')}
              className="w-full p-2.5 bg-slate-900 border border-purple-500/40 rounded-lg hover:bg-slate-850 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Database className="w-5 h-5 text-purple-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Database</span>
                  <span className="text-[10px] text-slate-400">Data store & query</span>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => handleAddFlowNode('cloud', 'Cloud Service')}
              className="w-full p-2.5 bg-slate-900 border border-cyan-500/40 rounded-lg hover:bg-slate-850 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Cloud Service</span>
                  <span className="text-[10px] text-slate-400">API or Microservice</span>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        )}

        {/* ARROWS CATEGORY */}
        {activeCategory === 'arrows' && (
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Connectors</div>
            <button
              onClick={() => handleAddArrow('arrow', 'solid')}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 flex items-center justify-between transition-colors"
            >
              <span className="text-xs text-slate-200">Standard Solid Arrow</span>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </button>
            <button
              onClick={() => handleAddArrow('arrow', 'dashed')}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 flex items-center justify-between transition-colors"
            >
              <span className="text-xs text-slate-200">Dashed Connector</span>
              <span className="font-mono text-xs text-slate-400">- - -&gt;</span>
            </button>
          </div>
        )}

        {/* CHARTS CATEGORY */}
        {activeCategory === 'charts' && (
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">ECharts Visualizations</div>
            {[
              { type: 'bar', label: 'Bar Chart', desc: 'Category comparison' },
              { type: 'line', label: 'Line / Trend Chart', desc: 'Time-series trends' },
              { type: 'pie', label: 'Pie & Donut', desc: 'Portion of whole' },
              { type: 'scatter', label: 'Scatter Plot', desc: 'Correlation matrix' },
              { type: 'radar', label: 'Radar Performance', desc: 'Multi-variable scoring' },
            ].map((c) => (
              <button
                key={c.type}
                onClick={() => {
                  updateChartConfig({ type: c.type });
                  toast.success(`Switched to ${c.label}`);
                }}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-lg text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{c.label}</span>
                  <span className="text-[10px] text-slate-400">{c.desc}</span>
                </div>
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </button>
            ))}
          </div>
        )}

        {/* MATH CATEGORY (Zero-LaTeX Engine) */}
        {activeCategory === 'math' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Zero-LaTeX Formulas</span>
              <button
                onClick={onOpenMathModal}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
              >
                + Builder
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(VISUAL_MATH_TEMPLATES).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => handleInsertMathTemplate(key)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-indigo-500 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.name}</span>
                    <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{item.description}</span>
                </button>
              ))}
            </div>

            <button
              onClick={onOpenMathModal}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-md"
            >
              <Sigma className="w-4 h-4" />
              <span>Open Visual Math Builder</span>
            </button>
          </div>
        )}

        {/* IMAGES & AI VISUALS CATEGORY */}
        {activeCategory === 'images' && (
          <div className="space-y-4">
            {/* AI Image Generator Section */}
            <div className="p-3 bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 rounded-xl space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>AI Visual Generator</span>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-normal">
                  Instant
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Describe an image to generate and insert directly into your slide or document.
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={aiImagePrompt}
                  onChange={(e) => setAiImagePrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateAIImage()}
                  placeholder="e.g. Modern futuristic cloud server room, cinematic..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />

                {/* Quick Prompt Chips */}
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {[
                    'Cloud Architecture',
                    'Cybersecurity Hub',
                    'Minimalist Workspace',
                    'Executive Analytics',
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        setAiImagePrompt(chip);
                        handleGenerateAIImage(chip);
                      }}
                      className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleGenerateAIImage()}
                  disabled={isGeneratingImage || !aiImagePrompt.trim()}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-md"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate AI Image</span>
                </button>
              </div>
            </div>

            {/* Curated Unsplash Gallery */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Curated Visual Assets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    name: 'Cloud Tech',
                    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
                  },
                  {
                    name: 'Architecture',
                    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
                  },
                  {
                    name: 'Modern Office',
                    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
                  },
                  {
                    name: 'Data Analytics',
                    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
                  },
                  {
                    name: 'Executive Team',
                    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
                  },
                  {
                    name: 'Abstract Neon',
                    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    onClick={() => handleInsertImage(item.url, item.name)}
                    className="group relative h-20 rounded-lg overflow-hidden border border-slate-800 hover:border-blue-500 cursor-pointer transition-all shadow-sm"
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] font-semibold text-white drop-shadow truncate">
                        {item.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Image URL */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Custom Web Image
              </span>
              <div className="flex space-x-1.5">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (customImageUrl.trim()) {
                      handleInsertImage(customImageUrl.trim(), 'Custom Image');
                      setCustomImageUrl('');
                    }
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}


'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '@/stores/editor-store';
import {
  GitBranch,
  Database,
  Cloud,
  Layers,
  HelpCircle,
  FileText,
  Workflow,
  Plus,
  Sparkles,
  Square,
  Circle,
  Diamond,
} from 'lucide-react';
import toast from 'react-hot-toast';
import katex from 'katex';
import { compileMathASTToLatex } from '@visualflow/editor-core';

// Custom Flow Node Component
function CustomStudioNode({ id, data, isConnectable, selected }: any) {
  const { nodeType = 'process', label = 'Step', shapeKind = 'rectangle', style: customStyle = {}, equationAst, mathLatex } = data;

  const renderedLatex = useMemo(() => {
    if (mathLatex) return mathLatex;
    if (equationAst) {
      try {
        return compileMathASTToLatex(equationAst);
      } catch {
        return null;
      }
    }
    return null;
  }, [mathLatex, equationAst]);

  const mathHtml = useMemo(() => {
    if (!renderedLatex) return null;
    try {
      return katex.renderToString(renderedLatex, { throwOnError: false, displayMode: false });
    } catch {
      return null;
    }
  }, [renderedLatex]);

  const getNodeClass = () => {
    if (shapeKind === 'circle') {
      return 'rounded-full w-28 h-28 flex flex-col items-center justify-center';
    }
    if (shapeKind === 'diamond' || nodeType === 'decision') {
      return 'rounded-xl px-5 py-4 min-w-[150px] border-amber-500 bg-amber-950/50 text-amber-300';
    }
    switch (nodeType) {
      case 'start':
      case 'end':
        return 'border-emerald-500 bg-emerald-950/50 text-emerald-300 rounded-full px-6 py-2.5';
      case 'database':
        return 'border-purple-500 bg-purple-950/50 text-purple-300 rounded-lg px-5 py-3';
      case 'cloud':
        return 'border-cyan-500 bg-cyan-950/50 text-cyan-300 rounded-2xl px-5 py-3';
      case 'process':
      default:
        return 'border-blue-500 bg-blue-950/50 text-blue-200 rounded-lg px-5 py-3';
    }
  };

  const getIcon = () => {
    if (shapeKind === 'circle') return <Circle className="w-3.5 h-3.5 mr-1 text-emerald-400" />;
    if (shapeKind === 'diamond' || nodeType === 'decision') return <HelpCircle className="w-3.5 h-3.5 mr-1 text-amber-400" />;
    switch (nodeType) {
      case 'start':
      case 'end':
        return <GitBranch className="w-3.5 h-3.5 mr-1 text-emerald-400" />;
      case 'database':
        return <Database className="w-3.5 h-3.5 mr-1 text-purple-400" />;
      case 'cloud':
        return <Cloud className="w-3.5 h-3.5 mr-1 text-cyan-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 mr-1 text-blue-400" />;
    }
  };

  const inlineStyle: React.CSSProperties = {
    backgroundColor: customStyle.fill || undefined,
    borderColor: customStyle.stroke || undefined,
    borderWidth: customStyle.strokeWidth ? `${customStyle.strokeWidth}px` : undefined,
    color: customStyle.color || undefined,
  };

  return (
    <div
      style={inlineStyle}
      className={`border-2 shadow-2xl backdrop-blur-md min-w-[140px] text-center text-xs font-bold transition-all duration-150 cursor-pointer ${
        selected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 scale-105' : 'hover:scale-[1.02]'
      } ${getNodeClass()}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2.5 h-2.5 !bg-slate-400 border-2 !border-slate-900"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2.5 h-2.5 !bg-slate-400 border-2 !border-slate-900"
      />

      <div className="flex flex-col items-center justify-center space-y-1">
        <div className="flex items-center justify-center">
          {getIcon()}
          <span>{label}</span>
        </div>
        {mathHtml && (
          <div
            className="text-[11px] font-normal text-indigo-300 pointer-events-none mt-1"
            dangerouslySetInnerHTML={{ __html: mathHtml }}
          />
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2.5 h-2.5 !bg-blue-500 border-2 !border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2.5 h-2.5 !bg-blue-500 border-2 !border-slate-900"
      />
    </div>
  );
}

export default function FlowchartRenderer() {
  const {
    project,
    activePageIndex,
    selectedNodeId,
    selectNode,
    setSelectedElementIds,
    addFlowNode,
    updateFlowNodes,
    updateFlowEdges,
  } = useEditorStore();

  const activePage = project?.pages[activePageIndex];

  const initialNodes: Node[] = useMemo(() => {
    return (activePage?.nodes || []).map((n) => ({
      id: n.id,
      type: 'custom',
      position: n.position,
      data: n.data,
      selected: n.id === selectedNodeId,
    }));
  }, [activePage?.nodes, selectedNodeId]);

  const initialEdges: Edge[] = useMemo(() => {
    return (activePage?.edges || []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: e.type || 'smoothstep',
      animated: e.animated ?? true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }));
  }, [activePage?.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Synchronize when store nodes change externally (e.g. from sidebar, AI assistant, or properties panel)
  useEffect(() => {
    const storeNodes = activePage?.nodes || [];
    setNodes((prevNodes) => {
      // Check if nodes differ
      const isDifferent =
        prevNodes.length !== storeNodes.length ||
        prevNodes.some((pn, idx) => {
          const sn = storeNodes[idx];
          return (
            !sn ||
            pn.id !== sn.id ||
            pn.position?.x !== sn.position?.x ||
            pn.position?.y !== sn.position?.y ||
            pn.data?.label !== sn.data?.label ||
            pn.data?.nodeType !== sn.data?.nodeType ||
            (pn.selected ?? false) !== (sn.id === selectedNodeId)
          );
        });

      if (!isDifferent) return prevNodes;

      return storeNodes.map((n) => ({
        id: n.id,
        type: 'custom',
        position: n.position,
        data: n.data,
        selected: n.id === selectedNodeId,
      }));
    });
  }, [activePage?.nodes, selectedNodeId, setNodes]);

  // Synchronize edges when store edges change externally
  useEffect(() => {
    const storeEdges = activePage?.edges || [];
    setEdges((prevEdges) => {
      const isDifferent =
        prevEdges.length !== storeEdges.length ||
        prevEdges.some((pe, idx) => {
          const se = storeEdges[idx];
          return (
            !se ||
            pe.id !== se.id ||
            pe.source !== se.source ||
            pe.target !== se.target ||
            pe.label !== se.label
          );
        });

      if (!isDifferent) return prevEdges;

      return storeEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: e.type || 'smoothstep',
        animated: e.animated ?? true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      }));
    });
  }, [activePage?.edges, setEdges]);

  // Handle local node drags and position changes
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      setNodes((currentNodes) => {
        // Debounce or sync back positions to store
        const hasPositionChange = changes.some((c: any) => c.type === 'position' && c.dragging === false);
        if (hasPositionChange) {
          updateFlowNodes(
            currentNodes.map((cn) => ({
              id: cn.id,
              type: cn.type || 'custom',
              position: cn.position,
              data: cn.data as any,
            }))
          );
        }
        return currentNodes;
      });
    },
    [onNodesChange, updateFlowNodes, setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `e-${params.source}-${params.target}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      } as Edge;

      setEdges((eds) => {
        const updated = addEdge(newEdge, eds);
        updateFlowEdges(
          updated.map((u) => ({
            id: u.id,
            source: u.source,
            target: u.target,
            label: typeof u.label === 'string' ? u.label : undefined,
            type: u.type as any,
            animated: u.animated,
          }))
        );
        return updated;
      });
      toast.success('Connected nodes');
    },
    [setEdges, updateFlowEdges]
  );

  // Auto-layout algorithm
  const handleAutoLayout = () => {
    const spacingX = 240;
    const spacingY = 130;

    const layoutedNodes = nodes.map((node, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      return {
        ...node,
        position: {
          x: 80 + col * spacingX,
          y: 100 + row * spacingY,
        },
      };
    });

    setNodes(layoutedNodes);
    updateFlowNodes(
      layoutedNodes.map((cn) => ({
        id: cn.id,
        type: cn.type || 'custom',
        position: cn.position,
        data: cn.data as any,
      }))
    );
    toast.success('Auto-layout applied');
  };

  const handleQuickAdd = (type: string, label: string) => {
    const newNode = {
      id: `node-${Math.random().toString(36).substring(2, 7)}`,
      type: 'custom',
      position: {
        x: 150 + Math.random() * 120,
        y: 150 + Math.random() * 100,
      },
      data: {
        label,
        nodeType: type as any,
        style: {
          fill: '#0f172a',
          stroke: type === 'decision' ? '#f59e0b' : type === 'database' ? '#a855f7' : '#3b82f6',
          strokeWidth: 2,
          color: '#ffffff',
        },
      },
    };
    addFlowNode(newNode);
    toast.success(`Added ${label}`);
  };

  const nodeTypes = useMemo(() => ({ custom: CustomStudioNode }), []);

  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden">
      {/* Quick Action Top Floating Bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <button
          onClick={handleAutoLayout}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-lg text-xs font-semibold text-slate-200 hover:text-white shadow-xl backdrop-blur-md flex items-center space-x-1.5 transition-all"
        >
          <Workflow className="w-3.5 h-3.5 text-blue-400" />
          <span>Auto Layout</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        <button
          onClick={() => handleQuickAdd('process', 'Process Step')}
          className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-1 transition-all"
        >
          <Square className="w-3 h-3 text-blue-400" />
          <span>+ Process</span>
        </button>

        <button
          onClick={() => handleQuickAdd('decision', 'Condition?')}
          className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-1 transition-all"
        >
          <Diamond className="w-3 h-3 text-amber-400" />
          <span>+ Decision</span>
        </button>

        <button
          onClick={() => handleQuickAdd('database', 'Database')}
          className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-1 transition-all"
        >
          <Database className="w-3 h-3 text-purple-400" />
          <span>+ Database</span>
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => {
          selectNode(node.id);
          setSelectedElementIds([]);
        }}
        onPaneClick={() => {
          selectNode(null);
          setSelectedElementIds([]);
        }}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-950"
      >
        <Controls className="!bg-slate-900 !border !border-slate-800 !rounded-lg text-slate-200 fill-slate-200 shadow-xl" />
        <MiniMap
          nodeStrokeColor="#3b82f6"
          nodeColor="#1e293b"
          nodeBorderRadius={6}
          style={{
            backgroundColor: '#090d16',
            border: '1px solid #1e293b',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)',
          }}
          maskColor="rgba(15, 23, 42, 0.75)"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
      </ReactFlow>
    </div>
  );
}

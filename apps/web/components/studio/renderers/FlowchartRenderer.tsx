'use client';

import React, { useCallback, useMemo } from 'react';
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
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Custom Flow Node Component
function CustomStudioNode({ id, data, isConnectable }: any) {
  const { nodeType = 'process', label = 'Step' } = data;

  const getNodeStyle = () => {
    switch (nodeType) {
      case 'start':
      case 'end':
        return 'border-emerald-500 bg-emerald-950/40 text-emerald-300 rounded-full px-5 py-2.5';
      case 'decision':
        return 'border-amber-500 bg-amber-950/40 text-amber-300 rounded-xl px-4 py-3 rotate-0';
      case 'database':
        return 'border-purple-500 bg-purple-950/40 text-purple-300 rounded-lg px-4 py-3';
      case 'cloud':
        return 'border-cyan-500 bg-cyan-950/40 text-cyan-300 rounded-2xl px-4 py-3';
      case 'process':
      default:
        return 'border-blue-500 bg-blue-950/40 text-blue-200 rounded-lg px-4 py-3';
    }
  };

  const getIcon = () => {
    switch (nodeType) {
      case 'start':
      case 'end':
        return <GitBranch className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />;
      case 'decision':
        return <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />;
      case 'database':
        return <Database className="w-3.5 h-3.5 mr-1.5 text-purple-400" />;
      case 'cloud':
        return <Cloud className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-400" />;
    }
  };

  return (
    <div
      className={`border-2 shadow-xl backdrop-blur-sm min-w-[140px] text-center text-xs font-bold transition-all hover:scale-105 ${getNodeStyle()}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2.5 h-2.5 bg-slate-400 border-2 border-slate-900"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2.5 h-2.5 bg-slate-400 border-2 border-slate-900"
      />

      <div className="flex items-center justify-center">
        {getIcon()}
        <span>{label}</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2.5 h-2.5 bg-blue-500 border-2 border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2.5 h-2.5 bg-blue-500 border-2 border-slate-900"
      />
    </div>
  );
}

export default function FlowchartRenderer() {
  const { project, activePageIndex, updateFlowNodes, updateFlowEdges } = useEditorStore();
  const activePage = project?.pages[activePageIndex];

  const initialNodes: Node[] = (activePage?.nodes || []).map((n) => ({
    id: n.id,
    type: 'custom',
    position: n.position,
    data: n.data,
  }));

  const initialEdges: Edge[] = (activePage?.edges || []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: e.type || 'smoothstep',
    animated: e.animated ?? true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync to store when nodes change
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      setNodes((currentNodes) => {
        updateFlowNodes(
          currentNodes.map((cn) => ({
            id: cn.id,
            type: cn.type || 'custom',
            position: cn.position,
            data: cn.data as any,
          }))
        );
        return currentNodes;
      });
    },
    [onNodesChange, updateFlowNodes, setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `e-${params.source}-${params.target}-${Math.random().toString(36).substring(2, 5)}`,
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
    const spacingX = 260;
    const spacingY = 140;

    const layoutedNodes = nodes.map((node, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      return {
        ...node,
        position: {
          x: 100 + col * spacingX,
          y: 120 + row * spacingY,
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

  const nodeTypes = useMemo(() => ({ custom: CustomStudioNode }), []);

  return (
    <div className="w-full h-full relative bg-slate-900">
      {/* Auto-Layout Floating Pill */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <button
          onClick={handleAutoLayout}
          className="px-3 py-1.5 bg-slate-950/90 border border-slate-700 hover:border-blue-500 rounded-lg text-xs font-semibold text-slate-200 hover:text-white shadow-lg backdrop-blur-sm flex items-center space-x-1.5 transition-all"
        >
          <Workflow className="w-3.5 h-3.5 text-blue-400" />
          <span>Auto Layout</span>
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-900"
      >
        <Controls className="bg-slate-950 border border-slate-800 rounded-lg text-slate-200 fill-slate-200" />
        <MiniMap
          nodeStrokeColor="#3b82f6"
          nodeColor="#1e293b"
          nodeBorderRadius={8}
          className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
      </ReactFlow>
    </div>
  );
}

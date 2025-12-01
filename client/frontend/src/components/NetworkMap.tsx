import { useState, useCallback, memo } from 'react';
import { 
  ReactFlow, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge, 
  NodeProps, 
  Position, 
  Handle, 
  Edge, 
  Background, 
  Controls, 
  ReactFlowProvider,
  MarkerType,
  Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import R2C2Icon from '@/assets/images/r2c2-1.jpeg';
import { Monitor } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

// Define custom node types
type AgentNodeData = {
  pcName: string;
  sessionId: string;
  agentName: string;
  onAddView?: (componentName: string, componentTitle: string, targetTabsetId: string) => void;
};

type AgentNodeType = Node<AgentNodeData, 'agentNode'>;

// R2C2 Server Node
const ServerNode = memo(() => {
  return (
    <div className="flex flex-col items-center justify-center w-32 h-32">
      <div className="relative w-24 h-24 rounded-full border-4 border-primary shadow-[0_0_15px_rgba(189,147,249,0.5)] overflow-hidden bg-background">
        <img
          src={R2C2Icon}
          alt="R2C2 Server"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="mt-2 font-bold text-sm text-foreground bg-background/80 px-2 py-0.5 rounded">R2C2 Server</div>
      <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3" />
    </div>
  );
});

// Agent Node (PC)
const AgentNode = memo(({ data }: NodeProps<AgentNodeType>) => {
  const handleWatchAgent = () => {
    if (data.onAddView) {
      data.onAddView('sessions', 'Sessions', 'bottomTabset');
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex flex-col w-64 bg-card border border-border rounded-lg shadow-lg overflow-hidden relative">
          <Handle type="target" position={Position.Left} className="!bg-primary !w-3 !h-3" />
          <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3" />
          
          <div className="flex items-center gap-3 p-3 border-b border-border bg-muted/30">
            <div className="p-2 bg-primary/10 rounded-md border border-primary/20">
                <Monitor className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-sm text-foreground truncate" title={data.pcName}>{data.pcName}</span>
                <span className="text-xs text-muted-foreground font-mono truncate" title={data.sessionId}>ID: {data.sessionId}</span>
            </div>
          </div>
          
          <div className="p-3 bg-card">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Agent:</span>
              <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded">{data.agentName}</span>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleWatchAgent}>Watch Agent</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

const initialNodes: Node[] = [
  {
    id: 'server',
    type: 'serverNode',
    data: { label: 'R2C2' },
    position: { x: 50, y: 200 },
    connectable: false,
  },
  {
    id: 'agent-1',
    type: 'agentNode',
    data: { pcName: 'DESKTOP-ABC123', sessionId: 'a1b2c3d4', agentName: 'agent-win-x64' },
    position: { x: 450, y: 50 },
    connectable: false,
  },
  {
    id: 'agent-2',
    type: 'agentNode',
    data: { pcName: 'LAPTOP-XYZ789', sessionId: 'e5f6g7h8', agentName: 'agent-linux-x86' },
    position: { x: 450, y: 350 },
    connectable: false,
  },
  {
    id: 'agent-3',
    type: 'agentNode',
    data: { pcName: 'WORKSTATION-01', sessionId: 'i9j0k1l2', agentName: 'agent-win-x64' },
    position: { x: 850, y: 50 },
    connectable: false,
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e-server-agent1', 
    source: 'server', 
    target: 'agent-1', 
    label: 'HTTPS',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#bd93f9', strokeWidth: 2 }, // Dracula purple
    labelStyle: { fill: '#f8f8f2', fontWeight: 700, fontSize: 12 },
    labelBgStyle: { fill: '#282a36', fillOpacity: 0.8 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#bd93f9' },
  },
  { 
    id: 'e-server-agent2', 
    source: 'server', 
    target: 'agent-2', 
    label: 'mTLS',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#ff79c6', strokeWidth: 2 }, // Dracula pink
    labelStyle: { fill: '#f8f8f2', fontWeight: 700, fontSize: 12 },
    labelBgStyle: { fill: '#282a36', fillOpacity: 0.8 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ff79c6' },
  },
  { 
    id: 'e-agent1-agent3', 
    source: 'agent-1', 
    target: 'agent-3', 
    label: 'SMB',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#50fa7b', strokeWidth: 2 }, // Dracula green
    labelStyle: { fill: '#f8f8f2', fontWeight: 700, fontSize: 12 },
    labelBgStyle: { fill: '#282a36', fillOpacity: 0.8 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#50fa7b' },
  },
];

const nodeTypes = {
  serverNode: ServerNode,
  agentNode: AgentNode,
};

type NetworkMapProps = {
  onAddView?: (componentName: string, componentTitle: string, targetTabsetId: string) => void;
};

export default function NetworkMap({ onAddView }: NetworkMapProps) {
  const [nodes, setNodes] = useState(initialNodes.map(node => {
    if (node.type === 'agentNode') {
      return {
        ...node,
        data: {
          ...node.data,
          onAddView
        }
      };
    }
    return node;
  }));
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div className="w-full h-full bg-background">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          nodesConnectable={false}
          fitView
          className="bg-background"
        >
          <Background color="#44475a" gap={16} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

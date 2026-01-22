import { useState, useCallback, memo, useEffect } from 'react';
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
import R2C2Icon from '@/assets/images/r2c2-4.png';
import { Monitor } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Request } from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";

interface Session {
  id: string
  listener: string
  status: string
  arch: string
  format: string
  timestamp: number
  last_ping: string
  hostname: string
  user: string
  internal_ip: string
  public_ip: string
  process: string
  pid: number
}

// Define custom node types
type AgentNodeData = {
  pcName: string;
  sessionId: string;
  agentName: string;
  onAddView?: (componentName: string, componentTitle: string, targetTabsetId: string) => void;
  onOpenSession?: (sessionId: string) => void;
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
    if (data.onOpenSession) {
        data.onOpenSession(data.sessionId);
    } else if (data.onAddView) {
      data.onAddView('sessions', 'Sessions', 'bottomTabset');
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div 
          onClick={(e) => { e.stopPropagation(); handleWatchAgent(); }}
          className="flex flex-col w-64 bg-card border border-border rounded-lg shadow-lg overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-primary transition-all"
        >
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

const SERVER_NODE: Node = {
    id: 'server',
    type: 'serverNode',
    data: { label: 'R2C2' },
    position: { x: 500, y: 300 },
    connectable: false,
};

const nodeTypes = {
  serverNode: ServerNode,
  agentNode: AgentNode,
};

type NetworkMapProps = {
  onAddView?: (componentName: string, componentTitle: string, targetTabsetId: string) => void;
  onOpenSession?: (sessionId: string) => void;
};

export default function NetworkMap({ onAddView, onOpenSession }: NetworkMapProps) {
  const [nodes, setNodes] = useState<Node[]>([SERVER_NODE]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [needsCenter, setNeedsCenter] = useState(false);

  useEffect(() => {
      if (needsCenter && rfInstance) {
          // Small timeout ensures the nodes are rendered before fitting
          setTimeout(() => {
              rfInstance.fitView({ padding: 0.2, duration: 800 });
          }, 100);
          setNeedsCenter(false);
      }
  }, [needsCenter, rfInstance]);

  const recalculateGraph = (sessions: Session[]) => {
      const newNodes: Node[] = [SERVER_NODE];
      const newEdges: Edge[] = [];
      const total = sessions.length;
      const radius = 350;

      sessions.forEach((session, index) => {
          // Circular layout
          const angle = (index / total) * 2 * Math.PI;
          const x = SERVER_NODE.position.x + radius * Math.cos(angle);
          const y = SERVER_NODE.position.y + radius * Math.sin(angle);

          newNodes.push({
              id: session.id,
              type: 'agentNode',
              data: { 
                  pcName: session.hostname, 
                  sessionId: session.id, 
                  agentName: `${session.user} (${session.arch})`,
                  onAddView,
                  onOpenSession 
              },
              position: { x, y },
              connectable: false,
          });

          newEdges.push({
              id: `e-server-${session.id}`,
              source: 'server',
              target: session.id,
              label: session.listener || 'HTTP',
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#bd93f9', strokeWidth: 2 },
              labelStyle: { fill: '#f8f8f2', fontWeight: 700, fontSize: 12 },
              labelBgStyle: { fill: '#282a36', fillOpacity: 0.8 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#bd93f9' },
          });
      });

      setNodes(newNodes);
      setEdges(newEdges);
      setNeedsCenter(true);
  };

  const fetchSessions = async () => {
    try {
        let serverUrl = localStorage.getItem("serverUrl");
        const token = localStorage.getItem("token");
        if (!serverUrl) return;
        if (!serverUrl.includes("http")) {
            serverUrl = `http://${serverUrl}`;
        }
        
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        const resp = await Request("GET", `${serverUrl}/sessions`, headers, "");
        if (resp.statusCode === 200) {
            const sessions: Session[] = JSON.parse(resp.body);
            recalculateGraph(sessions);
        }
    } catch (e) {
        console.error("Failed to fetch sessions for map", e);
    }
  };

  useEffect(() => {
      fetchSessions();
      
      const cancel = EventsOn("agent:beacon_updated", () => {
          fetchSessions();
      });
      return () => cancel();
  }, []);

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
          onInit={setRfInstance}
          fitView
          className="bg-background"
        >
          <Background color="#44475a" gap={16} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

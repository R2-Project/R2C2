import { useState } from "react";
import { 
  Server, 
  Monitor, 
  Laptop, 
  Search, 
  Route, 
  Share, 
  RefreshCw,
  Circle
} from "lucide-react";

interface NetworkNode {
  id: string;
  name: string;
  ip: string;
  type: "server" | "desktop" | "laptop" | "dc" | "discovered";
  status: "active" | "high-priv" | "discovered";
  os?: string;
  username?: string;
  x: number;
  y: number;
  connections?: string[]; // Array of node IDs this node connects to
}

export default function NetworkMap() {
  const [networkData] = useState<NetworkNode[]>([
    {
      id: "team-server",
      name: "Team Server",
      ip: "192.168.1.100",
      type: "server",
      status: "active",
      x: 200,
      y: 50,
      connections: ["desktop-abc123", "ws-lab01", "srv-dc01"],
    },
    {
      id: "desktop-abc123",
      name: "DESKTOP-ABC123",
      ip: "10.0.2.15",
      type: "desktop",
      status: "active",
      os: "Windows 10 Pro",
      username: "Admin",
      x: 100,
      y: 150,
      connections: ["host-15"],
    },
    {
      id: "ws-lab01",
      name: "WS-LAB01",
      ip: "172.16.1.50",
      type: "laptop",
      status: "active",
      os: "Windows 11",
      username: "User",
      x: 300,
      y: 150,
      connections: ["host-22"],
    },
    {
      id: "srv-dc01",
      name: "SRV-DC01",
      ip: "192.168.1.25",
      type: "server",
      status: "high-priv",
      os: "Windows Server 2019",
      username: "SYSTEM",
      x: 200,
      y: 250,
      connections: [],
    },
    {
      id: "host-15",
      name: "192.168.1.15",
      ip: "192.168.1.15",
      type: "desktop",
      status: "discovered",
      x: 50,
      y: 250,
      connections: [],
    },
    {
      id: "host-22",
      name: "192.168.1.22",
      ip: "192.168.1.22",
      type: "laptop",
      status: "discovered",
      x: 350,
      y: 250,
      connections: [],
    },
  ]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "server":
      case "dc":
        return <Server className="w-4 h-4" />;
      case "desktop":
        return <Monitor className="w-4 h-4" />;
      case "laptop":
        return <Laptop className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "c2-text-accent border-green-400";
      case "high-priv":
        return "c2-text-warning border-yellow-400";
      case "discovered":
        return "c2-text-dim border-gray-400 opacity-60";
      default:
        return "c2-text-info border-blue-400";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-400";
      case "high-priv":
        return "bg-yellow-400";
      case "discovered":
        return "bg-gray-400 opacity-50";
      default:
        return "bg-blue-400";
    }
  };

  const renderConnectionLine = (from: NetworkNode, to: NetworkNode) => {
    const fromCenterX = from.x + 40; // Node width/2
    const fromCenterY = from.y + 40; // Node height/2
    const toCenterX = to.x + 40;
    const toCenterY = to.y + 40;

    return (
      <line
        key={`${from.id}-${to.id}`}
        x1={fromCenterX}
        y1={fromCenterY}
        x2={toCenterX}
        y2={toCenterY}
        stroke="var(--c2-border)"
        strokeWidth="2"
        strokeDasharray="5,5"
        opacity="0.6"
      />
    );
  };

  const renderNetworkNode = (node: NetworkNode) => {
    const isTeamServer = node.id === "team-server";

    return (
      <div
        key={node.id}
        className={`absolute w-20 h-20 p-2 c2-bg-dark rounded-lg border-2 ${getStatusColor(node.status)} ${
          isTeamServer ? "border-green-400" : ""
        } cursor-pointer hover:scale-105 transition-transform`}
        style={{ 
          left: `${node.x}px`, 
          top: `${node.y}px`,
          zIndex: 10
        }}
        title={`${node.name} (${node.ip})`}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex items-center justify-center mb-1">
            <span className={getStatusColor(node.status)}>
              {getNodeIcon(node.type)}
            </span>
            <div 
              className={`w-2 h-2 rounded-full ${getStatusDot(node.status)} ml-1`}
              title={node.status}
            />
          </div>
          <div className="text-xs font-medium c2-text text-center leading-tight">
            {node.name.length > 8 ? node.name.substring(0, 8) + "..." : node.name}
          </div>
          {node.ip && (
            <div className="text-xs c2-text-dim text-center leading-tight">
              {node.ip.length > 12 ? node.ip.substring(0, 12) + "..." : node.ip}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full c2-bg-panel flex flex-col">
      <div className="p-3 c2-border border-b">
        <h3 className="text-sm font-medium c2-text-accent">Network Map</h3>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <div className="w-full h-full relative c2-bg-dark">
          {/* SVG for connection lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {networkData.map(node => 
              node.connections?.map(connectionId => {
                const targetNode = networkData.find(n => n.id === connectionId);
                return targetNode ? renderConnectionLine(node, targetNode) : null;
              })
            )}
          </svg>
          
          {/* Network nodes */}
          {networkData.map(node => renderNetworkNode(node))}
        </div>
      </div>
      
      <div className="p-2 c2-border border-t flex space-x-1">
        <button 
          className="p-1 hover:c2-bg-dark rounded c2-text-dim hover:c2-text-accent"
          title="Scan Network"
        >
          <Search className="w-3 h-3" />
        </button>
        <button 
          className="p-1 hover:c2-bg-dark rounded c2-text-dim hover:c2-text-accent"
          title="Pivot"
        >
          <Route className="w-3 h-3" />
        </button>
        <button 
          className="p-1 hover:c2-bg-dark rounded c2-text-dim hover:c2-text-accent"
          title="Attack Path"
        >
          <Share className="w-3 h-3" />
        </button>
        <button 
          className="p-1 hover:c2-bg-dark rounded c2-text-dim hover:c2-text-accent"
          title="Refresh"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { 
  Terminal, 
  FolderOpen, 
  Activity, 
  Monitor, 
  Image, 
  Settings,
  X,
  Minimize2,
  Maximize2
} from "lucide-react";
import CommandInterface from "./CommandInterface";
import FileExplorer from "./FileExplorer";

interface SessionProps {
  sessionId?: string;
  onClose?: () => void;
}

export default function Session({ sessionId = "SESSION_001", onClose }: SessionProps) {
  const [activeTab, setActiveTab] = useState<"console" | "files" | "processes" | "network" | "screenshots">("console");

  // Mock session data
  const sessionData = {
    id: sessionId,
    user: "admin",
    host: "DESKTOP-ABC123",
    ip: "10.0.2.15",
    os: "Windows 10 Pro",
    arch: "x64",
    pid: 4521,
    lastSeen: "2s ago",
    status: "alive"
  };

  return (
    <div className="flex flex-col h-full w-full c2-bg-dark c2-text font-mono border c2-border shadow-lg">
      {/* Session Header / Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 c2-bg-panel border-b c2-border select-none">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full c2-bg-accent animate-pulse" />
            <span className="font-bold c2-text-accent">{sessionData.user}@{sessionData.host}</span>
          </div>
          <div className="h-4 w-px c2-bg-border" />
          <div className="text-xs c2-text-dim space-x-3 flex">
            <span>PID: {sessionData.pid}</span>
            <span>Arch: {sessionData.arch}</span>
            <span>IP: {sessionData.ip}</span>
            <span>Last: {sessionData.lastSeen}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-white/10 rounded c2-text-dim hover:c2-text">
            <Minimize2 size={14} />
          </button>
          <button className="p-1 hover:bg-white/10 rounded c2-text-dim hover:c2-text">
            <Maximize2 size={14} />
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-red-900/20 rounded c2-text-error hover:text-red-400"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar / Tabs */}
        <div className="w-16 c2-bg-panel border-r c2-border flex flex-col items-center py-4 space-y-4">
          <TabButton 
            active={activeTab === "console"} 
            onClick={() => setActiveTab("console")}
            icon={<Terminal size={20} />}
            label="Console"
          />
          <TabButton 
            active={activeTab === "files"} 
            onClick={() => setActiveTab("files")}
            icon={<FolderOpen size={20} />}
            label="Files"
          />
          <TabButton 
            active={activeTab === "processes"} 
            onClick={() => setActiveTab("processes")}
            icon={<Activity size={20} />}
            label="Procs"
          />
          <TabButton 
            active={activeTab === "network"} 
            onClick={() => setActiveTab("network")}
            icon={<Monitor size={20} />}
            label="Net"
          />
          <TabButton 
            active={activeTab === "screenshots"} 
            onClick={() => setActiveTab("screenshots")}
            icon={<Image size={20} />}
            label="Screen"
          />
          
          <div className="flex-1" />
          
          <TabButton 
            active={false} 
            onClick={() => {}}
            icon={<Settings size={20} />}
            label="Config"
          />
        </div>

        {/* Content View */}
        <div className="flex-1 c2-bg-dark relative">
          {activeTab === "console" && (
            <CommandInterface sessionId={sessionId} />
          )}
          
          {activeTab === "files" && (
            <div className="h-full w-full overflow-hidden">
              <FileExplorer />
            </div>
          )}

          {activeTab === "processes" && (
            <div className="h-full w-full flex items-center justify-center c2-text-dim">
              <div className="text-center">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p>Process Manager Module Not Loaded</p>
              </div>
            </div>
          )}

          {activeTab === "network" && (
            <div className="h-full w-full flex items-center justify-center c2-text-dim">
              <div className="text-center">
                <Monitor size={48} className="mx-auto mb-4 opacity-50" />
                <p>Network Visualizer Module Not Loaded</p>
              </div>
            </div>
          )}

          {activeTab === "screenshots" && (
            <div className="h-full w-full flex items-center justify-center c2-text-dim">
              <div className="text-center">
                <Image size={48} className="mx-auto mb-4 opacity-50" />
                <p>Screenshot Gallery Empty</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`
        group flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all duration-200
        ${active 
          ? "bg-white/10 c2-text-accent shadow-[0_0_10px_rgba(var(--c2-accent),0.1)] border c2-border" 
          : "c2-text-dim hover:c2-text hover:bg-white/5"
        }
      `}
      title={label}
    >
      {icon}
      <span className="text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute left-14 c2-bg-panel px-2 py-1 rounded border c2-border c2-text z-50 whitespace-nowrap pointer-events-none">
        {label}
      </span>
    </button>
  );
}

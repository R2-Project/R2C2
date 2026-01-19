import { useState } from "react";
import { 
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
        {/* Content View */}
        <div className="flex-1 c2-bg-dark relative">
            <CommandInterface sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}

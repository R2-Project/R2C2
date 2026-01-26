import { useState, useEffect } from "react";
import CommandInterface from "./CommandInterface";
import { ApiRequest } from "@/lib/api";
import { EventsOn } from "../../wailsjs/runtime/runtime";

interface SessionProps {
  sessionId?: string;
  onClose?: () => void;
}

interface SessionData {
    id: string;
    user: string;
    hostname: string;
    public_ip: string;
    internal_ip: string;
    arch: string;
    pid: number;
    last_ping: string;
    status: string;
    sleep: number;
    jitter: number;
}

export default function Session({ sessionId = "SESSION_001", onClose }: SessionProps) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetchSession();

    const interval = setInterval(() => {
        setNow(Date.now());
    }, 2000);

    const cancelBeaconEvent = EventsOn("agent:beacon_updated", (data: any) => {
         try {
            const updatedSession = typeof data === 'string' ? JSON.parse(data) : data;
            if (updatedSession.id === sessionId) {
                 setSessionData(prev => ({ ...prev, ...updatedSession }));
                 setNow(Date.now());
            }
        } catch (e) {
            console.error("Failed to parse beacon update in Session", e);
        }
    })

    return () => {
        clearInterval(interval);
        cancelBeaconEvent(); 
    }
  }, [sessionId]);

  const fetchSession = async () => {
      try {
        let serverUrl = localStorage.getItem("serverUrl");
        const token = localStorage.getItem("token");

        if (!serverUrl) return;

        if(!serverUrl.includes("http")) {
            serverUrl = `http://${serverUrl}`;
        }

        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        // We fetch all because there isn't a single endpoint yet, optimization for later
        const response = await ApiRequest("GET", `${serverUrl}/sessions`, headers, "");

        if (response.statusCode >= 200 && response.statusCode < 300) {
            const data = JSON.parse(response.body);
            if (Array.isArray(data)) {
                const session = data.find((s: any) => s.id === sessionId);
                if (session) {
                    setSessionData(session);
                }
            }
        }
      } catch (e) {
          console.error("Failed to fetch session", e);
      }
  }

  function formatLastPing(lastPing?: string) {
    if (!lastPing || lastPing.startsWith("0001-01-01")) {
      return "-"
    }
    const pingTime = new Date(lastPing).getTime()
    const diff = Math.max(0, now - pingTime)
    
    if (diff > 2000) {
      const seconds = Math.floor(diff / 1000)
      if (seconds < 60) return `${seconds}s`
      
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      if (minutes < 60) return `${minutes}m ${remainingSeconds}s`

      const hours = Math.floor(minutes / 60)
      return `${hours}h`
    }

    return `${diff}ms`
  }

  function getSessionStatus(session: SessionData) {
      if (!session.last_ping || session.last_ping.startsWith("0001-01-01")) {
          return "inactive";
      }

      const lastPingTime = new Date(session.last_ping).getTime();
      const diffMs = now - lastPingTime;
      
      const sleepMs = (session.sleep || 0) * 1000;
      const jitterMs = sleepMs * ((session.jitter || 0) / 100);
      const maxDelay = (sleepMs + jitterMs) + sleepMs; // Add extra cycle grace period
      
      if (diffMs <= maxDelay) {
          return "active";
      }
      return "unhealthy";
  }

  if (!sessionData) {
      return <div className="flex items-center justify-center h-full w-full c2-bg-dark text-white">Loading session...</div>;
  }
  
  const currentStatus = getSessionStatus(sessionData);

  return (
    <div className="flex flex-col h-full w-full c2-bg-dark c2-text font-mono border c2-border shadow-lg">
      {/* Session Header / Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 c2-bg-panel border-b c2-border select-none">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
                currentStatus === 'active' ? 'bg-green-500 animate-pulse' : 
                currentStatus === 'unhealthy' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span className="font-bold c2-text-accent">{sessionData.id} | {sessionData.user}@{sessionData.hostname}</span>
          </div>
          <div className="h-4 w-px c2-bg-border" />
          <div className="text-xs c2-text-dim space-x-3 flex">
            <span>PID: {sessionData.pid || "-"}</span>
            <span>Arch: {sessionData.arch}</span>
            <span>IP: {sessionData.public_ip}</span>
            <span>Last: {formatLastPing(sessionData.last_ping)}</span>
          </div>
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

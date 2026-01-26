import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ApiRequest } from "@/lib/api"
import { EventsOn } from "../../wailsjs/runtime/runtime"

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
  sleep: number
  jitter: number
}

interface SessionsProps {
  onOpenSession?: (sessionId: string) => void;
}

export default function Component({ onOpenSession }: SessionsProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    fetchSessions()

    const handleRefresh = () => {
      fetchSessions()
      setNow(Date.now())
    }
    window.addEventListener("refresh-sessions", handleRefresh)
    
    // Listen for Wails runtime event
    const cancelWailsEvent = EventsOn("agent:beacon_updated", (data: any) => {
        try {
            const updatedSession = typeof data === 'string' ? JSON.parse(data) : data;
            setSessions(prevSessions => {
                return prevSessions.map(session => {
                    if (session.id === updatedSession.id) {
                        return { ...session, ...updatedSession };
                    }
                    return session;
                });
            });
            setNow(Date.now());
        } catch (e) {
            console.error("Failed to parse beacon update", e);
        }
    });

    // Update 'now' every 1000ms to refresh last ping timers and status
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => {
      window.removeEventListener("refresh-sessions", handleRefresh)
      cancelWailsEvent?.()
      clearInterval(interval)
    }
  }, [])

  function formatLastPing(lastPing: string) {
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

  function getSessionStatus(session: Session) {
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

  async function fetchSessions() {
    setLoading(true)
    setError(null)
    try {
      let serverUrl = localStorage.getItem("serverUrl");
      const token = localStorage.getItem("token");

      if (!serverUrl) {
        throw new Error("Server URL not found");
      }

      if(!serverUrl.includes("http")) {
        serverUrl = `http://${serverUrl}`;
      }

      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const response = await ApiRequest("GET", `${serverUrl}/sessions`, headers, "");

      if (response.statusCode >= 200 && response.statusCode < 300) {
        const data = JSON.parse(response.body);
        if (Array.isArray(data)) {
            setSessions(data);
        } else {
            setSessions([]);
        }
      } else {
        throw new Error(response.error || `Failed to fetch sessions: ${response.statusCode}`);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load sessions")
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Session ID</TableHead>
              <TableHead>External</TableHead>
              <TableHead>Internal</TableHead>
              <TableHead>Listener</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead>Process</TableHead>
              <TableHead>PID</TableHead>
              <TableHead>Arch</TableHead>
              <TableHead>Last ping</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((item) => {
                const calculatedStatus = getSessionStatus(item);
                return (
              <TableRow 
                key={item.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onOpenSession?.(item.id)}
              >
                <TableCell>
                    {calculatedStatus === "active" && (
                        <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge>
                    )}
                    {calculatedStatus === "unhealthy" && (
                        <Badge variant="outline" className="text-red-500 border-red-500">Unhealthy</Badge>
                    )}
                    {calculatedStatus === "inactive" && (
                         <Badge variant="outline" className="text-gray-500 border-gray-500">Inactive</Badge>
                    )}
                </TableCell>
                <TableCell className="font-mono text-green-500">{item.id}</TableCell>
                <TableCell>{item.public_ip || "-"}</TableCell>
                <TableCell>{item.internal_ip || "-"}</TableCell>
                <TableCell>{item.listener || "-"}</TableCell>
                <TableCell>{item.user || "-"}</TableCell>
                <TableCell>{item.hostname || "-"}</TableCell>
                <TableCell>{item.process || "-"}</TableCell>
                <TableCell>{item.pid || "-"}</TableCell>
                <TableCell>{item.arch}</TableCell>
                <TableCell>
                  <span className={item.last_ping && !item.last_ping.startsWith("0001-01-01") ? "text-green-500 font-bold" : ""}>
                    {formatLastPing(item.last_ping)}
                  </span>
                </TableCell>
              </TableRow>
            )})}
            {sessions.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground h-24">
                  No sessions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

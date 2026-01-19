import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Request } from "../../wailsjs/go/main/App"

interface Session {
  id: string
  listener: string
  status: string
  arch: string
  format: string
  timestamp: number
  last_ping: string
  computer: string
  user: string
  internal_ip: string
  public_ip: string
  process: string
  pid: number
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

    const handleRefresh = () => fetchSessions()
    window.addEventListener("refresh-sessions", handleRefresh)
    
    // Update 'now' every 2000ms to refresh last ping timers
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 2000)

    return () => {
      window.removeEventListener("refresh-sessions", handleRefresh)
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
      const response = await Request("GET", `${serverUrl}/sessions`, headers, "");

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
              <TableHead>Session ID</TableHead>
              <TableHead>External</TableHead>
              <TableHead>Internal</TableHead>
              <TableHead>Listener</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Computer</TableHead>
              <TableHead>Process</TableHead>
              <TableHead>PID</TableHead>
              <TableHead>Arch</TableHead>
              <TableHead>Last ping</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((item) => (
              <TableRow 
                key={item.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onOpenSession?.(item.id)}
              >
                <TableCell className="font-mono text-green-500">{item.id}</TableCell>
                <TableCell>{item.public_ip || "-"}</TableCell>
                <TableCell>{item.internal_ip || "-"}</TableCell>
                <TableCell>{item.listener || "-"}</TableCell>
                <TableCell>{item.user || "-"}</TableCell>
                <TableCell>{item.computer || "-"}</TableCell>
                <TableCell>{item.process || "-"}</TableCell>
                <TableCell>{item.pid || "-"}</TableCell>
                <TableCell>{item.arch}</TableCell>
                <TableCell>
                  <span className={item.last_ping && !item.last_ping.startsWith("0001-01-01") ? "text-green-500 font-bold" : ""}>
                    {formatLastPing(item.last_ping)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
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

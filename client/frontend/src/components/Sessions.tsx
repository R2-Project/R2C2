import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Request } from "../../wailsjs/go/main/App"

interface Session {
  id: string
  listener_id: string
  status: string
  arch: string
  format: string
  timestamp: number
  last_ping: string
  computer: string
  user: string
  internal_ip: string
  public_ip: string
}

interface SessionsProps {
  onOpenSession?: (sessionId: string) => void;
}

export default function Component({ onOpenSession }: SessionsProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

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
                <TableCell className="font-mono text-green-500">{item.id.substring(0, 8)}...</TableCell>
                <TableCell>{item.public_ip}</TableCell>
                <TableCell>{item.internal_ip}</TableCell>
                <TableCell>{item.listener_id}</TableCell>
                <TableCell>{item.user}</TableCell>
                <TableCell>{item.computer}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>{item.arch}</TableCell>
                <TableCell>{item.last_ping}</TableCell>
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

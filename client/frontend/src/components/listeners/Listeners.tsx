import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
// import { getListeners, Listener } from "@/services/listeners"
import { Button } from "@/components/ui/button"
import NewListener from "./NewListener"
import NewAgent from "../agents/NewAgent"

// Mock data for display
const mockListeners = [
  {
    id: "1",
    name: "http-listener-1",
    type: "HTTP",
    host: "0.0.0.0",
    port: 8080,
    uri: "/api",
    status: "Running",
  },
  {
    id: "2",
    name: "smb-listener-1",
    type: "SMB",
    host: "192.168.1.10",
    port: 445,
    uri: "pipe/c2",
    status: "Stopped",
  },
  {
    id: "3",
    name: "tcp-listener-1",
    type: "TCP",
    host: "10.0.0.5",
    port: 9090,
    uri: "-",
    status: "Running",
  },
]

type Props = {
  onAddView?: (componentName: string, componentTitle: string, targetTabsetId: string) => void
}

export default function Listeners({ onAddView }: Props) {
  const [listeners, setListeners] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNewListenerOpen, setIsNewListenerOpen] = useState(false)
  const [isNewAgentOpen, setIsNewAgentOpen] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600))
      setListeners(mockListeners)
    } catch (e: any) {
      setError(e?.message || "Failed to load listeners")
      setListeners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return <div className="p-4 text-sm">Loading listeners...</div>
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-sm text-destructive mb-2">Error: {error}</div>
        <Button onClick={load}>Retry</Button>
      </div>
    )
  }

  if (!listeners || listeners.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mb-2 text-sm">No listeners are running.</div>
        <Button onClick={load}>Refresh</Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>IP / Host</TableHead>
              <TableHead>Port</TableHead>
              <TableHead>URI</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listeners.map((item) => (
              <ContextMenu key={item.id ?? JSON.stringify(item)}>
                <ContextMenuTrigger asChild>
                  <TableRow>
                    <TableCell>{item.name ?? "—"}</TableCell>
                    <TableCell>{(item.type ?? item.listenerType ?? "HTTP").toString()}</TableCell>
                    <TableCell>{(item.host ?? item.ip ?? "—").toString()}</TableCell>
                    <TableCell>{(item.port ?? "—").toString()}</TableCell>
                    <TableCell>{(item.uri ?? item.uris ?? "—").toString()}</TableCell>
                    <TableCell>{(item.status ?? "—").toString()}</TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => setIsNewListenerOpen(true)}>
                    Create new listener
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => setIsNewAgentOpen(true)}>
                    Create new Agent
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>
      </div>
      <NewListener open={isNewListenerOpen} onOpenChange={setIsNewListenerOpen} />
      <NewAgent open={isNewAgentOpen} onOpenChange={setIsNewAgentOpen} />
    </div>
  )
}


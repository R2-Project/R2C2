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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash } from "lucide-react"
// import { getListeners, Listener } from "@/services/listeners"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import NewListener from "./NewListener"
import NewAgent from "../agents/NewAgent"
import { ApiRequest } from '@/lib/api';

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
      let serverUrl = localStorage.getItem("serverUrl");
      const token = localStorage.getItem("token");

      if (!serverUrl) {
        throw new Error("Server URL not found");
      }

      console.log("Fetching listeners...")
      if(!serverUrl.includes("http")) {
        serverUrl = `http://${serverUrl}`;
      }
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const response = await ApiRequest("GET", `${serverUrl}/listeners`, headers, "");

      if (response.statusCode >= 200 && response.statusCode < 300) {
        const data = JSON.parse(response.body);
        console.log("Listeners data:", data);
        
        if (Array.isArray(data)) {
            const parsedData = data.map((item: any) => {
            let config = {};
            try {
                config = JSON.parse(item.config);
            } catch (e) {
                console.error("Failed to parse config for listener", item.id, e);
            }
            return {
                ...item,
                ...config
            };
            });
            setListeners(parsedData);
        } else {
            setListeners([]);
        }
      } else {
        throw new Error(response.error || `Failed to fetch listeners: ${response.statusCode}`);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load listeners")
      setListeners([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this listener?")) return;

    try {
      let serverUrl = localStorage.getItem("serverUrl");
      const token = localStorage.getItem("token");

      if (!serverUrl) return;

      if(!serverUrl.includes("http")) {
        serverUrl = `http://${serverUrl}`;
      }
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      
      const response = await ApiRequest("DELETE", `${serverUrl}/listeners/${id}`, headers, "");

      if (response.statusCode >= 200 && response.statusCode < 300) {
        load();
      } else {
        console.error("Failed to delete listener:", response.error);
        setError("Failed to delete listener: " + response.error);
      }
    } catch (e: any) {
      console.error("Failed to delete listener", e);
      setError("Failed to delete listener: " + e.message);
    }
  }

  useEffect(() => {
    load()
    
    const handleRefresh = () => {
        load();
    };
    window.addEventListener("refresh-listeners", handleRefresh);
    
    return () => {
        window.removeEventListener("refresh-listeners", handleRefresh);
    }
  }, [])

  const renderContent = () => {
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listeners.map((item) => (
              <TableRow key={item.id ?? JSON.stringify(item)}>
                <TableCell>{item.name ?? "—"}</TableCell>
                <TableCell>{(item.protocol ?? item.type ?? "HTTP").toString()}</TableCell>
                <TableCell>{(item.host ?? "—").toString()}</TableCell>
                <TableCell>{(item.port ?? "—").toString()}</TableCell>
                <TableCell>{(item.uris ? item.uris.join(", ") : "—").toString()}</TableCell>
                <TableCell>
                  {item.status === 'running' ? (
                     <Badge variant="outline" className="text-green-500 border-green-500">Running</Badge>
                  ) : (
                     <Badge variant="outline" className="text-gray-500 border-gray-500">{item.status || "Stopped"}</Badge>
                   )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="w-full h-full min-h-[200px] block">
          {renderContent()}
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
      <NewListener open={isNewListenerOpen} onOpenChange={setIsNewListenerOpen} onCreated={load} />
      <NewAgent open={isNewAgentOpen} onOpenChange={setIsNewAgentOpen} onCreated={() => {
        window.dispatchEvent(new Event("refresh-sessions"));
      }} />
    </>
  )
}


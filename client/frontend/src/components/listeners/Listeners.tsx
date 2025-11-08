import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getListeners, Listener } from "@/services/listeners"
import { Button } from "@/components/ui/button"

export default function Listeners() {
  const [listeners, setListeners] = useState<Listener[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getListeners()
      setListeners(Array.isArray(data) ? data : [])
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
        <div className="text-sm text-red-600 mb-2">Error: {error}</div>
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
              <TableRow key={item.id ?? JSON.stringify(item)}>
                <TableCell>{item.name ?? "—"}</TableCell>
                <TableCell>{(item.type ?? item.listenerType ?? "HTTP").toString()}</TableCell>
                <TableCell>{(item.host ?? item.ip ?? "—").toString()}</TableCell>
                <TableCell>{(item.port ?? "—").toString()}</TableCell>
                <TableCell>{(item.uri ?? item.uris ?? "—").toString()}</TableCell>
                <TableCell>{(item.status ?? "—").toString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


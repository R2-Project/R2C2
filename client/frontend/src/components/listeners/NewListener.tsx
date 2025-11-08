import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormLabel, FormItem, FormMessage, FormControl } from "@/components/ui/form"

import { createHttpListener } from "@/services/listeners"
import { Checkbox } from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export default function NewListener({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("")
  const [host, setHost] = useState("")
  const [port, setPort] = useState("")
  const [listenerType, setListenerType] = useState("http")
  const [useSSL, setUseSSL] = useState(false)
  const [headersText, setHeadersText] = useState("Content-Type: application/json")
  const [uris, setUrisText] = useState("/index.php")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleCreate() {
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
      setError("Name is required")
      return
    }
    if (!host.trim()) {
      setError("Host is required")
      return
    }
    if (!port.trim()) {
      setError("Port is required")
      return
    }

    /*
    let headers: Record<string, string> | undefined
    try {
      headers = headersText ? JSON.parse(headersText) : undefined
      if (headers && typeof headers !== "object") throw new Error("headers must be an object")
    } catch (e: any) {
      setError("Invalid headers JSON: " + e.message)
      return
    }
      */

    const protocol = useSSL ? "https" : "http"
    const url = `${protocol}://${host}:${port}`

    setLoading(true)
    try {
      await createHttpListener({
        name: name.trim(),
        host: url,
        port: Number(port),
        secure: useSSL,
      })
      setSuccess("Listener created")
      setName("")
      setHost("")
      setPort("")
      setListenerType("http")
      setUseSSL(false)
      setHeadersText("Content-Type: application/json")
      setUrisText("/index.php")
      onCreated?.()
      // close after a short delay so user sees success
      setTimeout(() => onOpenChange(false), 600)
    } catch (e: any) {
      setError(e?.message || "Failed to create listener")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Listener</DialogTitle>
          <DialogDescription>Add a new listener</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Form>
            <FormItem>
              <div className="flex items-baseline justify-between">
                <FormLabel>Name</FormLabel>
              </div>
              <FormControl>
                <input
                  className="w-full rounded-md border px-2 py-1 bg-slate-800 text-slate-100 border-slate-700"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. my-webhook"
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel>Listener Type</FormLabel>
              <FormControl>
                <select
                  className="w-full rounded-md border px-2 py-1 bg-slate-800 text-slate-100 border-slate-700"
                  value={listenerType}
                  onChange={(e) => setListenerType(e.target.value)}
                >
                  <option value="http">HTTP</option>
                  <option value="smb" disabled>
                    SMB
                  </option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <div className="flex gap-2">
                <div className="flex-1">
                  <FormLabel>Host</FormLabel>
                  <FormControl>
                    <input
                      className="w-full rounded-md border px-2 py-1 bg-slate-800 text-slate-100 border-slate-700"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="e.g. 10.10.10.1"
                    />
                  </FormControl>
                </div>

                <div className="w-32">
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <input
                      className="w-full rounded-md border px-2 py-1 bg-slate-800 text-slate-100 border-slate-700"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="e.g. 8080"
                    />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>

            <FormItem>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="use-ssl"
                  checked={useSSL}
                  onCheckedChange={(v) => setUseSSL(Boolean(v))}
                  className="w-5 h-5 rounded border bg-slate-800 border-slate-700 flex items-center justify-center"
                >
                  {useSSL && <Check className="w-4 h-4 text-slate-100" />}
                </Checkbox>
                <label htmlFor="use-ssl" className="text-sm text-slate-100">
                  Use SSL
                </label>
              </div>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel>Response Headers</FormLabel>
              <FormControl>
                <textarea
                  className="w-full rounded-md border px-2 py-1 font-mono text-sm bg-slate-800 text-slate-100 border-slate-700"
                  rows={4}
                  value={headersText}
                  onChange={(e) => setHeadersText(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel>URIs</FormLabel>
              <FormControl>
                <textarea
                  className="w-full rounded-md border px-2 py-1 font-mono text-sm bg-slate-800 text-slate-100 border-slate-700"
                  rows={4}
                  value={uris}
                  onChange={(e) => setUrisText(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </Form>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Listener"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
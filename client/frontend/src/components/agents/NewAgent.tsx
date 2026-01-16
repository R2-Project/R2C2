import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Request } from "../../../wailsjs/go/main/App"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export default function NewAgent({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("")
  const [os, setOs] = useState("windows")
  const [arch, setArch] = useState("x64")
  const [listenerUrl, setListenerUrl] = useState("http://localhost:8080")
  const [format, setFormat] = useState("exe")
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
    if (!listenerUrl.trim()) {
      setError("Listener URL is required")
      return
    }

    setLoading(true)
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
      
      const payload = {
        name,
        listener_id: listenerUrl,
        arch,
        format,
        os
      };

      const response = await Request("POST", `${serverUrl}/agents`, headers, JSON.stringify(payload));
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        setSuccess("Agent created successfully")
        setName("")
        // optionally reset other fields
        onCreated?.()
        // close after a short delay so user sees success
        setTimeout(() => onOpenChange(false), 600)
      } else {
        throw new Error(response.error || `Failed to create agent: ${response.statusCode}`);
      }

    } catch (e: any) {
      setError(e?.message || "Failed to generate agent")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Agent</DialogTitle>
          <DialogDescription>Generate a new agent payload</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. agent-win-x64"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Operating System</Label>
              <Select value={os} onValueChange={setOs}>
                <SelectTrigger>
                  <SelectValue placeholder="Select OS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="windows">Windows</SelectItem>
                  <SelectItem value="linux">Linux</SelectItem>
                  <SelectItem value="macos">macOS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Architecture</Label>
              <Select value={arch} onValueChange={setArch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Arch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="x64">x64</SelectItem>
                  <SelectItem value="x86">x86</SelectItem>
                  <SelectItem value="arm64">ARM64</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Listener URL</Label>
            <Input
              value={listenerUrl}
              onChange={(e) => setListenerUrl(e.target.value)}
              placeholder="http://c2.example.com:80"
            />
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exe">Executable (.exe)</SelectItem>
                <SelectItem value="elf">ELF Binary</SelectItem>
                <SelectItem value="macho">Mach-O</SelectItem>
                <SelectItem value="dll">DLL</SelectItem>
                <SelectItem value="shellcode">Shellcode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Generating..." : "Generate Agent"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


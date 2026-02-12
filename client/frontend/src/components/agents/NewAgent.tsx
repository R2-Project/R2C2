import { useState, useEffect } from "react"
import { Loader2, Download } from "lucide-react"

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
import { ApiRequest } from '@/lib/api';
// @ts-ignore
import { Download as DownloadAgent, SelectSavePath, DownloadToFile } from "../../../wailsjs/go/main/App";

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export default function NewAgent({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("")
  const [os, setOs] = useState("windows")
  const [arch, setArch] = useState("x64")
  const [listenerId, setListenerId] = useState("")
  const [listeners, setListeners] = useState<any[]>([])
  const [format, setFormat] = useState(".exe")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createdPath, setCreatedPath] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchListeners()
    } else {
        setTimeout(() => {
            document.body.style.pointerEvents = "";
        }, 500);
    }
  }, [open])

  async function fetchListeners() {
    try {
      let serverUrl = localStorage.getItem("serverUrl");
      const token = localStorage.getItem("token");

      if (!serverUrl) return;

      if(!serverUrl.includes("http")) {
        serverUrl = `http://${serverUrl}`;
      }
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const response = await ApiRequest("GET", `${serverUrl}/listeners`, headers, "");

      if (response.statusCode >= 200 && response.statusCode < 300) {
        const data = JSON.parse(response.body);
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
            if (parsedData.length > 0 && !listenerId) {
                setListenerId(parsedData[0].id)
            }
        }
      }
    } catch (e) {
        console.error("Failed to fetch listeners", e)
    }
  }

  async function handleCreate() {
    setError(null)
    setSuccess(null)
    setCreatedPath(null)

    if (!name.trim()) {
      setError("Name is required")
      return
    }
    if (!listenerId) {
      setError("Listener is required")
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
      
      const selectedListener = listeners.find(l => l.id === listenerId);
      const payload = {
        name,
        listener: selectedListener.id,
        arch,
        format,
        os
      };

      const response = await ApiRequest("POST", `${serverUrl}/agents`, headers, JSON.stringify(payload));
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        setSuccess("Agent created successfully")
        
        let resultPath = response.body;
        try {
            const data = JSON.parse(response.body);
            // Prioritize 'file' as per latest server change, fallbacks for older formats
            resultPath = data.file || data.path || data.file_path || data.filepath || resultPath;
        } catch (e) {
            // use raw body
        }
        setCreatedPath(resultPath);

        setName("")
        // optionally reset other fields
        onCreated?.()
      } else {
        throw new Error(response.error || `Failed to create agent: ${response.statusCode}`);
      }

    } catch (e: any) {
      setError(e?.message || "Failed to generate agent")
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    if (!createdPath) return;

    try {
      let serverUrl = localStorage.getItem("serverUrl");
      const token = localStorage.getItem("token");

      if (!serverUrl) return;

      if(!serverUrl.includes("http")) {
        serverUrl = `http://${serverUrl}`;
      }

      const headers: any = token ? { "Authorization": `Bearer ${token}` } : {};
      
      const fileName = (createdPath.split(/[\\/]/).pop() || createdPath).replace(/"/g, "");
      const downloadPath = await SelectSavePath(fileName);
      
      if (!downloadPath) {
          // User cancelled
          return;
      }

      const downloadUrl = `${serverUrl}/agents/download?name=${fileName}`;
      
      setLoading(true); // Reuse loading state or add a new one? Reuse for now but be careful it doesn't close dialog logic
      try {
        await DownloadToFile(downloadUrl, downloadPath, headers);
        setSuccess(`Agent saved to ${downloadPath}`);
      } catch (err: any) {
        throw new Error(err);
      } finally {
        setLoading(false);
      }

    } catch(e) {
        console.error(e);
        setError("Failed to download file: " + e);
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
                  <SelectItem value="linux" disabled>Linux</SelectItem>
                  <SelectItem value="macos" disabled>macOS</SelectItem>
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
                  <SelectItem value="x86" disabled>x86</SelectItem>
                  <SelectItem value="arm64" disabled>ARM64</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Listener</Label>
            <Select value={listenerId} onValueChange={setListenerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Listener" />
              </SelectTrigger>
              <SelectContent>
                {listeners.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name} ({l.protocol} - {l.port})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=".exe">Executable (.exe)</SelectItem>
                <SelectItem value=".dll">DLL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}
        </div>

        <div className="flex justify-end gap-2">
          {createdPath && (
             <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Payload {createdPath.split(/[\\/]/).pop()}
             </Button>
          )}
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {success ? "Close" : "Cancel"}
          </Button>
          {!success && (
            <Button onClick={handleCreate} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Generating..." : "Generate Agent"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


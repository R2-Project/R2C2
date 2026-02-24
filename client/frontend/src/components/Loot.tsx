import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, ImageIcon, Trash2, Maximize2, Loader2, Calendar, FileIcon, FolderIcon, HardDriveIcon } from "lucide-react"
import { ApiRequest } from "@/lib/api"
import { DownloadToFile, SelectSavePath } from "../../wailsjs/go/main/App"
import { toast } from "@/global/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface Screenshot {
  filename: string
  sessionId: string
  timestamp: string
}

interface LootFile {
  id: string
  agent_id: string
  filename: string
  path: string
  size: number
  created_at: string
  type: string
}

export default function Loot() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [files, setFiles] = useState<LootFile[]>([])
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null)
  const [previewData, setPreviewData] = useState<string | null>(null)
  const [loadingScreenshots, setLoadingScreenshots] = useState(false)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(false)
  
  // Track active tab to refresh only visible content
  const [activeTab, setActiveTab] = useState("screenshots")

  useEffect(() => {
    if (activeTab === "screenshots") {
      fetchScreenshots()
    } else if (activeTab === "files") {
      fetchFiles()
    }
  }, [activeTab])

  // ... existing effects for preview ...
  useEffect(() => {
    if (selectedScreenshot) {
      fetchScreenshotContent(selectedScreenshot.filename)
    } else {
      setPreviewData(null)
    }
  }, [selectedScreenshot])

  useEffect(() => {
    return () => {
      // Cleanup object URL when component unmounts
      if (previewData) {
        URL.revokeObjectURL(previewData)
      }
    }
  }, [previewData])

  function parseFilename(filename: string): Screenshot {
    // ... existing parseFilename implementation ...
    // Format: <session_id>_screenshot_<timestamp>.png
    try {
      const parts = filename.split('_screenshot_')
      if (parts.length === 2) {
        const sessionId = parts[0]
        const timePart = parts[1].replace('.png', '')
        let timestamp = timePart;
        
        if (/^\d+$/.test(timePart)) {
             try {
                 const num = parseInt(timePart);
                 const date = num > 100000000000 ? new Date(num) : new Date(num * 1000);
                 timestamp = date.toLocaleString();
             } catch(e) {}
        }
        return { filename, sessionId, timestamp }
      }
    } catch (e) { console.warn(e) }
    return { filename, sessionId: 'unknown', timestamp: 'unknown' }
  }

  async function fetchScreenshots() {
    setLoadingScreenshots(true)
    try {
      const serverUrl = getServerUrl()
      const token = localStorage.getItem("token")
      const headers = token ? { "Authorization": `Bearer ${token}` } : {}
      
      const response = await ApiRequest("GET", `${serverUrl}/loot/screenshots`, headers, "")

      if (response.statusCode >= 200 && response.statusCode < 300) {
        const data = JSON.parse(response.body) || [] 
        if (Array.isArray(data)) {
            const parsed = data.map(parseFilename).sort((a, b) => b.filename.localeCompare(a.filename))
            setScreenshots(parsed)
            if (parsed.length > 0 && !selectedScreenshot) {
                 setSelectedScreenshot(parsed[0]);
            }
        } else {
            setScreenshots([])
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingScreenshots(false)
    }
  }

  async function fetchFiles() {
    setLoadingFiles(true)
    try {
      const serverUrl = getServerUrl()
      const token = localStorage.getItem("token")
      const headers = token ? { "Authorization": `Bearer ${token}` } : {}

      const response = await ApiRequest("GET", `${serverUrl}/loot`, headers, "")

      if (response.statusCode >= 200 && response.statusCode < 300) {
        const data = JSON.parse(response.body)
        if (Array.isArray(data)) {
            setFiles(data)
        } else {
            setFiles([])
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingFiles(false)
    }
  }

  function getServerUrl() {
      let serverUrl = localStorage.getItem("serverUrl")
      if (!serverUrl) throw new Error("Server URL not found")
      if(!serverUrl.includes("http")) serverUrl = `http://${serverUrl}`
      return serverUrl
  }

  async function fetchScreenshotContent(filename: string) {
    setLoadingPreview(true);
    setPreviewData(null);
    try {
        const serverUrl = getServerUrl()
        const token = localStorage.getItem("token")
        const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {}
        
        const response = await fetch(`${serverUrl}/loot/screenshots/${filename}`, {
            method: 'GET',
            headers: headers
        })
  
        if (response.ok) {
           const blob = await response.blob()
           const objectUrl = URL.createObjectURL(blob)
           setPreviewData(objectUrl)
        }
    } catch(e: any) {
        console.error(e)
    } finally {
        setLoadingPreview(false);
    }
  }

  async function handleDownloadScreenshot(file: Screenshot) {
     // ... existing handleDownload implementation adapted ...
     downloadFile(file.filename, `/loot/download/screenshots/${file.filename}`)
  }

  async function handleDownloadFile(file: LootFile) {
     // ... existing handleDownload implementation adapted ...
     // Assuming endpoint /loot/:id/download or similar. 
     // Using the logic from previous implementation:
     downloadFile(file.filename, `/loot/${file.id}/download`)
  }

  async function downloadFile(filename: string, endpointPath: string) {
    try {
      const savePath = await SelectSavePath(filename)
      if (!savePath) return

      const serverUrl = getServerUrl()
      const token = localStorage.getItem("token")
      const downloadUrl = `${serverUrl}${endpointPath}`
      const headers = token ? { "Authorization": `Bearer ${token}` } : {}

      await DownloadToFile(downloadUrl, savePath, headers)
      toast({ title: "Download successful", description: `Saved ${filename}` })
    } catch (e: any) {
      console.error("Download failed:", e)
      toast({ title: "Download failed", description: e?.message, variant: "destructive" })
    }
  }

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b flex items-center gap-2 justify-between">
         <div className="flex items-center gap-2">
            <FolderIcon className="w-5 h-5 text-yellow-500"/> 
            <h2 className="text-lg font-semibold">Loot</h2>
         </div>
         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>
         </Tabs>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full w-full">
            <TabsContent value="screenshots" className="h-full mt-0 border-0 flex overflow-hidden">
                {/* Left List */}
                <div className="w-[300px] border-r flex flex-col bg-muted/10 h-full">
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {loadingScreenshots && screenshots.length === 0 && (
                                <div className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                     <Loader2 className="h-4 w-4 animate-spin"/> Loading...
                                </div>
                            )}
                            {!loadingScreenshots && screenshots.length === 0 && (
                                <div className="p-4 text-center text-sm text-muted-foreground">No screenshots found</div>
                            )}
                            {screenshots.map((file) => (
                                <button
                                    key={file.filename}
                                    onClick={() => setSelectedScreenshot(file)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-md text-sm transition-colors flex flex-col gap-1 border border-transparent",
                                        selectedScreenshot?.filename === file.filename 
                                            ? "bg-primary/10 border-primary/20 text-primary" 
                                            : "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-2 font-medium truncate w-full">
                                        <FileIcon className="h-3 w-3 shrink-0 opacity-70" />
                                        <span className="truncate">{file.sessionId}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs opacity-70 pl-5">
                                        <Calendar className="h-3 w-3" />
                                        <span>{file.timestamp}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Preview */}
                <div className="flex-1 flex flex-col overflow-hidden bg-background h-full">
                    {selectedScreenshot ? (
                        <div className="flex-1 flex flex-col h-full">
                             {/* Toolbar */}
                             <div className="h-12 border-b flex items-center justify-between px-4 shrink-0">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{selectedScreenshot.filename}</span>
                                    <span className="text-xs text-muted-foreground">{selectedScreenshot.timestamp}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleDownloadScreenshot(selectedScreenshot)}>
                                        <Download className="h-4 w-4 mr-2" /> Download
                                    </Button>
                                </div>
                             </div>
                             
                             {/* Image Container */}
                             <div className="flex-1 overflow-auto p-8 flex items-start justify-center bg-zinc-900/5 dark:bg-zinc-900/50">
                                {loadingPreview ? (
                                    <div className="flex h-full items-center justify-center">
                                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : previewData ? (
                                    <div className="relative shadow-lg rounded-lg overflow-hidden border bg-background shrink-0">
                                        <img 
                                            src={previewData} 
                                            alt={selectedScreenshot.filename}
                                            className="max-w-none"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                      <div className="text-muted-foreground text-sm">Failed to load preview</div>
                                    </div>
                                )}
                             </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-2">
                            <ImageIcon className="h-12 w-12 opacity-20" />
                            <p>Select a screenshot to preview</p>
                        </div>
                    )}
                </div>
            </TabsContent>
            
            <TabsContent value="files" className="h-full mt-0 border-0 overflow-auto p-4">
                 <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Type</TableHead>
                          <TableHead>Filename</TableHead>
                          <TableHead>Agent ID</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Captured At</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingFiles && files.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                            </TableRow>
                        )}
                        {!loadingFiles && files.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No files found</TableCell>
                            </TableRow>
                        )}
                        {files.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell>
                              {file.type?.startsWith("image") ? (
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                              ) : (
                                <FileIcon className="h-4 w-4 text-gray-500" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{file.filename}</TableCell>
                            <TableCell className="font-mono text-xs">{file.agent_id}</TableCell>
                            <TableCell>{formatBytes(file.size)}</TableCell>
                            <TableCell>{new Date(file.created_at).toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleDownloadFile(file)}>
                                    <Download className="h-4 w-4 mr-1" /> Download
                                  </Button>
                                </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

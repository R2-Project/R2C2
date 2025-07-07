import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { ScrollArea } from "./components/ui/scroll-area"
import { Badge } from "./components/ui/badge"
import {
  Terminal,
  Activity,
  Network,
  ChevronRight,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

export default function CyberpunkDesktop() {
  const [terminalLines, setTerminalLines] = useState([
    { id: 1, output: "System initialized...", timestamp: "14:32:01", type: "success" },
    { id: 2, output: "Loading modules...", timestamp: "14:32:02", type: "output" },
    { id: 3, output: "Ready for commands", timestamp: "14:32:03", type: "success" },
  ])

  const [currentCommand, setCurrentCommand] = useState("")
  const [events, setEvents] = useState([
    { id: 1, timestamp: "14:30:15", type: "info", source: "NETWORK", message: "Scanning subnet 192.168.1.0/24" },
    { id: 2, timestamp: "14:30:22", type: "success", source: "EXPLOIT", message: "Payload delivered to 192.168.1.105" },
    { id: 3, timestamp: "14:30:45", type: "warning", source: "STEALTH", message: "Unusual traffic detected" },
    { id: 4, timestamp: "14:31:12", type: "error", source: "CONNECTION", message: "Lost connection to beacon" },
    {
      id: 5,
      timestamp: "14:31:33",
      type: "success",
      source: "PERSISTENCE",
      message: "Backdoor installed successfully",
    },
  ])

  const [networkNodes] = useState([
    { id: "1", ip: "192.168.1.1", hostname: "gateway", status: "online", x: 50, y: 50 },
    { id: "2", ip: "192.168.1.105", hostname: "workstation-01", status: "compromised", x: 150, y: 80 },
    { id: "3", ip: "192.168.1.110", hostname: "server-db", status: "online", x: 250, y: 120 },
    { id: "4", ip: "192.168.1.115", hostname: "workstation-02", status: "offline", x: 180, y: 180 },
    { id: "5", ip: "10.0.0.50", hostname: "external-target", status: "online", x: 320, y: 90 },
  ])

  const [fileSystem, setFileSystem] = useState([
    {
      id: "1",
      name: "root",
      type: "folder",
      modified: "2024-01-15 14:30",
      path: "/",
      children: [
        {
          id: "2",
          name: "payloads",
          type: "folder",
          modified: "2024-01-15 14:25",
          path: "/payloads",
          children: [
            {
              id: "3",
              name: "reverse_shell.py",
              type: "file",
              size: 2048,
              modified: "2024-01-15 14:20",
              path: "/payloads/reverse_shell.py",
              content: "#!/usr/bin/env python3\nimport socket\nimport subprocess\n# Reverse shell payload\n",
            },
            {
              id: "4",
              name: "keylogger.exe",
              type: "file",
              size: 15360,
              modified: "2024-01-15 13:45",
              path: "/payloads/keylogger.exe",
            },
          ],
        },
        {
          id: "5",
          name: "logs",
          type: "folder",
          modified: "2024-01-15 14:30",
          path: "/logs",
          children: [
            {
              id: "6",
              name: "access.log",
              type: "file",
              size: 4096,
              modified: "2024-01-15 14:30",
              path: "/logs/access.log",
              content:
                "[14:30:15] INFO: Connection established\n[14:30:22] SUCCESS: Payload executed\n[14:30:45] WARNING: Detection risk",
            },
          ],
        },
        {
          id: "7",
          name: "config.json",
          type: "file",
          size: 512,
          modified: "2024-01-15 12:00",
          path: "/config.json",
          content: '{\n  "server": "192.168.1.100",\n  "port": 4444,\n  "encryption": true\n}',
        },
      ],
    },
  ])

  const [selectedFile, setSelectedFile] = useState(null)
  const [expandedFolders, setExpandedFolders] = useState(new Set(["1", "2", "5"]))

  const terminalRef = useRef(null)

  const handleCommand = (e) => {
    e.preventDefault()
    if (!currentCommand.trim()) return

    const newCommand = {
      id: Date.now(),
      command: currentCommand,
      timestamp: new Date().toLocaleTimeString(),
      type: "command",
    }

    // Simulate command responses
    const responses = {
      help: "Available commands: scan, exploit, persist, stealth, status",
      scan: "Scanning network... Found 5 active hosts",
      exploit: "Launching exploit against target...",
      persist: "Installing persistence mechanism...",
      stealth: "Enabling stealth mode...",
      status: "All systems operational",
    }

    const response = {
      id: Date.now() + 1,
      output: responses[currentCommand] || `Command not found: ${currentCommand}`,
      timestamp: new Date().toLocaleTimeString(),
      type: responses[currentCommand] ? "success" : "error",
    }

    setTerminalLines((prev) => [...prev, newCommand, response])
    setCurrentCommand("")
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalLines])

  // Add new events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: ["info", "warning", "success"][Math.floor(Math.random() * 3)],
        source: ["NETWORK", "EXPLOIT", "STEALTH", "PERSISTENCE"][Math.floor(Math.random() * 4)],
        message: [
          "Heartbeat received from beacon",
          "New target discovered",
          "Credential harvested",
          "Maintaining persistence",
        ][Math.floor(Math.random() * 4)],
      }
      setEvents((prev) => [newEvent, ...prev.slice(0, 9)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "text-cyan-400"
      case "compromised":
        return "text-red-400"
      case "offline":
        return "text-gray-500"
      default:
        return "text-gray-400"
    }
  }

  const getEventIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-cyan-400" />
    }
  }

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const getFileIcon = (item) => {
    if (item.type === "folder") {
      return expandedFolders.has(item.id) ? "📂" : "📁"
    }
    const ext = item.name.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "py":
        return "🐍"
      case "exe":
        return "⚙️"
      case "log":
        return "📋"
      case "json":
        return "📄"
      default:
        return "📄"
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ""
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const renderFileTree = (items, depth = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-cyan-500/10 ${
            selectedFile?.id === item.id ? "bg-cyan-500/20" : ""
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (item.type === "folder") {
              toggleFolder(item.id)
            } else {
              setSelectedFile(item)
            }
          }}
        >
          <span className="text-sm">{getFileIcon(item)}</span>
          <span className="text-sm text-gray-300 flex-1">{item.name}</span>
          {item.type === "file" && <span className="text-xs text-gray-500">{formatFileSize(item.size)}</span>}
        </div>
        {item.type === "folder" && expandedFolders.has(item.id) && item.children && (
          <div>{renderFileTree(item.children, depth + 1)}</div>
        )}
      </div>
    ))
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Header */}
      <div className="mb-4 border-b border-cyan-500/30 pb-4">
        <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          NEXUS COMMAND CENTER
        </h1>
        <p className="text-sm text-gray-400">Advanced Penetration Testing Framework v2.1.0</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-16 gap-4 h-[calc(100vh-120px)]">
        {/* Terminal Panel */}
        <div className="col-span-6">
          <Card className="h-full bg-gray-900/50 border-cyan-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Command Terminal
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col">
              <ScrollArea className="flex-1 mb-4" ref={terminalRef}>
                <div className="space-y-1">
                  {terminalLines.map((line) => (
                    <div key={line.id} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-500 text-xs w-20 shrink-0">{line.timestamp}</span>
                      {line.command ? (
                        <div className="flex items-center gap-1">
                          <ChevronRight className="w-3 h-3 text-cyan-400" />
                          <span className="text-cyan-400">{line.command}</span>
                        </div>
                      ) : (
                        <span
                          className={
                            line.type === "error"
                              ? "text-red-400"
                              : line.type === "success"
                                ? "text-green-400"
                                : "text-gray-300"
                          }
                        >
                          {line.output}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <form onSubmit={handleCommand} className="flex gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                  <Input
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    placeholder="Enter command..."
                    className="bg-black/50 border-cyan-500/30 text-green-400 placeholder-gray-500"
                  />
                </div>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-black">
                  Execute
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Events and Network */}
        <div className="col-span-6 flex flex-col gap-4">
          {/* Event Logger */}
          <Card className="flex-1 bg-gray-900/50 border-cyan-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Event Logger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start gap-2 p-2 rounded bg-black/30">
                      {getEventIcon(event.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                            {event.source}
                          </Badge>
                          <span className="text-xs text-gray-500">{event.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-300 break-words">{event.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Network Map */}
          <Card className="flex-1 bg-gray-900/50 border-cyan-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Network className="w-5 h-5" />
                Network Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 bg-black/30 rounded overflow-hidden">
                <svg className="w-full h-full">
                  {/* Connection lines */}
                  <line x1="50" y1="50" x2="150" y2="80" stroke="cyan" strokeWidth="1" opacity="0.5" />
                  <line x1="150" y1="80" x2="250" y2="120" stroke="red" strokeWidth="2" opacity="0.8" />
                  <line x1="50" y1="50" x2="180" y2="180" stroke="gray" strokeWidth="1" opacity="0.3" />
                  <line x1="250" y1="120" x2="320" y2="90" stroke="cyan" strokeWidth="1" opacity="0.5" />

                  {/* Network nodes */}
                  {networkNodes.map((node) => (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="8"
                        fill={
                          node.status === "compromised" ? "#ef4444" : node.status === "online" ? "#06b6d4" : "#6b7280"
                        }
                        className="animate-pulse"
                      />
                      <text
                        x={node.x}
                        y={node.y + 20}
                        textAnchor="middle"
                        className={`text-xs fill-current ${getStatusColor(node.status)}`}
                      >
                        {node.ip}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Legend */}
                <div className="absolute bottom-2 right-2 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-gray-400">Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-gray-400">Compromised</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-400">Offline</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Browser Panel */}
        <div className="col-span-4 flex flex-col gap-4">
          <Card className="flex-1 bg-gray-900/50 border-cyan-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 002 2H6a2 2 0 002-2v0z"
                  />
                </svg>
                File Browser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-1">{renderFileTree(fileSystem)}</div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* File Content Viewer */}
          <Card className="flex-1 bg-gray-900/50 border-cyan-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                File Viewer
                {selectedFile && (
                  <Badge variant="outline" className="ml-2 text-xs border-cyan-500/30 text-cyan-400">
                    {selectedFile.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-700 pb-2">
                    <span>Path: {selectedFile.path}</span>
                    <span>Modified: {selectedFile.modified}</span>
                  </div>
                  {selectedFile.content ? (
                    <ScrollArea className="h-48">
                      <pre className="text-xs text-green-400 bg-black/30 p-3 rounded font-mono whitespace-pre-wrap">
                        {selectedFile.content}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <svg
                          className="w-12 h-12 mx-auto mb-2 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-sm">Binary file - Cannot preview</p>
                        <p className="text-xs mt-1">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-black text-xs">
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs bg-transparent"
                    >
                      Delete
                    </Button>
                    {selectedFile.name.endsWith(".py") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs bg-transparent"
                      >
                        Execute
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg
                      className="w-12 h-12 mx-auto mb-2 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z"
                      />
                    </svg>
                    <p className="text-sm">Select a file to view</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

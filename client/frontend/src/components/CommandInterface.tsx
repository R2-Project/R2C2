import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface ConsoleEntry {
  id: string;
  type: "command" | "output" | "system";
  content: string;
  timestamp: Date;
  level?: "info" | "success" | "warning" | "error";
}

interface CommandInterfaceProps {
  sessionId?: string;
}

export default function CommandInterface({ sessionId }: CommandInterfaceProps) {
  const [entries, setEntries] = useState<ConsoleEntry[]>([
    {
      id: "1",
      type: "system",
      content: "[*] C2 Framework v2.1.3 - Command & Control Interface",
      timestamp: new Date(),
      level: "success",
    },
    {
      id: "2",
      type: "system",
      content: `[+] Connected to session: ${sessionId || "UNKNOWN"}`,
      timestamp: new Date(),
      level: "info",
    },
    {
      id: "2",
      type: "system",
      content: "[+] Successfully connected to team server",
      timestamp: new Date(),
      level: "info",
    },
    {
      id: "3",
      type: "system",
      content: "[*] Initializing listeners...",
      timestamp: new Date(),
      level: "info",
    },
    {
      id: "4",
      type: "system",
      content: "[+] HTTP listener started on 192.168.1.100:8080",
      timestamp: new Date(),
      level: "success",
    },
    {
      id: "5",
      type: "system",
      content: "[+] HTTPS listener started on 192.168.1.100:8443",
      timestamp: new Date(),
      level: "success",
    },
    {
      id: "6",
      type: "system",
      content: "[*] Beacon received from 10.0.2.15",
      timestamp: new Date(),
      level: "info",
    },
    {
      id: "7",
      type: "system",
      content: "[+] New session established: SESSION_001",
      timestamp: new Date(),
      level: "success",
    },
  ]);

  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPrompt, setCurrentPrompt] = useState("beacon");
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeCommand = (command: string) => {
    const commandEntry: ConsoleEntry = {
      id: Date.now().toString(),
      type: "command",
      content: `${currentPrompt} ${command}`,
      timestamp: new Date(),
    };

    let outputEntry: ConsoleEntry;

    // Mock command processing
    switch (command.toLowerCase()) {
      case "help":
        outputEntry = {
          id: (Date.now() + 1).toString(),
          type: "output",
          content: `Available commands:
  sessions     - List active sessions
  listeners    - Manage listeners
  payloads     - Generate payloads
  pivot        - Manage pivoting
  shell        - Execute shell command
  upload       - Upload file to target
  download     - Download file from target`,
          timestamp: new Date(),
        };
        break;
      case "sessions":
        outputEntry = {
          id: (Date.now() + 1).toString(),
          type: "output",
          content: `Active Sessions:
  SESSION_001  10.0.2.15     DESKTOP-ABC123\\admin  Windows 10  [ACTIVE]
  SESSION_002  172.16.1.50   WS-LAB01\\user         Windows 11  [ACTIVE]
  SESSION_003  192.168.1.25  SRV-DC01\\system      Windows Server 2019  [HIGH PRIV]`,
          timestamp: new Date(),
          level: "success",
        };
        break;
      case "pwd":
        outputEntry = {
          id: (Date.now() + 1).toString(),
          type: "output",
          content: "C:\\Users\\admin",
          timestamp: new Date(),
        };
        break;
      default:
        if (command.startsWith("use ")) {
          const sessionId = command.substring(4);
          setCurrentPrompt(`${sessionId}>`);
          outputEntry = {
            id: (Date.now() + 1).toString(),
            type: "system",
            content: `[+] Interacting with ${sessionId} (10.0.2.15)`,
            timestamp: new Date(),
            level: "success",
          };
        } else {
          outputEntry = {
            id: (Date.now() + 1).toString(),
            type: "output",
            content: `Unknown command: ${command}`,
            timestamp: new Date(),
            level: "error",
          };
        }
    }

    setEntries(prev => [...prev, commandEntry, outputEntry]);
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setCurrentCommand("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const command = currentCommand.trim();
      if (command) {
        executeCommand(command);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        } else {
          setHistoryIndex(-1);
          setCurrentCommand("");
        }
      }
    }
  };

  const getEntryColor = (entry: ConsoleEntry) => {
    if (entry.type === "command") return "c2-text";
    
    switch (entry.level) {
      case "success": return "c2-text-accent";
      case "info": return "c2-text-info";
      case "warning": return "c2-text-warning";
      case "error": return "c2-text-error";
      default: return "c2-text-dim";
    }
  };

  return (
    <div className="w-full h-full c2-bg-dark p-4 font-mono text-sm flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-1 mb-4">
        {entries.map((entry) => (
          <div key={entry.id} className={`${getEntryColor(entry)}`}>
            {entry.content.split('\n').map((line, index) => (
              <div key={index} className={index > 0 ? "ml-4" : ""}>
                {line}
              </div>
            ))}
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>
      
      <div className="mt-auto pt-2">
        <div className="flex items-center space-x-2 border c2-border rounded bg-white/5 px-3 py-2 focus-within:ring-1 focus-within:ring-[var(--c2-accent)] focus-within:border-transparent transition-all">
          <span className="c2-text-accent font-bold shrink-0 select-none flex items-center">
            {currentPrompt}
            <ChevronRight className="w-4 h-4 ml-1" />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none c2-text placeholder:text-white/20"
            placeholder="Enter command..."
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Request } from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";

interface ConsoleEntry {
  id: string;
  type: "command" | "output" | "system";
  content: string;
  timestamp: Date;
  level?: "info" | "success" | "warning" | "error";
  raw?: boolean;
}

interface CommandInterfaceProps {
  sessionId?: string;
}

export default function CommandInterface({ sessionId }: CommandInterfaceProps) {
  const [entries, setEntries] = useState<ConsoleEntry[]>([
    {
      id: "2",
      type: "system",
      content: `[+] Connected to session: ${sessionId || "UNKNOWN"}`,
      timestamp: new Date(),
      level: "info",
    }
  ]);

  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const currentPrompt = "beacon";
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Listen for task results
  useEffect(() => {
      const cancelTaskIdx = EventsOn("task:result", (data: any) => {
          try {
              const result = typeof data === 'string' ? JSON.parse(data) : data;
              // Ensure this result belongs to the current session
              if (result.agent_id !== sessionId) return;

              setEntries(prev => [...prev, {
                  id: Date.now().toString(),
                  type: "output",
                  content: result.output || result.error || "(No output)",
                  timestamp: new Date(),
                  level: result.error ? "error" : "success",
                  raw: true 
              }]);
          } catch(e) {
              console.error("Error parsing task result", e);
          }
      });
      return () => cancelTaskIdx();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    const cmdText = currentCommand;
    setCommandHistory(prev => [...prev, cmdText]);
    setHistoryIndex(-1);
    setCurrentCommand("");

    // Add visual feedback of the command entered
    setEntries(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "command",
        content: cmdText,
        timestamp: new Date(),
      },
    ]);

    // Parse command
    if (cmdText === "clear" || cmdText === "cls") {
        setEntries([]);
        return;
    }

    const parts = cmdText.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    try {
        let serverUrl = localStorage.getItem("serverUrl");
        const token = localStorage.getItem("token");
        if (!serverUrl) {
            throw new Error("Server URL not configured");
        }
        if (!serverUrl.includes("http")) {
            serverUrl = `http://${serverUrl}`;
        }
        
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        const payload = {
            agent_id: sessionId,
            command: command,
            args: args
        };

        const response = await Request("POST", `${serverUrl}/tasks`, headers, JSON.stringify(payload));

        if (response.statusCode === 201) {
             const respData = JSON.parse(response.body);
             setEntries(prev => [...prev, {
                 id: Date.now().toString(),
                 type: "system",
                 content: `[+] ${respData.message || "Task queued"}`,
                 timestamp: new Date(),
                 level: "success"
             }]);
        } else {
             setEntries(prev => [...prev, {
                 id: Date.now().toString(),
                 type: "system",
                 content: `[-] Server error: ${response.statusCode}`,
                 timestamp: new Date(),
                 level: "error"
             }]);
        }

    } catch (err: any) {
         setEntries(prev => [...prev, {
             id: Date.now().toString(),
             type: "system",
             content: `[-] Request failed: ${err.message}`,
             timestamp: new Date(),
             level: "error"
         }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
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

  return (
    <div className="w-full h-full c2-bg-dark p-4 font-mono text-sm flex flex-col" onClick={() => inputRef.current?.focus()}>
      <div className="flex-1 overflow-y-auto space-y-1 mb-4">
        {entries.map((entry) => {
            if (entry.type === "command") {
                return (
                    <div key={entry.id} className="text-white">
                        <span className="c2-text-accent font-bold mr-2">{currentPrompt} &gt;</span>
                        <span>{entry.content}</span>
                    </div>
                );
            }
            if (entry.type === "output") {
                return (
                    <div key={entry.id} className="text-gray-300 ml-0 break-words whitespace-pre-wrap">
                        {entry.content}
                    </div>
                );
            }
            // System
            let colorClass = "c2-text-dim"; // default
            if (entry.level === "success") colorClass = "c2-text-accent"; 
            if (entry.level === "error") colorClass = "c2-text-error";
            if (entry.level === "info") colorClass = "c2-text-info";
            
            return (
                <div key={entry.id} className={`${colorClass} whitespace-pre-wrap`}>
                   {entry.content}
                </div>
            );
        })}
        <div ref={consoleEndRef} />
      </div>
      
      <div className="mt-auto pt-2">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 border c2-border rounded bg-white/5 px-3 py-2 focus-within:ring-1 focus-within:ring-[var(--c2-accent)] focus-within:border-transparent transition-all">
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
        </form>
      </div>
    </div>
  );
}

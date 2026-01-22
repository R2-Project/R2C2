import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Request } from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";

interface CommandArg {
    name: string;
    required: boolean;
    desc: string;
}

interface CommandDefinition {
    name: string;
    description: string;
    usage: string;
    args: CommandArg[];
    platforms?: string[];
}

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
  const [availableCommands, setAvailableCommands] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState("");

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch available commands for autocomplete
  useEffect(() => {
    const fetchCommands = async () => {
      try {
        let serverUrl = localStorage.getItem("serverUrl");
        const token = localStorage.getItem("token");
        if (!serverUrl) return;
        if (!serverUrl.includes("http")) serverUrl = `http://${serverUrl}`;

        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        const payload = {
          agent_id: sessionId,
          command: "help",
          args: []
        };

        const response = await Request("POST", `${serverUrl}/tasks`, headers, JSON.stringify(payload));
        if (response.statusCode === 200) {
                   const data = JSON.parse(response.body);
                   // The server returns an object { commands: [...] }
                   const commands: CommandDefinition[] = data.commands || [];
                   
                   // Merge server commands with local commands
                   const cmdNames = commands.map(c => c.name);
                   const localCmds = ["help", "clear", "cls"];
                   const uniqueCommands = Array.from(new Set([...cmdNames, ...localCmds])).sort();
                   setAvailableCommands(uniqueCommands);
              }
          } catch (e) {
        console.error("Failed to fetch commands", e);
      }
    };
    if (sessionId) fetchCommands();
  }, [sessionId]);

  // Update suggestion engine
  useEffect(() => {
    if (!currentCommand) {
      setSuggestion("");
      return;
    }

    const parts = currentCommand.split(" ");

    // Case 1: Typing a command (no spaces yet)
    if (parts.length === 1) {
      const match = availableCommands.find(cmd => cmd.startsWith(currentCommand));
      setSuggestion(match || "");
    }
    // Case 2: Typing help <command>
    else if (parts.length === 2 && parts[0] === "help") {
      const partialArg = parts[1];
      // Only suggest if they've started typing the argument
      if (partialArg) {
        const match = availableCommands.find(cmd => cmd.startsWith(partialArg));
        if (match) {
          setSuggestion(`help ${match}`);
        } else {
          setSuggestion("");
        }
      } else {
        setSuggestion("");
      }
    } else {
      setSuggestion("");
    }
  }, [currentCommand, availableCommands]);

  // Listen for task results
  useEffect(() => {
      const cancelTaskIdx = EventsOn("task:result", (data: any) => {
          try {
              const result = typeof data === 'string' ? JSON.parse(data) : data;
              // Ensure this result belongs to the current session
              // Structure: { task: { agent_id: ... }, output: ... }
              const agentId = result.task?.agent_id || result.agent_id;
              
              if (agentId !== sessionId) return;

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

    const parts = cmdText.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    if (command === "clear" || command === "cls") {
        setEntries([]);
        return;
    }

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
        const respData = response.body ? JSON.parse(response.body) : {};

        // Handle successful task queuing (201 Created or 200 OK with message only)
        if (response.statusCode === 201 || (response.statusCode === 200 && !respData.commands)) {
             setEntries(prev => [...prev, {
                 id: Date.now().toString(),
                 type: "system",
                 content: `[+] ${respData.message || "Task queued"}`,
                 timestamp: new Date(),
                 level: "success"
             }]);
             return;
        } 
        
        // Handle Help/Command List response
        if (response.statusCode === 200 && respData.commands) {
             const commands: CommandDefinition[] = respData.commands;
             let outputContent = "";
             
             if (args.length > 0) {
                 // Specific help
                 const cmdName = args[0];
                 const cmdDef = commands.find(c => c.name === cmdName);
                 if (cmdDef) {
                     outputContent = `Command: ${cmdDef.name}\n`;
                     outputContent += `Description: ${cmdDef.description}\n`;
                     outputContent += `Usage: ${cmdDef.usage}\n`;
                     if (cmdDef.args && cmdDef.args.length > 0) {
                         outputContent += `Arguments:\n`;
                         cmdDef.args.forEach(arg => {
                             outputContent += `  ${arg.name.padEnd(15)} ${arg.required ? '(Required)' : '(Optional)'} - ${arg.desc}\n`;
                         });
                     }
                 } else {
                     outputContent = `Command '${cmdName}' not found.`;
                 }
             } else {
                 // List all
                 outputContent = "Available Commands:\n\n";
                 // Determine padding
                 const maxNameLen = Math.max(...commands.map(c => c.name.length), 0);
                 commands.forEach(cmd => {
                     outputContent += `  ${cmd.name.padEnd(maxNameLen + 4)} ${cmd.description}\n`;
                 });
             }

             setEntries(prev => [...prev, {
                 id: Date.now().toString(),
                 type: "output",
                 content: outputContent,
                 timestamp: new Date()
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
    if (e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.form?.requestSubmit();
        return;
    }

    if (e.key === "Tab") {
        e.preventDefault();
        if (suggestion) {
            setCurrentCommand(suggestion);
        }
        return;
    }

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
          <div className="flex-1 relative">
            <input
                type="text"
                value={suggestion}
                readOnly
                className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-white/20 pointer-events-none"
                tabIndex={-1}
            />
            <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                className="relative z-10 w-full h-full bg-transparent border-none outline-none c2-text placeholder:text-white/20"
                placeholder="Enter command..."
                autoComplete="off"
                spellCheck="false"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

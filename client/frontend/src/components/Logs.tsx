import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Info, AlertTriangle, Bug, CheckCircle } from "lucide-react";
import { EventsOn } from '../../wailsjs/runtime/runtime';

type LogLevel = "info" | "debug" | "error" | "warning" | "success";

interface LogEntry {
  time: string;
  level: LogLevel;
  message: string;
  [key: string]: any;
}

const getLevelColor = (level: LogLevel) => {
  switch (level) {
    case "info": return "text-blue-400";
    case "debug": return "text-gray-400";
    case "warning": return "text-yellow-400";
    case "error": return "text-red-400";
    case "success": return "text-green-400";
    default: return "text-white";
  }
};

const getLevelIcon = (level: LogLevel) => {
  switch (level) {
    case "info": return <Info className="w-4 h-4" />;
    case "debug": return <Bug className="w-4 h-4" />;
    case "warning": return <AlertTriangle className="w-4 h-4" />;
    case "error": return <AlertCircle className="w-4 h-4" />;
    case "success": return <CheckCircle className="w-4 h-4" />;
  }
};

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if running in Wails context
    if (!(window as any).runtime) {
        return;
    }

    // Subscribe to c2:event
    const cancelC2Event = EventsOn("c2:event", (message: string) => {
      try {
        console.log("Received log message:", message);
        const logEntry: any = JSON.parse(message);
        
        // Handle zerolog 'msg' field
        if (!logEntry.message && logEntry.msg) {
            logEntry.message = logEntry.msg;
        }

        // Handle zerolog 'error' field
        if (logEntry.error) {
            logEntry.message = `${logEntry.message || ''} Error: ${logEntry.error}`;
        }

        // Handle zerolog levels
        if (logEntry.level === 'warn') logEntry.level = 'warning';
        if (logEntry.level === 'fatal') logEntry.level = 'error';
        if (logEntry.level === 'panic') logEntry.level = 'error';

        // Ensure time is present, if not add current time
        if (!logEntry.time) {
            logEntry.time = new Date().toISOString();
        }
        // Ensure level is valid
        if (!["info", "debug", "error", "warning", "success"].includes(logEntry.level)) {
            logEntry.level = "info";
        }
        
        setLogs((prevLogs) => [...prevLogs, logEntry]);
      } catch (e) {
        console.error("Failed to parse log message:", message, e);
        // Optionally add a raw log entry if parsing fails
        setLogs((prevLogs) => [...prevLogs, {
            time: new Date().toISOString(),
            level: "info",
            message: message
        }]);
      }
    });

    const cancelNetworkError = EventsOn("network:error", (error: string) => {
        console.error("Network error:", error);
        setLogs((prevLogs) => [...prevLogs, {
            time: new Date().toISOString(),
            level: "error",
            message: `Network Error: ${error}`
        }]);
    });

    return () => {
      if (cancelC2Event) cancelC2Event();
      if (cancelNetworkError) cancelNetworkError();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="w-full min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-36">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {logs.map((log, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-muted-foreground font-mono">
                      {new Date(log.time).toLocaleString()}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-xs font-medium flex items-center gap-2">
                      <span className={getLevelColor(log.level)}>
                        {getLevelIcon(log.level)}
                      </span>
                      <span className={`uppercase ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-2 text-xs text-foreground font-mono break-all">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

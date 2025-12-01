import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Info, AlertTriangle, Bug } from "lucide-react";

type LogLevel = "info" | "debug" | "error" | "warning";

interface LogEntry {
  time: string;
  level: LogLevel;
  message: string;
  [key: string]: any;
}

const dummyLogs: LogEntry[] = [
  { time: "2023-10-27T10:00:00Z", level: "info", message: "System initialized" },
  { time: "2023-10-27T10:00:05Z", level: "debug", message: "Loading modules..." },
  { time: "2023-10-27T10:01:20Z", level: "warning", message: "High memory usage detected" },
  { time: "2023-10-27T10:02:15Z", level: "error", message: "Failed to connect to database" },
  { time: "2023-10-27T10:03:00Z", level: "info", message: "User logged in" },
  { time: "2023-10-27T10:05:00Z", level: "debug", message: "Processing request ID: 12345" },
];

const getLevelColor = (level: LogLevel) => {
  switch (level) {
    case "info": return "text-blue-400";
    case "debug": return "text-gray-400";
    case "warning": return "text-yellow-400";
    case "error": return "text-red-400";
    default: return "text-white";
  }
};

const getLevelIcon = (level: LogLevel) => {
  switch (level) {
    case "info": return <Info className="w-4 h-4" />;
    case "debug": return <Bug className="w-4 h-4" />;
    case "warning": return <AlertTriangle className="w-4 h-4" />;
    case "error": return <AlertCircle className="w-4 h-4" />;
  }
};

export default function Logs() {
  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="w-full min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-48">
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
                {dummyLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-2 whitespace-nowrap text-xs text-muted-foreground font-mono">
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
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

import { create } from 'zustand';

export type LogLevel = "info" | "debug" | "error" | "warning" | "success";

export interface LogEntry {
  time: string;
  level: LogLevel;
  message: string;
  [key: string]: any;
}

interface LogStore {
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
  logs: [],
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  clearLogs: () => set({ logs: [] }),
}));

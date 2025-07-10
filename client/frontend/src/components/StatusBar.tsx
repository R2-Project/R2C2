import { useState, useEffect } from "react";

export default function StatusBar() {
  const [uptime, setUptime] = useState("00:00:00");
  const [activeSession, setActiveSession] = useState("SESSION_001");

  useEffect(() => {
    const updateUptime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setUptime(`${hours}:${minutes}:${seconds}`);
    };

    updateUptime();
    const interval = setInterval(updateUptime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="c2-bg-panel c2-border border-t px-4 py-2 text-xs flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="c2-text-dim">Status:</span>
        <span className="c2-text-accent">Connected</span>
        <span className="c2-text-dim">|</span>
        <span className="c2-text-dim">Session:</span>
        <span className="c2-text-info">{activeSession}</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="c2-text-dim">Server:</span>
        <span className="c2-text-accent">192.168.1.100:50050</span>
        <span className="c2-text-dim">|</span>
        <span className="c2-text-dim">Uptime:</span>
        <span className="c2-text-dim">{uptime}</span>
      </div>
    </div>
  );
}

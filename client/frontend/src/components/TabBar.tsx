import { useState } from "react";
import { X, Plus, Terminal, AudioLines, Users, Separator } from "lucide-react";

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
  active: boolean;
  isSeparator?: boolean;
}

export default function TabBar() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "console",
      name: "Console",
      icon: <Terminal className="w-3 h-3" />,
      active: true,
    },
    {
      id: "listeners",
      name: "Listeners",
      icon: <AudioLines className="w-3 h-3" />,
      active: false,
    },
  ]);

  const setActiveTab = (tabId: string) => {
    setTabs(tabs.map(tab => ({ ...tab, active: tab.id === tabId })));
  };

  const closeTab = (tabId: string) => {
    const nonSeparatorTabs = tabs.filter(tab => !tab.isSeparator);
    if (nonSeparatorTabs.length > 1) {
      const newTabs = tabs.filter(tab => tab.id !== tabId);
      const closedTabIndex = tabs.findIndex(tab => tab.id === tabId);
      const wasActive = tabs.find(tab => tab.id === tabId)?.active;
      
      if (wasActive && newTabs.length > 0) {
        const nextActiveTab = newTabs.find(tab => !tab.isSeparator);
        if (nextActiveTab) {
          nextActiveTab.active = true;
        }
      }
      
      setTabs(newTabs);
    }
  };

  const addSeparator = () => {
    const separatorId = `separator-${Date.now()}`;
    const separator: Tab = {
      id: separatorId,
      name: "",
      icon: null,
      active: false,
      isSeparator: true,
    };
    setTabs([...tabs, separator]);
  };

  const addNewTab = () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      name: "New Tab",
      icon: <Terminal className="w-3 h-3" />,
      active: false,
    };
    setTabs([...tabs, newTab]);
  };

  return (
    <div className="c2-bg-panel c2-border border-b flex items-center h-10">
      <div className="flex">
        {tabs.map((tab) => {
          if (tab.isSeparator) {
            return (
              <div
                key={tab.id}
                className="flex items-center px-2 py-2 cursor-pointer hover:c2-bg-dark group"
                onClick={() => closeTab(tab.id)}
                title="Click to remove separator"
              >
                <div className="w-px h-6 c2-bg-dark"></div>
                <button className="ml-1 opacity-0 group-hover:opacity-100 c2-text-dim hover:c2-text-error">
                  <X className="w-2 h-2" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={tab.id}
              className={`c2-border border-r px-4 py-2 text-sm flex items-center space-x-2 cursor-pointer ${
                tab.active 
                  ? "c2-bg-dark c2-text-accent" 
                  : "hover:c2-bg-dark c2-text"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={tab.active ? "c2-text-accent" : "c2-text-info"}>
                {tab.icon}
              </span>
              <span>{tab.name}</span>
              <button
                className="ml-2 c2-text-dim hover:c2-text-error"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
        {/*
        <button 
          className="px-3 py-2 c2-text-dim hover:c2-text-accent"
          onClick={addNewTab}
          title="Add new tab"
        >
          <Plus className="w-4 h-4" />
        </button>
        */}
      </div>
    </div>
  );
}

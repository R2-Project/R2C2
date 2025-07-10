import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { X, Terminal, Network, Users, FileText, Settings, Grip } from "lucide-react";
import CommandInterface from "./CommandInterface";
import NetworkMap from "./NetworkMap";
import FileExplorer from "./FileExplorer";

interface PanelTab {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  type: "console" | "network" | "sessions" | "files" | "settings";
}

interface ActivePanel {
  id: string;
  tabs: PanelTab[];
  activeTabId: string;
}

export default function MultiPanelInterface() {
  const [panels, setPanels] = useState<ActivePanel[]>([
    {
      id: "panel-1",
      tabs: [
        {
          id: "console-1",
          name: "Console",
          icon: <Terminal className="w-3 h-3" />,
          component: <CommandInterface />,
          type: "console",
        },
      ],
      activeTabId: "console-1",
    },
    {
      id: "panel-2",
      tabs: [
        {
          id: "network-1",
          name: "Network Map",
          icon: <Network className="w-3 h-3" />,
          component: <NetworkMap />,
          type: "network",
        },
      ],
      activeTabId: "network-1",
    },
  ]);

  const availableTabTypes = [
    { type: "console", name: "Console", icon: <Terminal className="w-3 h-3" />, component: <CommandInterface /> },
    { type: "network", name: "Network Map", icon: <Network className="w-3 h-3" />, component: <NetworkMap /> },
    { type: "sessions", name: "Sessions", icon: <Users className="w-3 h-3" />, component: <div className="p-4 c2-text">Sessions View</div> },
    { type: "files", name: "File Browser", icon: <FileText className="w-3 h-3" />, component: <FileExplorer /> },
    { type: "settings", name: "Settings", icon: <Settings className="w-3 h-3" />, component: <div className="p-4 c2-text">Settings View</div> },
  ];

  const addTabToPanel = (panelId: string, tabType: string) => {
    const tabTemplate = availableTabTypes.find(t => t.type === tabType);
    if (!tabTemplate) return;

    const newTab: PanelTab = {
      id: `${tabType}-${Date.now()}`,
      name: tabTemplate.name,
      icon: tabTemplate.icon,
      component: tabTemplate.component,
      type: tabType as any,
    };

    setPanels(panels.map(panel => {
      if (panel.id === panelId) {
        return {
          ...panel,
          tabs: [...panel.tabs, newTab],
          activeTabId: newTab.id,
        };
      }
      return panel;
    }));
  };

  const removeTabFromPanel = (panelId: string, tabId: string) => {
    setPanels(panels.map(panel => {
      if (panel.id === panelId) {
        const newTabs = panel.tabs.filter(tab => tab.id !== tabId);
        if (newTabs.length === 0) {
          // If no tabs left, remove the panel
          return null;
        }
        let newActiveTabId = panel.activeTabId;
        if (panel.activeTabId === tabId && newTabs.length > 0) {
          newActiveTabId = newTabs[0].id;
        }
        return {
          ...panel,
          tabs: newTabs,
          activeTabId: newActiveTabId,
        };
      }
      return panel;
    }).filter(Boolean) as ActivePanel[]);
  };

  const setActiveTab = (panelId: string, tabId: string) => {
    setPanels(panels.map(panel => {
      if (panel.id === panelId) {
        return { ...panel, activeTabId: tabId };
      }
      return panel;
    }));
  };

  const addNewPanel = () => {
    const timestamp = Date.now();
    const tabId = `console-${timestamp}`;
    const newPanel: ActivePanel = {
      id: `panel-${timestamp}`,
      tabs: [
        {
          id: tabId,
          name: "Console",
          icon: <Terminal className="w-3 h-3" />,
          component: <CommandInterface />,
          type: "console",
        },
      ],
      activeTabId: tabId,
    };
    setPanels([...panels, newPanel]);
  };

  const renderPanel = (panel: ActivePanel) => {
    const activeTab = panel.tabs.find(tab => tab.id === panel.activeTabId);

    return (
      <div key={panel.id} className="flex flex-col h-full c2-bg-panel">
        {/* Tab Bar for this panel */}
        <div className="c2-bg-panel c2-border border-b flex items-center min-h-[40px]">
          <div className="flex flex-1 overflow-x-auto">
            {panel.tabs.map((tab) => (
              <div
                key={tab.id}
                className={`c2-border border-r px-3 py-2 text-sm flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                  tab.id === panel.activeTabId
                    ? "c2-bg-dark c2-text-accent" 
                    : "hover:c2-bg-dark c2-text"
                }`}
                onClick={() => setActiveTab(panel.id, tab.id)}
              >
                <span className={tab.id === panel.activeTabId ? "c2-text-accent" : "c2-text-info"}>
                  {tab.icon}
                </span>
                <span>{tab.name}</span>
                {panel.tabs.length > 1 && (
                  <button
                    className="ml-1 c2-text-dim hover:c2-text-error"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTabFromPanel(panel.id, tab.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Add tab dropdown */}
          <div className="relative group">
            <button className="px-2 py-2 c2-text-dim hover:c2-text-accent">
              <Terminal className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full hidden group-hover:block c2-bg-panel c2-border border rounded shadow-lg z-20 min-w-32">
              {availableTabTypes.map((tabType) => (
                <button
                  key={tabType.type}
                  className="w-full px-3 py-2 text-left text-xs hover:c2-bg-dark c2-text flex items-center space-x-2"
                  onClick={() => addTabToPanel(panel.id, tabType.type)}
                >
                  {tabType.icon}
                  <span>{tabType.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active tab content */}
        <div className="flex-1 overflow-hidden">
          {activeTab?.component}
        </div>
      </div>
    );
  };

  if (panels.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center c2-bg-dark">
        <button
          onClick={addNewPanel}
          className="px-4 py-2 c2-bg-panel c2-border border rounded c2-text hover:c2-text-accent"
        >
          Add Panel
        </button>
      </div>
    );
  }

  if (panels.length === 1) {
    return (
      <div className="flex-1 flex flex-col">
        {renderPanel(panels[0])}
      </div>
    );
  }

  return (
    <div className="flex-1">
      <PanelGroup direction="horizontal">
        {panels.map((panel, index) => (
          <div key={panel.id}>
            <Panel defaultSize={100 / panels.length} minSize={20}>
              {renderPanel(panel)}
            </Panel>
            {index < panels.length - 1 && (
              <PanelResizeHandle className="w-2 c2-bg-dark hover:bg-gray-600 relative group cursor-col-resize">
                <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-gray-700 group-hover:bg-gray-500 flex items-center justify-center">
                  <Grip className="w-3 h-3 c2-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </PanelResizeHandle>
            )}
          </div>
        ))}
      </PanelGroup>
      
      {/* Add new panel button */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={addNewPanel}
          className="px-3 py-2 c2-bg-panel c2-border border rounded c2-text-dim hover:c2-text-accent shadow-lg"
          title="Add new panel"
        >
          <Terminal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
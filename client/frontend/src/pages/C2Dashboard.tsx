import React, { useRef, useEffect } from 'react';
import { EventsOn } from '../../wailsjs/runtime/runtime';
import MenuBar from "@/components/MenuBar";
import { Model, Actions, TabNode, IJsonModel, Layout, DockLocation, TabSetNode, BorderNode, ITabSetRenderValues, ITabRenderValues } from 'flexlayout-react';
import Sessions from '@/components/Sessions';
import NetworkMap from '@/components/NetworkMap';
import Listeners from '@/components/listeners/Listeners';
import AIChatbot from '@/components/AIChatbot';
import Logs from '@/components/Logs';
import Session from '@/components/Session';
import 'flexlayout-react/style/dark.css';
import ShortcutsBar from '@/components/menu/ShortcutsBar';
import { Headphones, Network, Users, Bot, X, Maximize2, Minimize2, ChevronDown, HatGlasses, FileText, Plus, Terminal } from "lucide-react"

const jsonModel: IJsonModel = {
  global: {
    tabEnablePopout: true,
    rootOrientationVertical: true,
    tabSetEnableTabStrip: true,
  },
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'row',
        weight: 50,
        children: [
          {
            type: 'tabset',
            weight: 60,
            children: [
              {
                type: 'tab',
                name: 'Listeners',
                component: 'listeners',
              },
            ],
          },
          {
            type: 'tabset',
            weight: 40,
            children: [
              {
                type: 'tab',
                name: 'Logs',
                component: 'logs',
              },
            ],
          },
        ],
      },
      {
        type: 'tabset',
        id: 'bottomTabset', // ID for the main panel
        weight: 50,
        enableDeleteWhenEmpty: false,
        children: [
          {
            type: 'tab',
            name: 'Sessions',
            component: 'sessions',
          },
        ],
      },
    ],
  },
};
export default function C2Dashboard() {

  const model = useRef(Model.fromJson(jsonModel));
  const [activeComponents, setActiveComponents] = React.useState<string[]>([]);

  const updateActiveComponents = (currentModel: Model) => {
    const active: string[] = [];
    currentModel.visitNodes((node) => {
      if (node.getType() === 'tab') {
        const component = (node as TabNode).getComponent();
        if (component) {
          active.push(component);
        }
      }
    });
    // Only update if changed to avoid infinite loops if onModelChange triggers re-render
    setActiveComponents(prev => {
      if (JSON.stringify(prev.sort()) === JSON.stringify(active.sort())) {
        return prev;
      }
      return active;
    });
  };

  React.useEffect(() => {
    updateActiveComponents(model.current);
  }, []);

  // The factory function is responsible for rendering the correct component for a given tab node
  const factory = (node: TabNode) => {
    const component = node.getComponent();
    switch (component) {
      case 'sessions':
        return <Sessions onOpenSession={(id: string) => onAddView('session', `Session ${id}`, 'bottomTabset', { sessionId: id })} />;
      case 'listeners':
        return <Listeners onAddView={onAddView} />;
      case 'networkMap':
        return <NetworkMap onAddView={onAddView} />;
      case 'chatbot':
        return <AIChatbot />;
      case 'logs':
        return <Logs />;
      case 'session':
        // Extract session ID from node config if available
        const config = node.getConfig();
        return <Session sessionId={config?.sessionId} />;
      default:
        return null;
    }
  };

  const onRenderTab = (node: TabNode, renderValues: ITabRenderValues) => {
    const component = node.getComponent();
    let Icon = null;

    switch (component) {
      case 'sessions':
        Icon = HatGlasses;
        break;
      case 'listeners':
        Icon = Headphones;
        break;
      case 'networkMap':
        Icon = Network;
        break;
      case 'chatbot':
        Icon = Bot;
      case 'session':
        Icon = Terminal;
        break;
        break;
      case 'logs':
        Icon = FileText;
        break;
    }

    if (Icon) {
      renderValues.content = (
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span>{node.getName()}</span>
        </div>
      );
    }
  };

  const onRenderTabSet = (node: TabSetNode | BorderNode, renderValues: ITabSetRenderValues) => {
    // Modify the buttons of the flexlayout here
    if (node.getType() === 'tabset') {
      renderValues.buttons.forEach((button: any) => {
        switch (button.name) {
          case 'maximize':
            button.element = <Maximize2 className="w-3 h-3" />;
            break;
          case 'restore':
            button.element = <Minimize2 className="w-3 h-3" />;
            break;
          case 'close':
            button.element = <X className="w-3 h-3" />;
            break;
          case 'popout':
            // button.element = <ExternalLink className="w-3 h-3" />;
            break;
        }
      });
    }
  };

  // This function handles adding a new tab dynamically
  const onAddView = (componentName: string, componentTitle: string, targetTabsetId: string, config?: any) => {
    let existingNodeId: string | null = null;

    // For sessions, we want to allow multiple tabs if they have different session IDs
    if (componentName !== 'session') {
      model.current.visitNodes((node) => {
        if (node.getType() === 'tab' && (node as TabNode).getComponent() === componentName) {
          existingNodeId = node.getId();
        }
      });
    } else if (config?.sessionId) {
       model.current.visitNodes((node) => {
        if (node.getType() === 'tab' && (node as TabNode).getComponent() === componentName) {
           const nodeConfig = (node as TabNode).getConfig();
           if (nodeConfig?.sessionId === config.sessionId) {
             existingNodeId = node.getId();
           }
        }
      });
    }

    if (existingNodeId) {
      model.current.doAction(Actions.selectTab(existingNodeId));
      return;
    }

    const location = componentName === 'chatbot' ? DockLocation.RIGHT : DockLocation.CENTER;

    try {
      model.current.doAction(
        Actions.addNode(
          {
            type: 'tab',
            name: componentTitle,
            component: componentName,
            config: config,
          },
          targetTabsetId, // The ID of the tabset to add the new tab to
          location, // Where to add it in the tabset
          -1, // The index
          true
        )
      );
    } catch (e) {
      console.error("Failed to add node:", e);
      // Fallback: try adding to active tabset or root if specific target fails
      try {
        model.current.doAction(
          Actions.addNode(
            {
              type: 'tab',
              name: componentTitle,
              component: componentName,            config: config,            },
            "bottomTabset", 
            location,
            -1,
            true
          )
        );
      } catch (e2) {
         console.error("Fallback failed:", e2);
      }
    }
  };

  useEffect(() => {
    const handleNavigate = (data: string) => {
      try {
        console.log("Navigating to:", data);
        let navData;
        try {
          navData = JSON.parse(data);
        } catch {
          // If not JSON, assume string is component name
          navData = { component: data };
        }

        if (typeof navData === 'string') {
            navData = { component: navData };
        }

        const componentName = navData.component || navData.view;
        // Map common names if needed, or rely on caller sending correct component IDs
        // Default title to component name capitalized if not provided
        if (!componentName) {
            console.error("Invalid navigation data: missing component or view property", navData);
            return;
        }

        const title = navData.title || (componentName.charAt(0).toUpperCase() + componentName.slice(1));
        const target = navData.target || 'bottomTabset';
        const config = navData.config;

        onAddView(componentName, title, target, config);
      } catch (e) {
        console.error("Error processing navigation event:", e);
      }
    };

    if ((window as any).runtime) {
      const unsubscribe = EventsOn("ui:navigate", handleNavigate);
      return () => unsubscribe();
    }
  }, []); // Empty dependency array means this runs once on mount


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <MenuBar onAddView={onAddView} />
      <ShortcutsBar onAddView={onAddView} activeComponents={activeComponents} />
      <div className="flex-1 flex overflow-hidden relative">
        <Layout
          model={model.current}
          factory={factory}
          onRenderTab={onRenderTab}
          onRenderTabSet={onRenderTabSet}
          onModelChange={updateActiveComponents}
        />
      </div>
    </div>
  );
}

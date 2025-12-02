import React, { useRef } from 'react';
import MenuBar from "@/components/MenuBar";
import { Model, Actions, TabNode, IJsonModel, Layout, DockLocation, TabSetNode, BorderNode, ITabSetRenderValues, ITabRenderValues } from 'flexlayout-react';
import Sessions from '@/components/Sessions';
import NetworkMap from '@/components/NetworkMap';
import Listeners from '@/components/listeners/Listeners';
import NewListener from '@/components/listeners/NewListener';
import AIChatbot from '@/components/AIChatbot';
import Logs from '@/components/Logs';
import 'flexlayout-react/style/dark.css';
import ShortcutsBar from '@/components/menu/ShortcutsBar';
import { Headphones, Network, Users, Bot, X, Maximize2, Minimize2, ChevronDown, HatGlasses, FileText, Plus } from "lucide-react"

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
        return <Sessions />;
      case 'listeners':
        return <Listeners onAddView={onAddView} />;
      case 'networkMap':
        return <NetworkMap onAddView={onAddView} />;
      case 'chatbot':
        return <AIChatbot />;
      case 'logs':
        return <Logs />;
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
  const onAddView = (componentName: string, componentTitle: string, targetTabsetId: string) => {
    let existingNodeId: string | null = null;

    model.current.visitNodes((node) => {
      if (node.getType() === 'tab' && (node as TabNode).getComponent() === componentName) {
        existingNodeId = node.getId();
      }
    });

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
              component: componentName,
            },
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

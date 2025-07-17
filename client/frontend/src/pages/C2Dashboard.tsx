import React, { useRef } from 'react';
import MenuBar from "@/components/MenuBar";
import { Model, Actions, TabNode, IJsonModel, Layout, DockLocation } from 'flexlayout-react';
import Clients from '@/components/Clients';
import NetworkMap from '@/components/NetworkMap';
import Listeners from '@/components/listeners/Listeners';
import 'flexlayout-react/style/light.css';

const jsonModel: IJsonModel = {
  global: {
    tabEnablePopout: true,
    rootOrientationVertical: true,
  },
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        id: 'topTabset', // ID for the left panel
        weight: 50,
        children: [
          {
            type: 'tab',
            name: 'Clients',
            component: 'clients',
          },
        ],
      },
      {
        type: 'tabset',
        id: 'bottomTabset', // ID for the main panel
        weight: 50,
        children: [
          {
            type: 'tab',
            name: 'Listeners',
            component: 'listeners',
          },
        ],
      },
    ],
  },
};
export default function C2Dashboard() {

  const model = useRef(Model.fromJson(jsonModel));

  // The factory function is responsible for rendering the correct component for a given tab node
  const factory = (node: TabNode) => {
    const component = node.getComponent();
    switch (component) {
      case 'clients':
        return <Clients />;
      case 'listeners':
        return <Listeners />;
      case 'networkMap':
        return <NetworkMap />;
      default:
        return null;
    }
  };

  // This function handles adding a new tab dynamically
  const onAddView = (componentName: string, componentTitle: string, targetTabsetId: string) => {
    model.current.doAction(
      Actions.addNode(
        {
          type: 'tab',
          name: componentTitle,
          component: componentName,
        },
        targetTabsetId, // The ID of the tabset to add the new tab to
        DockLocation.CENTER, // Where to add it in the tabset
        -1, // The index
        true
      )
    );
  };

  return (
    <div className="flex flex-col h-screen c2-bg-dark c2-text">
      <MenuBar onAddView={onAddView} />
      <div className="flex-1 flex overflow-hidden relative">
        <Layout
          model={model.current}
          factory={factory}
        />
      </div>
    </div>
  );
}

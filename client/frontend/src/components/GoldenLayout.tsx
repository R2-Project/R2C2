import React, { useLayoutEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { createRoot } from 'react-dom/client';
import { GoldenLayout, ComponentContainer, LayoutConfig, Stack } from 'golden-layout';
import 'golden-layout/dist/css/goldenlayout-base.css';
import 'golden-layout/dist/css/themes/goldenlayout-dark-theme.css';

// Import the components
import Clients from './Clients';
import FileExplorer from './FileExplorer';
import CommandInterface from './CommandInterface';
import NetworkMap from './NetworkMap';

export interface GoldenLayoutRef {
  addComponent: (componentType: string, title: string) => void;
}

const GoldenLayoutComponent = forwardRef<GoldenLayoutRef, {}>((props, ref) => {
  const layoutRef = useRef<HTMLDivElement>(null);
  const glInstance = useRef<GoldenLayout | null>(null);

  useImperativeHandle(ref, () => ({
    addComponent(componentType: string, title: string) {
      const gl = glInstance.current;
      if (!gl) return;
      const targetId = "bottomStack"

      // const targetItem = gl.findFirstComponentItemById(targetId);
      // Add the component to the first content item (usually a stack)
      gl.rootItem?.contentItems.forEach((item) => {
        if (item instanceof Stack && item.id === targetId) {
          item.addItem({ type: 'component', componentType, title });
        }
      })
    }
  }));

  useLayoutEffect(() => {
    if (layoutRef.current && !glInstance.current) {
      // 1. Create a GoldenLayout instance
      const gl = new GoldenLayout(layoutRef.current);
      glInstance.current = gl;

      // 2. Create a typed factory function for React components
      const createReactComponent = (container: ComponentContainer, Component: React.FC) => {
        const root = createRoot(container.element);
        root.render(<Component />);
        container.on('destroy', () => root.unmount());
      };

      // 3. Register your TSX components
      gl.registerComponent('clients', (container: ComponentContainer) => {
        createReactComponent(container, Clients);
      });
      gl.registerComponent('commandInterface', (container: ComponentContainer) => {
        createReactComponent(container, CommandInterface);
      });
      gl.registerComponent('fileExplorer', (container: ComponentContainer) => {
        createReactComponent(container, FileExplorer);
      });
      gl.registerComponent('networkMap', (container: ComponentContainer) => {
        createReactComponent(container, NetworkMap);
      });

      // 4. Define the initial layout configuration
      const layoutConfig: LayoutConfig = {
        settings: {
          popoutWholeStack: false,
          showPopoutIcon: false,
        },
        root: {
          type: 'column',
          content: [
            {
              type: 'component',
              componentType: 'clients',
              title: 'Clients',
              height: 20,
            },
            {
              type: 'stack',
              id: 'bottomStack',
              content: [
                {
                  type: 'component',
                  componentType: 'commandInterface',
                  title: 'Commands',
                  height: 100,
                },
              ],
            },
          ],
        },
      };

      // 5. Load the layout
      gl.loadLayout(layoutConfig);

      const handleResize = () => gl.updateSize();
      window.addEventListener('resize', handleResize);

      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        gl.destroy();
        glInstance.current = null;
      };
    }
  }, []); // Empty dependency array ensures this runs only once

  return <div ref={layoutRef} style={{ width: '100vw', height: '100vh' }} />;
});

export default GoldenLayoutComponent;

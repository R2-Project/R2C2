import React, { useLayoutEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoldenLayout, ComponentContainer, LayoutConfig } from 'golden-layout';
import 'golden-layout/dist/css/goldenlayout-base.css';
import 'golden-layout/dist/css/themes/goldenlayout-dark-theme.css';

// Import the components
import Clients from './Clients';
import FileExplorer from './FileExplorer';
import CommandInterface from './CommandInterface';

const GoldenLayoutComponent: React.FC = () => {
  const layoutRef = useRef<HTMLDivElement>(null);
  const glInstance = useRef<GoldenLayout | null>(null);

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
      gl.registerComponent('clients', (container) => {
        createReactComponent(container, Clients);
      });

      gl.registerComponent('fileExplorer', (container) => {
        createReactComponent(container, FileExplorer);
      });

      gl.registerComponent('commandInterface', (container) => {
        createReactComponent(container, CommandInterface);
      });

      // 4. Define the initial layout configuration
      const layoutConfig: LayoutConfig = {
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
              content: [
                {
                  type: 'component',
                  componentType: 'fileExplorer',
                  title: 'File Explorer',
                  height: 100,
                },
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
};

export default GoldenLayoutComponent;

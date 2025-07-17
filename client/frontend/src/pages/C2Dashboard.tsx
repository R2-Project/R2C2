import React, { useRef } from 'react';
import MenuBar from "@/components/MenuBar";
import GoldenLayoutComponent, { GoldenLayoutRef } from '@/components/GoldenLayout';

export default function C2Dashboard() {
  const layoutRef = useRef<GoldenLayoutRef>(null);

  // This function will be called by the TopMenu
  const handleAddView = (componentType: string, title: string) => {
    // Call the addComponent method exposed by the child component
    layoutRef.current?.addComponent(componentType, title);
  };

  return (
    <div className="flex flex-col h-screen c2-bg-dark c2-text">
      <MenuBar onAddView={handleAddView} />
      <div className="flex-1 flex overflow-hidden">
        <GoldenLayoutComponent ref={layoutRef} />
      </div>
    </div>
  );
}

import MenuBar from "@/components/MenuBar";
import TabBar from "@/components/TabBar";
import FileExplorer from "@/components/FileExplorer";
import CommandInterface from "@/components/CommandInterface";
import NetworkMap from "@/components/NetworkMap";
import StatusBar from "@/components/StatusBar";
import Clients from "@/components/Clients";
import { Panel, PanelGroup} from "react-resizable-panels";
import Divider from "@/components/Divider";
import GoldenLayout from 'golden-layout'

export default function C2Dashboard() {


  var myLayout = new GoldenLayout({
    content: [{
        type: 'row',
        content:[{
            type:'react-component',
            component: 'test-component',
            props: { label: 'A' }
        },{
            type: 'column',
            content:[{
                type:'react-component',
                component: 'test-component',
                props: { label: 'B' }
            },{
                type:'react-component',
                component: 'test-component',
                props: { label: 'C' }
            }]
        }]
    }]
})

  return (
    <div className="flex flex-col h-screen c2-bg-dark c2-text">
      <MenuBar />

      {/*
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="vertical">
          <Panel defaultSize={30} minSize={20}>
            <Clients />
          </Panel>
          <Divider />
          <Panel minSize={30}>
            <div className="flex-1 flex flex-col">
              <TabBar/>
              <CommandInterface />
            </div>
          </Panel>
        </PanelGroup>
      </div>
      */}
    </div>
  );
}

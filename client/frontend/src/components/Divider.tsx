
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Minus } from "lucide-react"


export default function Divider() {
  return (
    <PanelResizeHandle className="h-4 c2-bg-darker flex justify-center">
      <Minus className="text-white h-4" />
    </PanelResizeHandle>
  );
}


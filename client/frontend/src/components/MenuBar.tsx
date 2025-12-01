import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import NewSession from '@/components/menu/NewSession'
import { useTheme } from "@/components/theme-provider"

interface TopMenuProps {
  onAddView: (componentType: string, title: string) => void;
}

export default function MenuBar({ onAddView }: { onAddView: (componentName: string, componentTitle: string, targetTabsetId: string) => void }) {
  const [connectionStatus, setConnectionStatus] = useState("Connected");
  const [activeSessions, setActiveSessions] = useState(3);
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const { setTheme } = useTheme()

  return (
    <>
      <div className="c2-bg-panel c2-border border-b h-8 flex items-center px-2 text-xs">
        <div className="flex space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 hover:c2-bg-dark rounded outline-none">
              R2C2
            </DropdownMenuTrigger>
            <DropdownMenuContent className="c2-bg-panel c2-border border min-w-32">
              <DropdownMenuItem className="hover:c2-bg-dark focus:c2-bg-dark hover:text-white" onClick={() => setNewSessionDialogOpen(true)}>
                New Session
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:c2-bg-dark focus:c2-bg-dark">
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator className="c2-border" />
              <DropdownMenuItem className="hover:c2-bg-dark focus:c2-bg-dark">
                Exit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 hover:c2-bg-dark rounded outline-none">
              View
            </DropdownMenuTrigger>
            <DropdownMenuContent className="c2-bg-panel c2-border border min-w-32">
              <DropdownMenuCheckboxItem className="hover:c2-bg-dark focus:c2-bg-dark focus:text-white">
                Clients
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem onClick={() => onAddView('networkMap', 'NetworkMap', 'topTabset')} className="hover:c2-bg-dark focus:c2-bg-dark focus:text-white">
                Network Map
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem className="hover:c2-bg-dark focus:c2-bg-dark focus:text-white" onClick={() => onAddView('listeners', 'Listeners', 'bottomTabset')}>
                Listeners
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 hover:c2-bg-dark rounded outline-none">
              Theme
            </DropdownMenuTrigger>
            <DropdownMenuContent className="c2-bg-panel c2-border border min-w-32">
              <DropdownMenuItem onClick={() => setTheme("dracula")} className="hover:c2-bg-dark focus:c2-bg-dark">
                Dracula
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 hover:c2-bg-dark rounded outline-none">
              Tools
            </DropdownMenuTrigger>
            <DropdownMenuContent className="c2-bg-panel c2-border border min-w-32">
              <DropdownMenuItem className="hover:c2-bg-dark focus:c2-bg-dark">
                Payload Generator
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:c2-bg-dark focus:c2-bg-dark">
                Pivoting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 hover:c2-bg-dark rounded outline-none">
              Help
            </DropdownMenuTrigger>
            <DropdownMenuContent className="c2-bg-panel c2-border border min-w-32">
              <DropdownMenuItem className="hover:c2-bg-dark focus:c2-bg-dark">
                Documentation
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:c2-bg-dark focus:c2-bg-dark">
                About
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="c2-text-dim">{connectionStatus}</span>
          </span>
          <span className="c2-text-dim">192.168.1.2</span>
        </div>
      </div>

      <NewSession open={newSessionDialogOpen} onOpenChange={setNewSessionDialogOpen} />
    </>
  );
}

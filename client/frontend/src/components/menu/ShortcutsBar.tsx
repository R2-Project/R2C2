import React, { useState } from "react"
import { Headphones, FileText, HatGlasses, Network, ListTodo, Route, Gem } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import R2C2Icon from '@/assets/images/r2c2-4.png'

export type ShortcutItem = {
  id: string
  label: string
  onClick?: () => void
  href?: string
  // optional badge number (e.g. unread count)
  badge?: number
  icon?: React.ReactNode
  component?: string
  disabled?: boolean
}

type Props = {
  items?: ShortcutItem[]
  className?: string
  onAddView?: (componentName: string, componentTitle: string, targetTabsetId: string) => void
  activeComponents?: string[]
}

export default function ShortcutsBar({ items, className, onAddView, activeComponents = [] }: Props) {
  const defaults: ShortcutItem[] = [
    {
      id: "listeners",
      label: "Listeners",
      icon: <Headphones />,
      component: "listeners",
      onClick: () => {
        console.log("Listeners clicked, calling onAddView");
        if (onAddView) {
          onAddView('listeners', 'Listeners', 'bottomTabset');
        } else {
          console.error("onAddView is undefined");
        }
      },
    },
    {
      id: "logs",
      label: "Logs",
      icon: <FileText />,
      component: "logs",
      onClick: () => onAddView?.('logs', 'Logs', 'bottomTabset'),
    },
    {
      id: "sessions",
      label: "Sessions",
      icon: <HatGlasses />,
      component: "sessions",
      onClick: () => onAddView?.('sessions', 'Sessions', 'bottomTabset'),
    },
    {
      id: "sessions-graph",
      label: "Sessions Graph",
      icon: <Network />,
      component: "networkMap",
      onClick: () => onAddView?.('networkMap', 'Network Map', 'bottomTabset'),
    },
    {
      id: "loot",
      label: "Loot",
      icon: <Gem />,
      disabled: true,
    },
  ]

  const list = items ?? defaults

  return (
    <>
      <nav
        role="navigation"
        aria-label="Shortcuts"
        className={`c2-bg-panel c2-border border-b w-full ${className ?? ""}`}
      >
        <div className="w-full px-3 py-2 flex gap-2 items-center">
          <div className="flex gap-1">
            <TooltipProvider>
              {list.map((it) => {
                const isActive = it.component && activeComponents.includes(it.component);
                const trigger = (
                  <button
                    disabled={it.disabled}
                    aria-label={it.label}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-md transition ${
                      isActive 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "text-slate-200 dark:text-slate-200 hover:bg-slate-900 dark:hover:bg-slate-800"
                    } ${it.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    type="button"
                  >
                    <span className="pointer-events-none">{it.icon}</span>
                    {typeof it.badge === "number" && it.badge > 0 && (
                      <span className="absolute -top-1 -right-1 text-xs bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        {it.badge > 99 ? "99+" : it.badge}
                      </span>
                    )}
                  </button>
                )

                const tooltip = (
                  <Tooltip>
                    <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                    <TooltipContent>
                      <p>{it.label}</p>
                    </TooltipContent>
                  </Tooltip>
                )

                if (it.href) {
                  return (
                    <a key={it.id} href={it.href} className="inline-block">
                      {tooltip}
                    </a>
                  )
                }
                return <React.Fragment key={it.id}>{tooltip}</React.Fragment>
              })}
            </TooltipProvider>
          </div>
          <div className="ml-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onAddView?.('chatbot', 'R2C2', 'bottomTabset')}
                    aria-label="R2C2 Chatbot"
                    className={`relative flex items-center justify-center w-24 h-24 -my-2 transition-transform duration-200 mr-4 z-10 ${
                      activeComponents.includes('chatbot') 
                        ? "scale-110 drop-shadow-lg" 
                        : "hover:scale-110"
                    }`}
                    type="button"
                  >
                    <img
                      src={R2C2Icon}
                      alt="R2C2"
                      className="w-full h-full object-contain"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>R2C2 Chatbot</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </nav>
    </>
  )
}
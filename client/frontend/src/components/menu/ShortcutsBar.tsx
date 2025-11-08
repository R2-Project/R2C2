import React, { useState } from "react"
import { Headphones } from "lucide-react"
import NewListener from "@/components/listeners/NewListener"

export type ShortcutItem = {
  id: string
  label: string
  onClick?: () => void
  href?: string
  // optional badge number (e.g. unread count)
  badge?: number
  icon?: React.ReactNode
}

type Props = {
  items?: ShortcutItem[]
  className?: string
}

export default function ShortcutsBar({ items, className }: Props) {
  const [newListenerOpen, setNewListenerOpen] = useState(false)

  const defaults: ShortcutItem[] = [
    {
      id: "listeners",
      label: "Listeners",
      icon: <Headphones />,
      onClick: () => setNewListenerOpen(true),
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
        <div className="max-w-screen-xl mx-auto px-3 py-2 flex gap-2 items-center">
          <div className="flex gap-1">
            {list.map((it) => {
              const content = (
                <button
                  key={it.id}
                  onClick={it.onClick}
                  title={it.label}
                  aria-label={it.label}
                  className="relative flex items-center justify-center w-10 h-10 rounded-md text-slate-200 dark:text-slate-200 hover:bg-slate-900 dark:hover:bg-slate-800 transition"
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

              if (it.href) {
                return (
                  <a key={it.id} href={it.href} className="inline-block">
                    {content}
                  </a>
                )
              }
              return content
            })}
          </div>
          {/* right-side quick actions placeholder (optional) */}
          <div className="ml-auto text-sm text-slate-500 dark:text-slate-400">Shortcuts</div>
        </div>
      </nav>

      <NewListener open={newListenerOpen} onOpenChange={setNewListenerOpen} />
    </>
  )
}
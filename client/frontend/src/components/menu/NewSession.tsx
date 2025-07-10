import { useState } from "react"
import { MoreHorizontal, Settings, Eye, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function NewSession(){

  const [isDialogOpen, setIsDialogOpen] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  const [enableNotifications, setEnableNotifications] = useState(false)

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Session Config</DialogTitle>
          <DialogDescription>
            Set the server settings
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Current Settings</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Preview: {showPreview ? "Enabled" : "Disabled"}</p>
              <p>Notifications: {enableNotifications ? "Enabled" : "Disabled"}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


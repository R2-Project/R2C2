import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormLabel, FormItem, FormMessage, FormControl  } from '@/components/ui/form'

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function NewSession({open, onOpenChange}: Props){
  
  const [showPreview, setShowPreview] = useState(true)
  const [enableNotifications, setEnableNotifications] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Session Config</DialogTitle>
          <DialogDescription>
            Set the server settings
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
          <Form>
            <FormItem className="FormField">
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <FormLabel className="FormLabel">Email</FormLabel>
                <FormMessage className="FormMessage">
                  Please enter your email
                </FormMessage>
                <FormMessage className="FormMessage">
                  Please provide a valid email
                </FormMessage>
              </div>
            </FormItem>
          </Form>

          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


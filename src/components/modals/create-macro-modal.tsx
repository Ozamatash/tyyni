import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface CreateMacroModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateMacro: (macroData: any) => void
}

export function CreateMacroModal({ isOpen, onClose, onCreateMacro }: CreateMacroModalProps) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  const handleCreateMacro = () => {
    onCreateMacro({ title, body })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Macro</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="title"
              className="col-span-4"
              placeholder="Macro Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Textarea
              id="body"
              className="col-span-4"
              placeholder="Macro Content"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateMacro}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


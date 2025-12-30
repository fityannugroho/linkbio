import { ChevronLeftIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { socialItems } from "@/constants/social";
import type { SocialPlatform } from "@/lib/validation";

type SocialEditDialogProps = {
  editingKey: SocialPlatform | null;
  socialEditUrl: string;
  socialEditError: string;
  isSaving?: boolean;
  onClose: () => void;
  onSave: () => void;
  onRemove: () => void;
  onUrlChange: (value: string) => void;
};

export function SocialEditDialog({
  editingKey,
  socialEditUrl,
  socialEditError,
  isSaving,
  onClose,
  onSave,
  onRemove,
  onUrlChange,
}: SocialEditDialogProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (editingKey) {
      setIsConfirmingDelete(false);
    }
  }, [editingKey]);

  if (!editingKey) return null;

  const item = socialItems.find((entry) => entry.key === editingKey);
  if (!item) return null;

  const inputLabel =
    item.inputType === "username"
      ? "Username"
      : item.inputType === "url"
        ? "URL"
        : "Username or URL";

  function handleClose() {
    setIsConfirmingDelete(false);
    onClose();
  }

  return (
    <Dialog
      open={Boolean(editingKey)}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
    >
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-center relative">
          {isConfirmingDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 absolute left-4"
              onClick={() => setIsConfirmingDelete(false)}
            >
              <ChevronLeftIcon size={18} />
            </Button>
          )}
          <DialogTitle className="text-center">
            {isConfirmingDelete
              ? `Remove ${item.label} icon?`
              : `Edit ${item.label}`}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-6">
          {isConfirmingDelete ? (
            <div className="space-y-3 pb-2">
              <Button
                variant="destructive"
                className="w-full h-12 rounded-full font-semibold"
                onClick={onRemove}
              >
                Yes, remove
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 rounded-full border-2 font-semibold"
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSave();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  {inputLabel}
                </Label>
                <Input
                  placeholder={item.placeholder}
                  value={socialEditUrl}
                  onChange={(e) => onUrlChange(e.target.value)}
                  className="h-11"
                  autoFocus
                />
                {socialEditError && (
                  <p className="text-xs text-destructive mt-1 font-medium">
                    {socialEditError}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-full font-semibold"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-12 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 font-semibold gap-2"
                  onClick={() => setIsConfirmingDelete(true)}
                >
                  <Trash2Icon size={16} />
                  Remove icon
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

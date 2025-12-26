import { Trash2 } from "lucide-react";
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
  onClose: () => void;
  onSave: () => void;
  onRemove: () => void;
  onUrlChange: (value: string) => void;
};

export function SocialEditDialog({
  editingKey,
  socialEditUrl,
  socialEditError,
  onClose,
  onSave,
  onRemove,
  onUrlChange,
}: SocialEditDialogProps) {
  if (!editingKey) return null;

  const item = socialItems.find((entry) => entry.key === editingKey);
  if (!item) return null;

  const inputLabel =
    item.inputType === "username"
      ? "Username"
      : item.inputType === "url"
        ? "URL"
        : "Username or URL";

  return (
    <Dialog
      open={Boolean(editingKey)}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {item.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label>{inputLabel}</Label>
          <Input
            placeholder={item.placeholder}
            value={socialEditUrl}
            onChange={(e) => onUrlChange(e.target.value)}
          />
          {socialEditError && (
            <p className="text-xs text-destructive">{socialEditError}</p>
          )}
        </div>
        <div className="space-y-2">
          <Button className="w-full" onClick={onSave}>
            Save
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            onClick={onRemove}
          >
            <Trash2 size={16} />
            Remove icon
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

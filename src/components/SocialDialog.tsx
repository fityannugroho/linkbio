import { Edit, GripVertical } from "lucide-react";
import type { DragEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { SocialEditDialog } from "@/components/SocialEditDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { socialItems } from "@/constants/social";
import { useSocialForm } from "@/hooks/useSocialForm";
import type { SocialPlatform } from "@/lib/validation";
import {
  reorderSocialsAction,
  updateSocialsAction,
} from "@/server/dashboard/profile";
import type { ProfileWithDetails } from "@/types/profile";

type SocialDialogProps = {
  open: boolean;
  profile: ProfileWithDetails | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function SocialDialog({
  open,
  profile,
  onClose,
  onSuccess,
}: SocialDialogProps) {
  const [editingKey, setEditingKey] = useState<SocialPlatform | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [draggedKey, setDraggedKey] = useState<SocialPlatform | null>(null);

  // Initialize ordered keys from profile if available
  function getInitialOrder() {
    if (!profile?.socials || profile.socials.length === 0) {
      return socialItems.map((item) => item.key);
    }

    // Sort socials by order and extract platforms
    const sortedSocials = [...profile.socials].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const existingPlatforms = sortedSocials.map((s) => s.platform);

    // Add any missing platforms from socialItems at the end
    const allPlatforms = socialItems.map((item) => item.key);
    const missingPlatforms = allPlatforms.filter(
      (p) => !existingPlatforms.includes(p),
    );

    return [...existingPlatforms, ...missingPlatforms];
  }

  const [orderedKeys, setOrderedKeys] = useState<SocialPlatform[]>(
    getInitialOrder(),
  );

  const socialManager = useSocialForm({ profile });

  function openEditor(key: SocialPlatform) {
    const value = socialManager.socialForm[key];
    setEditingKey(key);
    setEditUrl(value?.value || "");
    setEditError("");
  }

  function closeEditor() {
    setEditingKey(null);
    setEditUrl("");
    setEditError("");
  }

  function saveEdit() {
    if (!editingKey) return;
    try {
      socialManager.updateSocialUrl(editingKey, editUrl);
      closeEditor();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Use a valid social link.",
      );
    }
  }

  function removeIcon() {
    if (!editingKey) return;
    socialManager.removeSocial(editingKey);
    closeEditor();
  }

  function handleDragStart(e: DragEvent, key: SocialPlatform) {
    setDraggedKey(key);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: DragEvent, targetKey: SocialPlatform) {
    e.preventDefault();
    if (!draggedKey || draggedKey === targetKey) return;

    const draggedIndex = orderedKeys.indexOf(draggedKey);
    const targetIndex = orderedKeys.indexOf(targetKey);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...orderedKeys];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedKey);
    setOrderedKeys(newOrder);
  }

  async function handleDragEnd() {
    if (draggedKey) {
      // Save order to backend
      const reorderData = orderedKeys.map((key, index) => ({
        platform: key,
        order: index,
      }));

      try {
        await reorderSocialsAction({ data: { socials: reorderData } });
        onSuccess(); // Refresh data
      } catch (error) {
        console.error("Failed to reorder socials:", error);
        toast.error("Failed to save order");
      }

      setDraggedKey(null);
    }
  }

  async function handleSave() {
    const { isValid, socialPayload } = socialManager.validateAndGetPayload();

    if (!isValid) {
      toast.error("Please fix invalid social links");
      return;
    }

    // Add order to payload based on current orderedKeys
    const socialsWithOrder = socialPayload.map((social) => ({
      ...social,
      order: orderedKeys.indexOf(social.platform),
    }));

    setIsSaving(true);
    await updateSocialsAction({
      data: {
        socials: socialsWithOrder,
      },
    })
      .then(() => {
        onSuccess();
        onClose();
      })
      .catch(() => {
        toast.error("Failed to save social links");
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  return (
    <>
      <Dialog
        open={open && !editingKey}
        onOpenChange={(isOpen) => !isOpen && onClose()}
      >
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Social icons</DialogTitle>
            <DialogDescription>
              Show visitors where to find you. Drag to reorder.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-3">
            {orderedKeys.map((key) => {
              const item = socialItems.find((i) => i.key === key);
              if (!item) return null;

              const value = socialManager.socialForm[item.key];
              return (
                <li
                  key={item.key}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.key)}
                  onDragOver={(e) => handleDragOver(e, item.key)}
                  onDragEnd={handleDragEnd}
                  className="space-y-1 list-none cursor-move"
                >
                  <div className="w-full flex items-center justify-between gap-3 rounded-2xl border border-border px-3 py-2 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <GripVertical
                        size={16}
                        className="text-muted-foreground shrink-0"
                      />
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-input text-foreground shrink-0">
                        <item.Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium">
                          {item.label}
                        </Label>
                        {value?.value && (
                          <p className="text-xs text-muted-foreground truncate max-w-40">
                            {value.value}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={value?.isVisible ?? true}
                        onCheckedChange={() =>
                          socialManager.toggleSocialVisibility(item.key)
                        }
                        disabled={!value?.value}
                        title={
                          value?.value
                            ? value?.isVisible
                              ? "Hide from profile"
                              : "Show on profile"
                            : "Add a link first"
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditor(item.key);
                        }}
                        title={`Edit ${item.label}`}
                      >
                        <Edit size={16} />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SocialEditDialog
        editingKey={editingKey}
        socialEditUrl={editUrl}
        socialEditError={editError}
        onClose={() => {
          closeEditor();
        }}
        onSave={() => {
          saveEdit();
        }}
        onRemove={() => {
          removeIcon();
        }}
        onUrlChange={setEditUrl}
      />
    </>
  );
}

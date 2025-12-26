import { BarChart, Edit, GripVertical, Plus } from "lucide-react";
import type { DragEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SocialAddDialog } from "@/components/SocialAddDialog";
import { SocialEditDialog } from "@/components/SocialEditDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { socialItems } from "@/constants/social";
import { useSocialForm } from "@/hooks/useSocialForm";
import type { SocialPlatform } from "@/lib/validation";
import {
  reorderSocialsAction,
  updateSocialPositionAction,
  updateSocialsAction,
} from "@/server/dashboard/profile";
import type { ProfileWithDetails } from "@/types/profile";

type SocialDialogProps = {
  open: boolean;
  profile: ProfileWithDetails | null;
  onClose: () => void;
  onSuccess: () => void;
  initialEditingKey?: SocialPlatform | null;
};

export function SocialDialog({
  open,
  profile,
  onClose,
  onSuccess,
  initialEditingKey = null,
}: SocialDialogProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<SocialPlatform | null>(
    initialEditingKey,
  );
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (open && initialEditingKey) {
      setEditingKey(initialEditingKey);
      const value = profile?.socials?.find(
        (s) => s.platform === initialEditingKey,
      );
      setEditUrl(value?.value || "");
    }
  }, [open, initialEditingKey, profile?.socials?.find]);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedKey, setDraggedKey] = useState<SocialPlatform | null>(null);

  // Get current order from profile (only added socials)
  const [orderedKeys, setOrderedKeys] = useState<SocialPlatform[]>([]);

  useEffect(() => {
    if (profile?.socials) {
      const platforms = [...profile.socials]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => s.platform);
      setOrderedKeys(platforms);
    }
  }, [profile?.socials]);

  const socialManager = useSocialForm({ profile });
  const position =
    (profile?.design?.["social_icons.position"] as "top" | "bottom") ||
    "bottom";

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

  async function saveEdit() {
    if (!editingKey) return;
    setIsSaving(true);
    try {
      const currentOrder = orderedKeys.indexOf(editingKey);
      const newOrder = currentOrder === -1 ? orderedKeys.length : currentOrder;

      await updateSocialsAction({
        data: {
          social: {
            platform: editingKey,
            value: editUrl,
            isVisible: socialManager.socialForm[editingKey].isVisible,
            order: newOrder,
          },
        },
      });
      onSuccess();
      closeEditor();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Use a valid social link.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function removeIcon(key: SocialPlatform) {
    try {
      await updateSocialsAction({
        data: {
          social: {
            platform: key,
            value: "", // Triggers delete in upsertSocials
            isVisible: false,
            order: 0,
          },
        },
      });
      onSuccess();
      closeEditor();
    } catch (_err) {
      toast.error("Failed to remove icon");
    }
  }

  async function toggleVisibility(key: SocialPlatform) {
    const currentValue = socialManager.socialForm[key];
    try {
      await updateSocialsAction({
        data: {
          social: {
            platform: key,
            value: currentValue.value,
            isVisible: !currentValue.isVisible,
            order: orderedKeys.indexOf(key),
          },
        },
      });
      onSuccess();
    } catch (_err) {
      toast.error("Failed to update visibility");
    }
  }

  async function handlePositionChange(val: "top" | "bottom") {
    try {
      await updateSocialPositionAction({ data: { position: val } });
      onSuccess();
    } catch (_err) {
      toast.error("Failed to update position");
    }
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
      const reorderData = orderedKeys.map((key, index) => ({
        platform: key,
        order: index,
      }));

      try {
        await reorderSocialsAction({ data: { socials: reorderData } });
        onSuccess();
      } catch (_error) {
        toast.error("Failed to save order");
      }
      setDraggedKey(null);
    }
  }

  return (
    <>
      <Dialog
        open={open && !editingKey && !isAddOpen}
        onOpenChange={(isOpen) => !isOpen && onClose()}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-center font-bold text-lg">
              Social icons
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm">
                  Show visitors where to find you
                </h4>
                <p className="text-sm text-muted-foreground">
                  Add your social profiles, email and more as linked icons on
                  your LinkBio.
                </p>
              </div>

              {orderedKeys.length > 0 && (
                <ul className="space-y-3">
                  {orderedKeys.map((key) => {
                    const item = socialItems.find((i) => i.key === key);
                    if (!item) return null;

                    const value = socialManager.socialForm[item.key];
                    const canReorder = orderedKeys.length > 1;

                    return (
                      <li
                        key={item.key}
                        draggable={canReorder}
                        onDragStart={(e) =>
                          canReorder && handleDragStart(e, item.key)
                        }
                        onDragOver={(e) =>
                          canReorder && handleDragOver(e, item.key)
                        }
                        onDragEnd={handleDragEnd}
                        className="space-y-1 list-none group"
                      >
                        <div className="w-full flex items-center justify-between gap-3 rounded-2xl border border-border px-3 py-2 hover:bg-muted/50 transition-colors bg-background font-medium">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {canReorder && (
                              <GripVertical
                                size={16}
                                className="text-muted-foreground shrink-0 cursor-move"
                              />
                            )}
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-input text-foreground shrink-0 bg-background">
                              <item.Icon size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Label className="text-sm font-bold">
                                {item.label}
                              </Label>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Switch
                              checked={value?.isVisible ?? true}
                              onCheckedChange={() => toggleVisibility(item.key)}
                              title={
                                value?.isVisible
                                  ? "Hide from profile"
                                  : "Show on profile"
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditor(item.key)}
                              className="h-9 w-9 rounded-full"
                            >
                              <Edit size={16} />
                            </Button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">Social icon position</h4>
                  <p className="text-xs text-muted-foreground">
                    Display icons at the top or bottom of your profile
                  </p>
                </div>
                <RadioGroup
                  value={position}
                  onValueChange={(val) =>
                    handlePositionChange(val as "top" | "bottom")
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="top"
                      id="top"
                      className="h-5 w-5 border-2 border-muted-foreground data-[state=checked]:border-purple-600 data-[state=checked]:text-purple-600"
                    />
                    <Label
                      htmlFor="top"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Top
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="bottom"
                      id="bottom"
                      className="h-5 w-5 border-2 border-muted-foreground data-[state=checked]:border-purple-600 data-[state=checked]:text-purple-600"
                    />
                    <Label
                      htmlFor="bottom"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Bottom
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-muted/20 flex items-center gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-full font-bold gap-2 border-2 hover:bg-muted"
              asChild
            >
              <a href="/dashboard/analytics">
                <BarChart size={18} />
                See insights
              </a>
            </Button>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="flex-1 h-12 rounded-full font-bold gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus size={18} />
              Add social icon
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SocialAddDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSelect={(key) => {
          setIsAddOpen(false);
          openEditor(key);
        }}
      />

      <SocialEditDialog
        editingKey={editingKey}
        socialEditUrl={editUrl}
        socialEditError={editError}
        isSaving={isSaving}
        onClose={closeEditor}
        onSave={saveEdit}
        onRemove={() => editingKey && removeIcon(editingKey)}
        onUrlChange={setEditUrl}
      />
    </>
  );
}

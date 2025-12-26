import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/server/dashboard/profile";
import type { ProfileWithDetails } from "@/types/profile";

type ProfileDialogProps = {
  open: boolean;
  profile: ProfileWithDetails | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function ProfileDialog({
  open,
  profile,
  onClose,
  onSuccess,
}: ProfileDialogProps) {
  const [profileForm, setProfileForm] = useState({
    displayName: profile?.displayName || "",
    bio: profile?.bio || "",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setProfileForm({
      displayName: profile?.displayName || "",
      bio: profile?.bio || "",
    });
    setProfileErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    if (!profileForm.displayName.trim()) {
      nextErrors.displayName = "Display name is required.";
    }
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    await updateProfileAction({
      data: {
        displayName: profileForm.displayName,
        bio: profileForm.bio || null,
        avatarUrl: profile?.avatarUrl || null,
      },
    })
      .then(() => {
        onSuccess();
        onClose();
      })
      .catch(() => {
        toast.error("Failed to save profile");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Title and bio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="displayName">Title</Label>
            <Input
              id="displayName"
              value={profileForm.displayName}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              placeholder="Your name"
            />
            {profileErrors.displayName && (
              <p className="text-xs text-destructive">
                {profileErrors.displayName}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Short bio"
            />
            {profileErrors.bio && (
              <p className="text-xs text-destructive">{profileErrors.bio}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

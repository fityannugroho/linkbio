import { Check, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import Cropper from "react-easy-crop";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { profile, profileAvatar } from "@/db/schema";
import { getCroppedImage } from "@/lib/cropImage";
import {
  clearProfileAvatarAction,
  createAvatarUploadAction,
  deleteAvatarAction,
  saveAvatarAction,
  setProfileAvatarAction,
} from "@/server/dashboard/avatars";

const MAX_AVATAR_SIZE = 10 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const FILE_EXTENSION_BY_TYPE = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type Profile = typeof profile.$inferSelect;

type AvatarRecord = typeof profileAvatar.$inferSelect;

type AvatarDialogProps = {
  open: boolean;
  profile: Profile | null;
  avatars: AvatarRecord[];
  onClose: () => void;
  onSuccess: () => void;
};

export function AvatarDialog({
  open,
  profile,
  avatars,
  onClose,
  onSuccess,
}: AvatarDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAreaPixels, setCropAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
    confirmLabel?: string;
  } | null>(null);
  const currentAvatarUrl = profile?.avatarUrl || "";

  const resetCropState = useCallback(() => {
    setPendingFile(null);
    setCropImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropAreaPixels(null);
  }, []);

  // Reset all internal states when the dialog is closed
  useEffect(() => {
    if (!open) {
      resetCropState();
      setConfirmConfig(null);
      setIsUploading(false);
      setIsSaving(false);
    }
  }, [open, resetCropState]);

  const isCropping = Boolean(cropImageSrc);

  const handleClose = useCallback(() => {
    resetCropState();
    onClose();
  }, [onClose, resetCropState]);

  async function uploadAvatar(file: Blob) {
    const contentType = file.type;
    if (!ALLOWED_AVATAR_TYPES.includes(contentType)) {
      throw new Error("Unsupported image type");
    }
    const { uploadUrl, objectKey, uploadMethod, requiresSave } =
      await createAvatarUploadAction({
        data: { contentType, size: file.size },
      });
    let uploadResponse: Response;
    if (uploadMethod === "POST") {
      const formData = new FormData();
      const extension = FILE_EXTENSION_BY_TYPE.get(contentType) || "png";
      formData.append("file", file, `avatar.${extension}`);
      uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
    } else {
      uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": contentType,
        },
      });
    }
    if (!uploadResponse.ok) {
      throw new Error("Upload failed");
    }
    if (requiresSave) {
      await saveAvatarAction({ data: { objectKey } });
    }
  }

  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCropAreaPixels(croppedAreaPixels);
  };

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Upload a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Avatar must be 10MB or less.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPendingFile(file);
      setCropImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropAreaPixels(null);
    };
    reader.onerror = () => {
      toast.error("Failed to load image.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function handleCropSave() {
    if (!cropImageSrc || !cropAreaPixels || !pendingFile) return;
    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImage(
        cropImageSrc,
        cropAreaPixels,
        pendingFile.type,
      );
      if (croppedBlob.size > MAX_AVATAR_SIZE) {
        toast.error("Cropped avatar must be 10MB or less.");
        setIsUploading(false);
        return;
      }
      await uploadAvatar(croppedBlob);
      toast.success("Avatar uploaded.");
      resetCropState();
      onSuccess();
    } catch (_error) {
      toast.error("Failed to upload avatar.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSetCurrent(avatarId: number) {
    setIsSaving(true);
    await setProfileAvatarAction({ data: { avatarId } })
      .then(() => {
        toast.success("Avatar updated.");
        onSuccess();
      })
      .catch(() => {
        toast.error("Failed to update avatar.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  async function handleClearAvatar() {
    setConfirmConfig({
      title: "Remove avatar",
      description:
        "Are you sure you want to remove your current profile photo? This will revert to your name initials.",
      variant: "destructive",
      confirmLabel: "Remove",
      onConfirm: async () => {
        setIsSaving(true);
        await clearProfileAvatarAction({ data: { confirmed: true } })
          .then(() => {
            toast.success("Avatar removed.");
            onSuccess();
          })
          .catch(() => {
            toast.error("Failed to remove avatar.");
          })
          .finally(() => {
            setIsSaving(false);
            setConfirmConfig(null);
          });
      },
    });
  }

  async function handleDeleteAvatar(avatarId: number) {
    setConfirmConfig({
      title: "Delete avatar",
      description:
        "Are you sure you want to delete this avatar from your library? This action cannot be undone.",
      variant: "destructive",
      confirmLabel: "Delete",
      onConfirm: async () => {
        setIsSaving(true);
        await deleteAvatarAction({ data: { avatarId } })
          .then(() => {
            toast.success("Avatar deleted.");
            onSuccess();
          })
          .catch(() => {
            toast.error("Failed to delete avatar.");
          })
          .finally(() => {
            setIsSaving(false);
            setConfirmConfig(null);
          });
      },
    });
  }

  return (
    <Dialog
      open={open && !confirmConfig}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
    >
      <DialogContent className="sm:max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="">
          <DialogTitle>
            {isCropping ? "Crop avatar" : "Profile avatar"}
          </DialogTitle>
          <DialogDescription>
            {isCropping
              ? "Drag to crop and zoom to frame your avatar."
              : "Upload a new avatar or reuse one you already uploaded."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isCropping ? (
            <div className="space-y-4 py-4">
              <div className="relative h-64 w-full overflow-hidden rounded-xl border border-border bg-muted/60">
                {cropImageSrc && (
                  <Cropper
                    image={cropImageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="rect"
                    minZoom={1}
                    maxZoom={3}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    restrictPosition
                    zoomWithScroll
                  />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Zoom</span>
                  <span>{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetCropState}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCropSave}
                  disabled={isUploading || !cropAreaPixels}
                >
                  {isUploading ? "Uploading..." : "Save crop"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 shrink-0 border">
                    <AvatarImage src={currentAvatarUrl} alt="Current avatar" />
                    <AvatarFallback className="text-muted-foreground">
                      {profile?.displayName?.slice(0, 2).toUpperCase() || "LT"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Current avatar</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentAvatarUrl
                        ? "Shown on your public profile."
                        : "No avatar set."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 sm:flex-none"
                    onClick={handleClearAvatar}
                    disabled={!currentAvatarUrl || isSaving}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold">Avatar library</p>
                <p className="text-xs text-muted-foreground">
                  Tap an avatar to make it active.
                </p>
              </div>

              <div className="relative">
                {avatars.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/80 p-6 text-center text-sm text-muted-foreground">
                    Upload your first avatar to build your library.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {avatars.map((avatar) => {
                      const isCurrent = avatar.url === currentAvatarUrl;
                      return (
                        <div
                          key={avatar.id}
                          className={`group relative overflow-hidden rounded-xl border bg-card transition-all ${
                            isCurrent
                              ? "border-primary/70 ring-2 ring-primary/40"
                              : "border-border hover:border-border/80"
                          }`}
                        >
                          <button
                            type="button"
                            className="block w-full transition-opacity hover:opacity-90"
                            onClick={() => handleSetCurrent(avatar.id)}
                            disabled={isSaving}
                          >
                            <div className="relative aspect-square">
                              <img
                                src={avatar.url}
                                alt="Avatar"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </button>
                          <div className="flex h-11 items-center justify-end border-t border-border px-3">
                            {isCurrent ? (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Check size={16} strokeWidth={3} />
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteAvatar(avatar.id)}
                                disabled={isSaving}
                                title="Delete avatar"
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </DialogContent>
      <Dialog
        open={!!confirmConfig}
        onOpenChange={(isOpen) => !isOpen && setConfirmConfig(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{confirmConfig?.title}</DialogTitle>
            <DialogDescription>{confirmConfig?.description}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmConfig(null)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant={confirmConfig?.variant || "default"}
              onClick={confirmConfig?.onConfirm}
              disabled={isSaving}
            >
              {isSaving
                ? "Processing..."
                : confirmConfig?.confirmLabel || "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

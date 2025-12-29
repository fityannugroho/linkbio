
import { useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import Cropper from "react-easy-crop";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCroppedImage } from "@/lib/cropImage";
import { createThumbnailUploadAction } from "@/server/dashboard/thumbnails";

const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
const ALLOWED_THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"];
const FILE_EXTENSION_BY_TYPE = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type ThumbnailDialogProps = {
  open: boolean;
  currentThumbnailUrl: string | null;
  onClose: () => void;
  onSuccess: (url: string | null) => void;
};

export function ThumbnailDialog({
  open,
  currentThumbnailUrl,
  onClose,
  onSuccess,
}: ThumbnailDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAreaPixels, setCropAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isCropping = Boolean(cropImageSrc);

  const resetCropState = () => {
    setPendingFile(null);
    setCropImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropAreaPixels(null);
  };

  const handleClose = () => {
    resetCropState();
    onClose();
  };

  async function uploadThumbnail(file: Blob) {
    const contentType = file.type;
    if (!ALLOWED_THUMBNAIL_TYPES.includes(contentType)) {
      throw new Error("Unsupported image type");
    }
    const { uploadUrl, uploadMethod, thumbnailUrl } =
      await createThumbnailUploadAction({
        data: { contentType, size: file.size },
      });

    let uploadResponse: Response;
    if (uploadMethod === "POST") {
      const formData = new FormData();
      const extension = FILE_EXTENSION_BY_TYPE.get(contentType) || "png";
      formData.append("file", file, `thumbnail.${extension}`);
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

    // Attempt to extract updated URL if the POST response returns JSON with updated info
    // For PUT (S3 pre-signed), we already have the public URL in `thumbnailUrl` from the server action
    let finalUrl = thumbnailUrl;
    if (uploadMethod === "POST") {
      try {
        const json = await uploadResponse.json();
        if (json.thumbnailUrl) {
          finalUrl = json.thumbnailUrl;
        }
      } catch {
        // ignore JSON parse error, use fallback
      }
    }

    return finalUrl;
  }

  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCropAreaPixels(croppedAreaPixels);
  };

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_THUMBNAIL_TYPES.includes(file.type)) {
      toast.error("Upload a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_THUMBNAIL_SIZE) {
      toast.error("Thumbnail must be 5MB or less.");
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
      if (croppedBlob.size > MAX_THUMBNAIL_SIZE) {
        toast.error("Cropped thumbnail must be 5MB or less.");
        setIsUploading(false);
        return;
      }
      const url = await uploadThumbnail(croppedBlob);
      toast.success("Thumbnail uploaded.");
      resetCropState();
      onSuccess(url);
      handleClose();
    } catch (_error) {
      toast.error("Failed to upload thumbnail.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemoveThumbnail() {
    // If the user hasn't saved the form yet, we just want to clear the UI state.
    // However, for thumbnails already uploaded, we usually want to delete the file.
    // Since we don't have the object key here easily for existing URLs without parsing,
    // and the backend doesn't store objectKey directly on the link,
    // we will just clear the URL from the callback.
    // Real cleanup would require parsing the URL to get the key or handling it server-side on link update.
    // For now, we'll just clear the association.
    // Note: If we strictly want to delete file from S3/disk, we'd need the objectKey.
    // Given the simplicity, we'll assume "orphan" files are acceptable or cleaned up by a separate job,
    // OR we could try to parse the key if it matches our pattern.
    onSuccess(null);
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCropping ? "Crop thumbnail" : "Link thumbnail"}
          </DialogTitle>
          <DialogDescription>
            {isCropping
              ? "Drag to crop and zoom to frame your thumbnail."
              : "Upload a thumbnail for your link."}
          </DialogDescription>
        </DialogHeader>

        {isCropping ? (
          <div className="space-y-4">
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
            <div className="flex justify-end gap-2">
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
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              {currentThumbnailUrl ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-md border border-border">
                  <img
                    src={currentThumbnailUrl}
                    alt="Thumbnail"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-muted-foreground">
                  <span className="text-xs">No thumbnail</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {currentThumbnailUrl ? "Change image" : "Upload image"}
                </Button>
                {currentThumbnailUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemoveThumbnail}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}

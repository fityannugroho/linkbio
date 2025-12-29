import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { ThumbnailDialog } from "@/components/ThumbnailDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddLinkFormProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    url: string;
    thumbnailUrl?: string;
  }) => Promise<void>;
};

export function AddLinkForm({ open, onClose, onSubmit }: AddLinkFormProps) {
  const [formData, setFormData] = useState<{
    title: string;
    url: string;
    thumbnailUrl: string | null;
  }>({ title: "", url: "", thumbnailUrl: null });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isThumbnailDialogOpen, setIsThumbnailDialogOpen] = useState(false);

  const resetForm = () => {
    setFormData({ title: "", url: "", thumbnailUrl: null });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit({
        ...formData,
        thumbnailUrl: formData.thumbnailUrl || undefined,
      });
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add new link</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center py-2">
              <button
                type="button"
                onClick={() => setIsThumbnailDialogOpen(true)}
                className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                {formData.thumbnailUrl ? (
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImagePlus size={20} />
                    <span className="text-[10px]">Thumbnail</span>
                  </div>
                )}
              </button>
            </div>

            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. My Portfolio"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>URL</Label>
              <Input
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, url: e.target.value }));
                  if (error) setError("");
                }}
                required
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.title || !formData.url || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create link"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ThumbnailDialog
        open={isThumbnailDialogOpen}
        currentThumbnailUrl={formData.thumbnailUrl}
        onClose={() => setIsThumbnailDialogOpen(false)}
        onSuccess={(url) =>
          setFormData((prev) => ({ ...prev, thumbnailUrl: url }))
        }
      />
    </>
  );
}

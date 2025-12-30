import {
  EditIcon,
  GripVerticalIcon,
  ImagePlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { ThumbnailDialog } from "@/components/ThumbnailDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type LinkItem = typeof import("@/db/schema").links.$inferSelect;

type LinkCardProps = {
  link: LinkItem;
  onUpdate: (
    id: number,
    data: { title: string; url: string; thumbnailUrl?: string | null },
  ) => Promise<void>;
  onToggleVisibility: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onDragStart: (event: React.DragEvent, id: number) => void;
  onDragOver: (event: React.DragEvent, id: number) => void;
  onDragEnd: () => void;
};

export function LinkCard({
  link,
  onUpdate,
  onToggleVisibility,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
}: LinkCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: link.title,
    url: link.url,
    thumbnailUrl: link.thumbnailUrl,
  });
  const [error, setError] = useState("");
  const [isThumbnailDialogOpen, setIsThumbnailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const startEdit = () => {
    setEditForm({
      title: link.title,
      url: link.url,
      thumbnailUrl: link.thumbnailUrl,
    });
    setError("");
    setIsEditDialogOpen(true);
  };

  const saveEdit = async () => {
    try {
      await onUpdate(link.id, editForm);
      setIsEditDialogOpen(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update link");
    }
  };

  return (
    <>
      <li
        data-link-card
        className="list-none group rounded-lg border border-border bg-card text-card-foreground hover:border-border/80 transition-colors"
        onDragOver={(event) => onDragOver(event, link.id)}
      >
        <div className="flex flex-wrap gap-2 px-4 py-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              type="button"
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              onMouseDown={(event) => event.stopPropagation()}
              draggable
              onDragStart={(event) => onDragStart(event, link.id)}
              onDragEnd={onDragEnd}
            >
              <GripVerticalIcon size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col">
                <p className="font-semibold truncate">{link.title}</p>
                <p className="text-sm text-muted-foreground truncate mb-2">
                  {link.url}
                </p>
              </div>

              {/* Utility Bar */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={startEdit}
                  className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit"
                >
                  <EditIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsThumbnailDialogOpen(true)}
                  className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  title="Thumbnail"
                >
                  <ImagePlusIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2Icon size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Switch
              checked={link.isVisible}
              onCheckedChange={() => onToggleVisibility(link.id)}
            />
          </div>
        </div>
      </li>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveEdit();
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit link</DialogTitle>
              <DialogDescription>
                Update your link details here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={editForm.url}
                  onChange={(e) => {
                    setEditForm((prev) => ({ ...prev, url: e.target.value }));
                    if (error) setError("");
                  }}
                  placeholder="https://example.com"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this link? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await onDelete(link.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ThumbnailDialog
        open={isThumbnailDialogOpen}
        currentThumbnailUrl={
          isEditDialogOpen ? editForm.thumbnailUrl : link.thumbnailUrl
        }
        onClose={() => setIsThumbnailDialogOpen(false)}
        onSuccess={async (url) => {
          if (isEditDialogOpen) {
            setEditForm((prev) => ({ ...prev, thumbnailUrl: url }));
          } else {
            // Auto-save when not in editing mode
            await onUpdate(link.id, {
              title: link.title,
              url: link.url,
              thumbnailUrl: url,
            });
          }
        }}
      />
    </>
  );
}

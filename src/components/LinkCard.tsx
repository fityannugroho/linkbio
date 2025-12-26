import {
  Check,
  Edit,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LinkItem = typeof import("@/db/schema").links.$inferSelect;

type LinkCardProps = {
  link: LinkItem;
  onUpdate: (id: number, data: { title: string; url: string }) => Promise<void>;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: link.title,
    url: link.url,
  });
  const [error, setError] = useState("");

  const startEdit = () => {
    setIsEditing(true);
    setEditForm({ title: link.title, url: link.url });
    setError("");
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError("");
  };

  const saveEdit = async () => {
    try {
      await onUpdate(link.id, editForm);
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update link");
    }
  };

  return (
    <li
      data-link-card
      className="list-none group rounded-lg border border-border bg-card text-card-foreground hover:border-border/80 transition-colors"
      onDragOver={(event) => onDragOver(event, link.id)}
    >
      <div className="flex items-center gap-4 px-4 py-3">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          onMouseDown={(event) => event.stopPropagation()}
          draggable
          onDragStart={(event) => onDragStart(event, link.id)}
          onDragEnd={onDragEnd}
        >
          <GripVertical size={20} />
        </button>

        {isEditing ? (
          <div className="flex-1 space-y-2">
            <Input
              value={editForm.title}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Title"
            />
            <Input
              value={editForm.url}
              onChange={(e) => {
                setEditForm((prev) => ({ ...prev, url: e.target.value }));
                if (error) setError("");
              }}
              placeholder="URL"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{link.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{link.url}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={saveEdit}
                className="text-primary hover:text-primary/80 hover:bg-accent"
              >
                <Check size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={cancelEdit}>
                <X size={18} />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={startEdit}
                title="Edit"
              >
                <Edit size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleVisibility(link.id)}
                title={link.isVisible ? "Hide" : "Show"}
              >
                {link.isVisible ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} className="text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                onClick={() => onDelete(link.id)}
              >
                <Trash2 size={18} />
              </Button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

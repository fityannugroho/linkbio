import { LinkCard } from "@/components/LinkCard";

type LinkItem = typeof import("@/db/schema").links.$inferSelect;

type LinksListProps = {
  links: LinkItem[];
  onUpdateLink: (
    id: number,
    data: { title: string; url: string },
  ) => Promise<void>;
  onToggleVisibility: (id: number) => Promise<void>;
  onDeleteLink: (id: number) => Promise<void>;
  onDragStart: (event: React.DragEvent, id: number) => void;
  onDragOver: (event: React.DragEvent, id: number) => void;
  onDragEnd: () => void;
};

export function LinksList({
  links,
  onUpdateLink,
  onToggleVisibility,
  onDeleteLink,
  onDragStart,
  onDragOver,
  onDragEnd,
}: LinksListProps) {
  if (links.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-50">
        No links yet. Click the + button below to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          onUpdate={onUpdateLink}
          onToggleVisibility={onToggleVisibility}
          onDelete={onDeleteLink}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        />
      ))}
    </div>
  );
}

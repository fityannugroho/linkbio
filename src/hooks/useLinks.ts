import type { DragEvent } from "react";
import { useEffect, useState } from "react";
import { isValidHttpUrl } from "@/lib/validation";
import {
  addLinkAction,
  deleteLinkAction,
  reorderLinksAction,
  toggleLinkVisibilityAction,
  updateLinkAction,
} from "@/server/dashboard/links";

type LinkItem = typeof import("@/db/schema").links.$inferSelect;

type UseLinksOptions = {
  initialLinks: LinkItem[];
  onInvalidate: () => void;
};

export const useLinks = ({ initialLinks, onInvalidate }: UseLinksOptions) => {
  const [links, setLinks] = useState(initialLinks);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  // Sync with initial links when they change
  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  const addLink = async (data: { title: string; url: string }) => {
    if (!isValidHttpUrl(data.url)) {
      throw new Error("Please enter a valid URL (https://...)");
    }
    await addLinkAction({ data });
    await onInvalidate();
  };

  const updateLink = async (
    id: number,
    data: { title: string; url: string },
  ) => {
    if (!isValidHttpUrl(data.url)) {
      throw new Error("Please enter a valid URL (https://...)");
    }
    await updateLinkAction({ data: { id, ...data } });
    await onInvalidate();
  };

  const toggleVisibility = async (id: number) => {
    // Optimistic update
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id ? { ...link, isVisible: !link.isVisible } : link,
      ),
    );
    await toggleLinkVisibilityAction({ data: id });
    await onInvalidate();
  };

  const deleteLink = async (id: number) => {
    if (confirm("Are you sure?")) {
      await deleteLinkAction({ data: id });
      await onInvalidate();
    }
  };

  const startDrag = (event: DragEvent, id: number) => {
    const handle = event.currentTarget as HTMLElement;
    const card = handle.closest("[data-link-card]") as HTMLElement | null;

    event.dataTransfer.effectAllowed = "move";
    if (card) {
      event.dataTransfer.setDragImage(card, 20, 20);
    }
    setDraggedId(id);
  };

  const dragOver = (event: DragEvent, targetId: number) => {
    event.preventDefault();
    if (draggedId === null || draggedId === targetId) return;

    const draggedIndex = links.findIndex((link) => link.id === draggedId);
    const targetIndex = links.findIndex((link) => link.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newLinks = [...links];
    const draggedItem = newLinks[draggedIndex];
    newLinks.splice(draggedIndex, 1);
    newLinks.splice(targetIndex, 0, draggedItem);

    setLinks(newLinks);
  };

  const endDrag = async () => {
    if (draggedId !== null) {
      const reorderedData = links.map((link, index) => ({
        id: link.id,
        newOrder: index,
      }));
      await reorderLinksAction({ data: reorderedData });
      setDraggedId(null);
      await onInvalidate();
    }
  };

  return {
    links,
    addLink,
    updateLink,
    toggleVisibility,
    deleteLink,
    startDrag,
    dragOver,
    endDrag,
  };
};

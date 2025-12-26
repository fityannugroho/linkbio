import { ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { socialItems } from "@/constants/social";
import type { SocialPlatform } from "@/lib/validation";

type SocialAddDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (key: SocialPlatform) => void;
};

export function SocialAddDialog({
  open,
  onClose,
  onSelect,
}: SocialAddDialogProps) {
  const [search, setSearch] = useState("");

  const filteredItems = socialItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center">Add social icon</DialogTitle>
        </DialogHeader>
        <div className="p-4 border-b bg-muted/30">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder="Search"
              className="pl-10 h-11 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="flex flex-col gap-1">
            {filteredItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelect(item.key);
                  setSearch("");
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-xl transition-colors group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-input text-foreground bg-background">
                    <item.Icon size={20} />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <ChevronRight
                  size={18}
                  className="text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No social icons found for "{search}"
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

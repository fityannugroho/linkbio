import { ColorPickerInput } from "@/components/ui/color-picker";
import { Label } from "@/components/ui/label";

type WallpaperData = {
  backgroundType: "solid" | "gradient";
  backgroundSolid: string;
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  backgroundGradientDirection: string;
};

type WallpaperSectionProps = {
  data: WallpaperData;
  onChange: (data: Partial<WallpaperData>) => void;
};

export function WallpaperSection({ data, onChange }: WallpaperSectionProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Background style</Label>
        <select
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={data.backgroundType}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "solid" || value === "gradient") {
              onChange({ backgroundType: value });
            }
          }}
        >
          <option value="solid">Solid color</option>
          <option value="gradient">Gradient</option>
        </select>
      </div>

      {data.backgroundType === "solid" ? (
        <div className="flex items-center gap-3">
          <ColorPickerInput
            value={data.backgroundSolid}
            onChange={(value) => onChange({ backgroundSolid: value })}
            aria-label="Solid background color"
          />
          <div className="text-xs text-muted-foreground">
            Pick a solid background color
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Direction</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={data.backgroundGradientDirection}
              onChange={(e) =>
                onChange({ backgroundGradientDirection: e.target.value })
              }
            >
              <option value="to bottom">Top to bottom</option>
              <option value="to right">Left to right</option>
              <option value="to bottom right">Top left to bottom right</option>
              <option value="135deg">Diagonal (135deg)</option>
            </select>
          </div>
          <div className="grid items-end gap-3 sm:grid-cols-[auto_auto_1fr]">
            <div className="grid gap-2">
              <Label>From</Label>
              <ColorPickerInput
                value={data.backgroundGradientFrom}
                onChange={(value) =>
                  onChange({ backgroundGradientFrom: value })
                }
                aria-label="Gradient start color"
              />
            </div>
            <div className="grid gap-2">
              <Label>To</Label>
              <ColorPickerInput
                value={data.backgroundGradientTo}
                onChange={(value) => onChange({ backgroundGradientTo: value })}
                aria-label="Gradient end color"
              />
            </div>
          </div>
          <div
            className="h-12 rounded-md"
            style={{
              backgroundImage: `linear-gradient(${data.backgroundGradientDirection}, ${data.backgroundGradientFrom}, ${data.backgroundGradientTo})`,
            }}
          />
        </div>
      )}
    </div>
  );
}

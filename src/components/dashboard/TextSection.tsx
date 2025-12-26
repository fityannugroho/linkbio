import { ColorPickerInput } from "@/components/ui/color-picker";
import { Label } from "@/components/ui/label";

type TextSectionData = {
  font: string;
};

type TextSectionProps = {
  data: TextSectionData;
  onChange: (data: Partial<TextSectionData>) => void;
};

export function TextSection({ data, onChange }: TextSectionProps) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-2 items-start">
        <Label id="textColor">Text color</Label>
        <ColorPickerInput
          value={data.font}
          onChange={(value) => onChange({ font: value })}
          aria-labelledby="textColor"
        />
      </div>
    </div>
  );
}

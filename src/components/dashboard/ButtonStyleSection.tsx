import { Label } from "@/components/ui/label";

type ButtonStyleData = {
  buttonStyle: string;
};

type ButtonStyleSectionProps = {
  data: ButtonStyleData;
  onChange: (data: Partial<ButtonStyleData>) => void;
};

export function ButtonStyleSection({
  data,
  onChange,
}: ButtonStyleSectionProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Button style</Label>
        <select
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={data.buttonStyle}
          onChange={(e) => onChange({ buttonStyle: e.target.value })}
        >
          <option value="default">Default (white block)</option>
          <option value="outline">Outline</option>
          <option value="glass">Glassmorphism</option>
        </select>
      </div>
    </div>
  );
}

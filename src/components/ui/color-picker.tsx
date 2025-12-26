import { type ComponentPropsWithRef, useEffect, useId, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function normalizeHexColor(raw: string) {
  const value = raw.trim().toLowerCase();
  const hex = value.startsWith("#") ? value.slice(1) : value;

  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(hex)) {
    return null;
  }

  if (hex.length === 3) {
    const expanded = hex
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
    return `#${expanded}`;
  }

  return `#${hex}`;
}

function getSafeHexColor(value: string) {
  return normalizeHexColor(value) ?? "#000000";
}

type ColorPickerInputProps = Omit<
  ComponentPropsWithRef<"button">,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  inputProps?: Omit<ComponentPropsWithRef<typeof Input>, "value" | "onChange">;
};

function ColorPickerInput({
  value,
  onChange,
  disabled,
  className,
  inputProps,
  ...props
}: ColorPickerInputProps) {
  const inputId = useId();
  const safeValue = getSafeHexColor(value);
  const [draft, setDraft] = useState(safeValue);

  useEffect(() => {
    setDraft(safeValue);
  }, [safeValue]);

  function handleDraftChange(next: string) {
    setDraft(next);
    const normalized = normalizeHexColor(next);
    if (normalized) {
      onChange(normalized);
    }
  }

  function handleDraftBlur() {
    const normalized = normalizeHexColor(draft);
    if (normalized) {
      setDraft(normalized);
      return;
    }
    setDraft(safeValue);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "border-input bg-background ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] inline-flex h-9 items-center gap-2 rounded-md border px-2 text-sm shadow-xs outline-none disabled:pointer-events-none disabled:opacity-50",
            className,
          )}
          {...props}
        >
          <span
            className="size-6 rounded-sm border"
            style={{ backgroundColor: safeValue }}
            aria-hidden="true"
          />
          <span className="font-mono text-sm">{safeValue}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-auto">
        <div className="grid gap-2">
          <HexColorPicker
            color={safeValue}
            onChange={(next) => {
              const normalized = getSafeHexColor(next);
              setDraft(normalized);
              onChange(normalized);
            }}
            className="h-44 w-full rounded-md"
          />
          <div className="grid gap-1">
            <label htmlFor={inputId} className="sr-only">
              Hex
            </label>
            <Input
              id={inputId}
              value={draft}
              onChange={(e) => handleDraftChange(e.target.value)}
              onBlur={handleDraftBlur}
              placeholder="#RRGGBB"
              inputMode="text"
              spellCheck={false}
              autoComplete="off"
              className={cn("font-mono", inputProps?.className)}
              disabled={disabled}
              {...inputProps}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { ColorPickerInput };

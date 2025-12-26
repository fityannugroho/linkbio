import { getRouteApi } from "@tanstack/react-router";
import { endOfDay, format, isSameDay, startOfDay } from "date-fns";
import { CalendarIcon, Check, ChevronLeft } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import {
  ANALYTICS_GROUPS,
  ANALYTICS_PRESETS,
  type AnalyticsSearch,
} from "@/components/dashboard/analytics/schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const routeApi = getRouteApi("/dashboard/analytics");

export function DateRangeFilter() {
  const navigate = routeApi.useNavigate();
  const search = routeApi.useSearch();
  const [isOpen, setIsOpen] = React.useState(false);
  const [view, setView] = React.useState<"presets" | "calendar">("presets");
  const [calendarMode, setCalendarMode] = React.useState<"single" | "range">(
    "range",
  );
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [singleDate, setSingleDate] = React.useState<Date | undefined>();

  // Initialize date from search params
  React.useEffect(() => {
    if (search.from && search.to) {
      const fromDate = new Date(search.from);
      const toDate = new Date(search.to);
      setDate({ from: fromDate, to: toDate });

      if (isSameDay(fromDate, toDate)) {
        // Check if it's a single day
        setSingleDate(fromDate);
        setCalendarMode("single");
      } else {
        setSingleDate(undefined);
        setCalendarMode("range");
      }
    } else {
      setDate(undefined);
      setSingleDate(undefined);
      setCalendarMode("range");
    }
  }, [search.from, search.to]);

  const updateRange = (
    range: AnalyticsSearch["range"],
    from?: number,
    to?: number,
  ) => {
    navigate({
      search: (prev) => ({
        ...prev,
        range,
        from,
        to,
      }),
    });
    setIsOpen(false);
    setView("presets");
  };

  const handlePresetSelect = (value: string) => {
    if (value === "custom") {
      setView("calendar");
      return;
    }

    // Explicitly handle all preset values to satisfy TypeScript
    const validRange = value as AnalyticsSearch["range"];
    updateRange(validRange, undefined, undefined);
  };

  const getLabel = () => {
    if (search.range === "custom" && search.from && search.to) {
      if (isSameDay(search.from, search.to)) {
        return format(search.from, "LLL dd, y");
      }
      return `${format(search.from, "LLL dd, y")} - ${format(search.to, "LLL dd, y")}`;
    }
    const preset = ANALYTICS_PRESETS.find((p) => p.value === search.range);
    return preset?.label || "Last 30 Days";
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setView("presets"); // Reset view on close
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !search.range && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {view === "presets" ? (
          <div className="flex flex-col p-1.5 min-w-[180px] max-h-[340px] overflow-y-auto">
            {ANALYTICS_GROUPS.map((group, groupIndex) => (
              <React.Fragment key={group.items.join("-")}>
                {groupIndex > 0 && (
                  <div className="h-px border-t border-muted-foreground/20 my-1.5 mx-1" />
                )}
                <div className="flex flex-col gap-0.5">
                  {group.items.map((value) => {
                    const preset = ANALYTICS_PRESETS.find(
                      (p) => p.value === value,
                    );
                    if (!preset) return null;
                    const isActive = search.range === preset.value;
                    return (
                      <Button
                        key={preset.value}
                        variant="ghost"
                        className={cn(
                          "justify-between font-normal h-10 px-3",
                          isActive && "bg-accent font-medium",
                        )}
                        onClick={() => handlePresetSelect(preset.value)}
                      >
                        <span>{preset.label}</span>
                        {isActive && <Check className="h-4 w-4" />}
                      </Button>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="p-0">
            <div className="flex items-center justify-between border-b p-3">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 mr-2"
                  onClick={() => setView("presets")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-sm">Select Dates</span>
              </div>
            </div>
            <div className="p-3 pb-0 flex gap-2">
              <Button
                variant={calendarMode === "single" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setCalendarMode("single")}
              >
                Single day
              </Button>
              <Button
                variant={calendarMode === "range" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setCalendarMode("range")}
              >
                Date range
              </Button>
            </div>
            {calendarMode === "single" ? (
              <Calendar
                initialFocus
                mode="single"
                defaultMonth={singleDate}
                selected={singleDate}
                onSelect={setSingleDate}
                numberOfMonths={2}
              />
            ) : (
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            )}
            <div className="border-t p-3 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={
                  calendarMode === "single"
                    ? !singleDate
                    : !date?.from || !date?.to
                }
                onClick={() => {
                  if (calendarMode === "single" && singleDate) {
                    updateRange(
                      "custom",
                      startOfDay(singleDate).getTime(),
                      endOfDay(singleDate).getTime(),
                    );
                  } else if (
                    calendarMode === "range" &&
                    date?.from &&
                    date?.to
                  ) {
                    updateRange(
                      "custom",
                      date.from.getTime(),
                      date.to.getTime(),
                    );
                  }
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

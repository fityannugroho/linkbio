import { z } from "zod";

export const analyticsSearchSchema = z.object({
  range: z
    .enum([
      "today",
      "24h",
      "this_week",
      "7d",
      "this_month",
      "30d",
      "90d",
      "this_year",
      "6m",
      "12m",
      "all",
      "custom",
    ])
    .optional(),
  from: z.coerce.number().optional(),
  to: z.coerce.number().optional(),
});

export type AnalyticsSearch = z.infer<typeof analyticsSearchSchema>;

export const ANALYTICS_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Last 24 hours", value: "24h" },
  { label: "This week", value: "this_week" },
  { label: "Last 7 days", value: "7d" },
  { label: "This month", value: "this_month" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This year", value: "this_year" },
  { label: "Last 6 months", value: "6m" },
  { label: "Last 12 months", value: "12m" },
  { label: "All time", value: "all" },
  { label: "Custom range", value: "custom" },
] as const;

export const ANALYTICS_GROUPS = [
  { items: ["today", "24h"] },
  { items: ["this_week", "7d"] },
  { items: ["this_month", "30d", "90d", "this_year"] },
  { items: ["6m", "12m"] },
  { items: ["all"] },
  { items: ["custom"] },
] as const;

export type UmamiTrackProps = {
  hostname?: string;
  language?: string;
  referrer?: string;
  screen?: string;
  title?: string;
  url?: string;
  website: string;
};

/**
 * @link https://umami.is/docs/tracker-functions
 */
export type Umami = {
  /** Tracks the current page */
  track(): void;
  /** Custom payload */
  track(payload: UmamiTrackProps): void;
  /** Custom payload with existing props */
  track(payload: (props: UmamiTrackProps) => UmamiTrackProps): void;
  /** Custom event */
  track(event_name: string): void;
  /** Custom event with data */
  track(event_name: string, data: object): void;
  /** Assign ID to current session */
  identify(unique_id: string): void;
  /** Session data */
  identify(unique_id: string, data: object): void;
  /** Session data without ID */
  identify(data: object): void;
};

/**
 * @link https://umami.is/docs/tracker-functions
 */
export function getUmami(): Umami | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as { umami?: Umami }).umami ?? null;
}

export type TableSignal = {
  hasRequest?: boolean;
  hasOrder?: boolean;
  inProcess?: boolean;
  ready?: boolean;
  pickingUp?: boolean;
  delivered?: boolean;
};

export type TableStatusKey = "request" | "order" | "inProcess" | "ready" | "pickup";

export type StatusStyle = {
  bg: string;
  border: string;
  text: string;
  glow: string;
};

/**
 * Legend colours (exact shades).
 * IMPORTANT (per your spec):
 * - READY is the loud FOH alert colour (rose/pink).
 * - IN PROCESS is green.
 * - Order stays blue, Pickup stays indigo, Request stays amber.
 */
export const STATUS_STYLES: Record<TableStatusKey, StatusStyle> = {
  request: {
    bg: "#ffedd5",
    border: "#f59e0b",
    text: "#92400e",
    glow: "rgba(245,158,11,0.45)",
  },
  order: {
    bg: "#e0f2fe",
    border: "#0ea5e9",
    text: "#075985",
    glow: "rgba(14,165,233,0.45)",
  },
  inProcess: {
    bg: "#dcfce7",
    border: "#10b981",
    text: "#065f46",
    glow: "rgba(16,185,129,0.45)",
  },
  ready: {
    bg: "#ffe4e6",
    border: "#fb7185",
    text: "#9f1239",
    glow: "rgba(251,113,133,0.45)",
  },
  pickup: {
    bg: "#e0e7ff",
    border: "#6366f1",
    text: "#3730a3",
    glow: "rgba(99,102,241,0.45)",
  },
};

// Used to pick the "secondary" (border/glow) when READY is present,
// and to pick a primary when READY is absent.
export const SECONDARY_PRIORITY: TableStatusKey[] = [
  "pickup",
  "inProcess",
  "order",
  "request",
];

/**
 * Returns statuses present on the table in priority order (excluding READY),
 * plus whether READY is present.
 */
export function getStatusPresence(signals: TableSignal): {
  hasReady: boolean;
  others: TableStatusKey[];
} {
  const hasReady = !!signals.ready;

  const present: Partial<Record<TableStatusKey, boolean>> = {
    pickup: !!signals.pickingUp,
    inProcess: !!signals.inProcess,
    order: !!signals.hasOrder,
    request: !!signals.hasRequest,
  };

  const others = SECONDARY_PRIORITY.filter((k) => !!present[k]);
  return { hasReady, others };
}

/**
 * Map a staff ticket status to our shared visual key.
 * (Used by TicketCard to match the FOH table palette.)
 */
export function mapOrderStatusToVisualKey(
  status: "NEW" | "IN_PROGRESS" | "READY" | "PICKING_UP" | "DELIVERED",
): TableStatusKey | null {
  switch (status) {
    case "NEW":
      return "order";
    case "IN_PROGRESS":
      return "inProcess";
    case "READY":
      return "ready";
    case "PICKING_UP":
      return "pickup";
    case "DELIVERED":
      return null;
    default:
      return null;
  }
}


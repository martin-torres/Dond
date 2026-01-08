import React from "react";
import { Table, Language } from "../types";
import { t } from "../utils/translations";

export type TableSignal = {
  hasRequest?: boolean;
  hasOrder?: boolean;
  inProcess?: boolean;
  ready?: boolean;
  pickingUp?: boolean;
  delivered?: boolean;
};

type TableStatusKey = "request" | "order" | "inProcess" | "ready" | "pickup";

type StatusStyle = { bg: string; border: string; text: string; glow: string };

/**
 * Legend colours (exact shades).
 *
 * IMPORTANT (per your latest spec):
 * - READY is the loud FOH alert colour (rose/pink).
 * - IN PROCESS is green.
 * - Order stays blue, Pickup stays indigo, Request stays amber.
 */
const STATUS_STYLES: Record<TableStatusKey, StatusStyle> = {
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
    // swapped: IN PROCESS = green
    bg: "#dcfce7",
    border: "#10b981",
    text: "#065f46",
    glow: "rgba(16,185,129,0.45)",
  },
  ready: {
    // swapped: READY = rose/pink
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
const SECONDARY_PRIORITY: TableStatusKey[] = [
  "pickup",
  "inProcess",
  "order",
  "request",
];

/**
 * Returns statuses present on the table in priority order (excluding READY),
 * plus whether READY is present.
 */
function getStatusPresence(signals: TableSignal): {
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

interface FloorPlanTablePickerProps {
  tables: Table[];
  language: Language; // kept for future use
  selectedLocation: string; // 'all' or one of the table locations
  selectedTableId: string | null;
  onTableClick: (table: Table) => void;
  tableSignals?: Record<string, TableSignal>;
  compact?: boolean;
  hideMeta?: boolean;
  hideSignals?: boolean;
}

const FloorPlanTablePicker: React.FC<FloorPlanTablePickerProps> = ({
  tables,
  language,
  selectedLocation,
  selectedTableId,
  onTableClick,
  tableSignals,
  compact = false,
  hideMeta = false,
  hideSignals = false,
}) => {
  if (!tables || tables.length === 0) {
    return (
      <div
        style={{
          padding: 16,
          fontSize: 13,
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        No tables configured.
      </div>
    );
  }

  // IMPORTANT: Status-driven table colouring applies on the FOH + Manager pages.
  // We gate it by the route path to avoid affecting other screens.
  const enableStatusDrivenColors =
    typeof window !== "undefined" &&
    (window.location.pathname.startsWith("/foh") ||
      window.location.pathname.startsWith("/manager"));

  const tableCount = tables.length || 1;
  // Dynamic sizing: tables with active orders are 65% size, inactive are even smaller

  // Base size between compact (smaller) and default (larger) depending on table count
  const minSize = compact ? 16 : 56;
  const maxSize = compact ? 28 : 96;
  const clampedCount = Math.min(Math.max(tableCount, 15), 36);
  const ratio = (clampedCount - 15) / (36 - 15); // 0 -> 1
  const baseSize = maxSize - (maxSize - minSize) * ratio;

  const minHeight = compact ? 170 : 360;
  const outerPadding = compact ? 1 : 1;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight,
          border: "2px dashed #ef4444",
          borderRadius: 16,
          padding: outerPadding,
          boxSizing: "border-box",
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        {!hideMeta && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span>{t("floorPlan", language)}</span>
            <span>
              {t("tablesLabel", language)}: {tables.length} •{" "}
              {t("filter", language)}:{" "}
              {selectedLocation === "all"
                ? t("allTables", language)
                : selectedLocation}
            </span>
          </div>
        )}

        <div
          style={{
            paddingInline: compact ? 4 : 4,
            display: "grid",
            gridTemplateColumns: compact
              ? "repeat(auto-fit, minmax(90px, 1fr))"
              : "repeat(auto-fit, minmax(120px, 1fr))",
            gap: compact ? 12 : 12,
          }}
        >
          {tables.map((table) => {
            const matchesLocation =
              selectedLocation === "all" || table.location === selectedLocation;
            const isMuted = !matchesLocation;

            const isSelected = selectedTableId === table.id;
            const signals = tableSignals?.[table.id] ?? {};

            // derive READY + other status list in priority order
            const { hasReady, others } = getStatusPresence(signals);

            // Base colours (fallback = IDLE = grayscale)
            let baseBg = "#f1f5f9"; // light slate
            let baseBorder = "#cbd5e1"; // slate border
            let baseText = "#334155"; // slate text

            // default glow (used for selection when idle)
            let selectionGlowCss = "rgba(203,213,225,0.65)";

            const activeCount = (hasReady ? 1 : 0) + others.length;

            // Dynamic sizing: tables with active orders are 65% size, inactive are even smaller
            const hasActiveStatuses = activeCount > 0;
            const dynamicSizeScale = (compact ? 0.65 : 1) *
              (hasActiveStatuses ? 0.65 : 0.45); // 65% for active, 45% for inactive

            // Idle tables render at 70% size without changing layout footprint
            const idleVisualScale =
              enableStatusDrivenColors && activeCount === 0 ? 0.7 : 1.0;

            /**
             * RULES (per FOH alert spec):
             * - If there are NO active statuses: keep availability colours exactly.
             * - If there is exactly 1 active status:
             *    - READY => use READY styles
             *    - otherwise => use that status styles
             * - If there are 2+ statuses and READY is present:
             *    - FILL must be READY (pink)
             *    - BORDER/GLOW must be the most important "secondary" status present (others[0])
             * - If there are 2+ statuses and READY is NOT present:
             *    - BORDER/GLOW = highest priority status (others[0])
             *    - FILL = next highest (others[1]) (or same if only one)
             */
            if (enableStatusDrivenColors && activeCount > 0) {
              if (activeCount === 1) {
                const onlyKey: TableStatusKey = hasReady ? "ready" : others[0];
                const s = STATUS_STYLES[onlyKey];
                baseBg = s.bg;
                baseBorder = s.border;
                baseText = s.text;
                selectionGlowCss = s.glow;
              } else if (hasReady) {
                const fill = STATUS_STYLES["ready"];
                const borderKey: TableStatusKey = others[0] ?? "ready";
                const border = STATUS_STYLES[borderKey];

                baseBg = fill.bg;
                baseBorder = border.border;
                baseText = fill.text;
                selectionGlowCss = border.glow;
              } else if (others.length > 0) {
                const borderKey = others[0];
                const fillKey = others[1] ?? others[0];

                const border = STATUS_STYLES[borderKey];
                const fill = STATUS_STYLES[fillKey];

                baseBg = fill.bg;
                baseBorder = border.border;
                baseText = fill.text;
                selectionGlowCss = border.glow;
              }
            }

            // Shape & size based on number of seats
            let width = baseSize * 1.1 * dynamicSizeScale;
            let height = width;
            let borderRadius = "12px";

            if (table.seats <= 2) {
              width = baseSize * 1.0 * dynamicSizeScale;
              height = width;
              borderRadius = "999px"; // circle
            } else if (table.seats <= 4) {
              width = baseSize * 1.1 * dynamicSizeScale;
              height = width;
              borderRadius = "12px"; // square-ish
            } else if (table.seats <= 6) {
              width = baseSize * 1.6 * dynamicSizeScale;
              height = baseSize * 1.05 * dynamicSizeScale;
              borderRadius = "14px"; // wider rectangle
            } else {
              width = baseSize * 1.9 * dynamicSizeScale;
              height = baseSize * 1.15 * dynamicSizeScale;
              borderRadius = "16px"; // largest rectangle
            }

            const badge = (text: string, color: string) => (
              <span
                key={text}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 20,
                  background: "#ffffffc7",
                  color,
                  fontSize: 10,
                  borderRadius: 999,
                  border: `1px solid ${color}33`,
                  fontWeight: 700,
                  padding: "0 4px",
                }}
              >
                {text}
              </span>
            );

            const badges: React.ReactNode[] = [];
            if (!hideSignals) {
              // FOH Priority Order (vertical stack):
              // 1. REQUEST (top priority for FOH)
              // 2. READY
              // 3. PICKUP
              // 4. PROCESS
              // 5. ORDER
              if (signals.hasRequest) {
                badges.push(badge("REQUEST", "#f59e0b"));
              }
              if (signals.ready) {
                badges.push(badge("READY", "#dc2626"));
              }
              if (signals.pickingUp) {
                badges.push(badge("PICKUP", "#6366f1"));
              }
              if (signals.inProcess) {
                badges.push(badge("PROCESS", "#10b981"));
              }
              if (signals.hasOrder) {
                badges.push(badge("ORDER", "#0ea5e9"));
              }
            }

            return (
              <button
                key={table.id}
                onClick={() => {
                  if (!isMuted) onTableClick(table);
                }}
                style={{
                  width: "100%",
                  minHeight: height + 12,
                  borderRadius,
                  border: `2px solid ${baseBorder}`,
                  background: baseBg,
                  color: baseText,
                  fontSize: 12,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                  opacity: isMuted ? 0.25 : 1,
                  cursor: isMuted ? "not-allowed" : "pointer",
                  boxShadow: isSelected
                    ? `0 0 0 4px ${selectionGlowCss}`
                    : "0 4px 14px rgba(15,23,42,0.12)",
                  transform: isSelected
                    ? `scale(${idleVisualScale * 1.02})`
                    : `scale(${idleVisualScale})`,
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  textAlign: "left",
                  padding: 10,
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 16 }}>🍽️</span>
                    {table.number}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>
                    {table.seats}
                  </div>
                </div>

                {badges.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", width: "100%" }}>
                    {badges.slice(0, 3)} {/* Show max 3 badges in vertical stack, centered */}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FloorPlanTablePicker;

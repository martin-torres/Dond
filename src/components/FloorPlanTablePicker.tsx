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

/**
 * Palette must match the legend colours exactly.
 * (Local to this component — no global theme changes.)
 */
const STATUS_PALETTE: Record<TableStatusKey, string> = {
  request: "#f59e0b", // amber
  order: "#0ea5e9", // sky
  inProcess: "#fb7185", // rose
  ready: "#10b981", // emerald
  pickup: "#6366f1", // indigo
};

// PRIMARY priority: pickup > ready > inProcess > order > request
const STATUS_PRIORITY: TableStatusKey[] = [
  "pickup",
  "ready",
  "inProcess",
  "order",
  "request",
];

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function readableTextColor(bgHex: string) {
  // Simple luminance check: returns either white or a very dark slate.
  const clean = bgHex.replace("#", "").trim();
  const full =
    clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.68 ? "#0f172a" : "#ffffff";
}

function getActiveStatuses(signals: TableSignal): TableStatusKey[] {
  const present: Partial<Record<TableStatusKey, boolean>> = {
    pickup: !!signals.pickingUp,
    ready: !!signals.ready,
    inProcess: !!signals.inProcess,
    order: !!signals.hasOrder,
    request: !!signals.hasRequest,
  };
  return STATUS_PRIORITY.filter((k) => !!present[k]);
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

/**
 * SIMPLE, ALWAYS-VISIBLE FLOOR PLAN WITH SHAPES BY SEATS:
 * - Red dashed rectangle.
 * - Info line with tables.length + selectedLocation.
 * - Cluster of table shapes (circles / squares / rectangles).
 * - Seats-based size:
 *    - 1–2 seats: smaller circles (bar / tiny tables)
 *    - 3–4 seats: medium squares
 *    - 5–6 seats: wider rectangles
 *    - 7+ seats: largest rectangles
 * - Location filter:
 *    - Matching: normal + clickable.
 *    - Non-matching: 50% opacity + not clickable.
 * - Selected table: glow + slight scale-up.
 */
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

  // IMPORTANT: You asked that status-driven table colouring ONLY applies on the FOH page.
  // So we gate it by the route path.
  const enableStatusDrivenColors =
    typeof window !== "undefined" && window.location.pathname.startsWith("/foh");

  const tableCount = tables.length || 1;
  const sizeScale = compact ? 0.65 : 1;
  // Base size between compact (smaller) and default (larger) depending on table count
  const minSize = compact ? 16 : 56;
  const maxSize = compact ? 28 : 96;
  const clampedCount = Math.min(Math.max(tableCount, 15), 36);
  const ratio = (clampedCount - 15) / (36 - 15); // 0 -> 1
  const baseSize = maxSize - (maxSize - minSize) * ratio;

  const minHeight = compact ? 170 : 360;
  const outerPadding = compact ? 12 : 16;

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
            paddingInline: compact ? 8 : 8,
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

            // Base colours (fallback = availability, same as today)
            let baseBg = table.available ? "#dcfce7" : "#fee2e2";
            let baseBorder = table.available ? "#16a34a" : "#f97373";
            let baseText = table.available ? "#14532d" : "#991b1b";

            // Status-driven override (FOH only)
            const activeStatuses = getActiveStatuses(signals);

            // PRIMARY/SECONDARY rule:
            // - If 1 active status: fill/border = that status colour
            // - If 2+: border/glow = PRIMARY, fill = SECONDARY
            if (enableStatusDrivenColors && activeStatuses.length > 0) {
              const primary = STATUS_PALETTE[activeStatuses[0]];

              if (activeStatuses.length === 1) {
                baseBg = primary;
                baseBorder = primary;
              } else {
                const secondary = STATUS_PALETTE[activeStatuses[1]];
                baseBorder = primary;
                baseBg = secondary;
              }

              baseText = readableTextColor(baseBg);
            }

            const selectionGlow =
              enableStatusDrivenColors && activeStatuses.length > 0
                ? STATUS_PALETTE[activeStatuses[0]]
                : baseBorder;

            // Shape & size based on number of seats (circles for small, squares for others)
            let width = baseSize * 1.1 * sizeScale;
            let height = width;
            let borderRadius = "12px";

            if (table.seats <= 2) {
              width = baseSize * 1.0 * sizeScale;
              height = width;
              borderRadius = "999px"; // circle
            } else if (table.seats <= 4) {
              width = baseSize * 1.1 * sizeScale;
              height = width;
              borderRadius = "12px"; // square-ish
            } else if (table.seats <= 6) {
              width = baseSize * 1.6 * sizeScale;
              height = baseSize * 1.05 * sizeScale;
              borderRadius = "14px"; // wider rectangle
            } else {
              width = baseSize * 1.9 * sizeScale;
              height = baseSize * 1.15 * sizeScale;
              borderRadius = "16px"; // largest rectangle
            }

            const badge = (label: string, color: string) => (
              <span
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#ffffffc7",
                  color,
                  fontSize: 10,
                  padding: "4px 8px",
                  borderRadius: 999,
                  border: `1px solid ${color}33`,
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                    display: "inline-block",
                  }}
                />
                {label}
              </span>
            );

            const badges: React.ReactNode[] = [];
            if (!hideSignals) {
              if (signals.hasRequest)
                badges.push(badge(t("badgeRequest", language), "#f59e0b"));
              if (signals.hasOrder)
                badges.push(badge(t("badgeOrder", language), "#0ea5e9"));
              if (signals.inProcess)
                badges.push(badge(t("badgeInProcess", language), "#fb7185"));
              if (signals.ready)
                badges.push(badge(t("badgeReady", language), "#10b981"));
              if (signals.pickingUp)
                badges.push(badge(t("badgePickup", language), "#6366f1"));
            }

            return (
              <button
                key={table.id}
                onClick={() => onTableClick(table)}
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
                  cursor: "pointer",
                  boxShadow: isSelected
                    ? `0 0 0 4px ${hexToRgba(selectionGlow, 0.6)}`
                    : "0 4px 14px rgba(15,23,42,0.12)",
                  transform: isSelected ? "scale(1.02)" : "scale(1.0)",
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  textAlign: "left",
                  padding: 10,
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{table.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>
                    {table.seats} seats
                  </div>
                </div>

                {badges.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {badges}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      opacity: 0.8,
                    }}
                  >
                    {t("noActiveTickets", language)}
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

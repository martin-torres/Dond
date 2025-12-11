import React from "react";
import { Table, Language } from "../types";

export type TableSignal = {
  hasRequest?: boolean;
  hasOrder?: boolean;
  inProcess?: boolean;
  ready?: boolean;
  pickingUp?: boolean;
  delivered?: boolean;
};

interface FloorPlanTablePickerProps {
  tables: Table[];
  language: Language; // kept for future use
  selectedLocation: string; // 'all' or one of the table locations
  selectedTableId: string | null;
  onTableClick: (table: Table) => void;
  tableSignals?: Record<string, TableSignal>;
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
}) => {
  if (!tables || tables.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          borderRadius: 16,
          border: "2px dashed #e5e7eb",
          background: "#f9fafb",
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

  const tableCount = tables.length || 1;
  // Base size between 56px and 96px depending on how many tables total
  const minSize = 56;
  const maxSize = 96;
  const clampedCount = Math.min(Math.max(tableCount, 15), 36);
  const ratio = (clampedCount - 15) / (36 - 15); // 0 -> 1
  const baseSize = maxSize - (maxSize - minSize) * ratio;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: 360,
          borderRadius: 18,
          border: "2px dashed #ef4444",
          background:
            "linear-gradient(135deg, #ffffff 0%, #eef2ff 50%, #ede9fe 100%)",
          padding: 16,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Info line */}
        <div
          style={{
            fontSize: 11,
            color: "#475569",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <span>Floor plan</span>
          <span>
            Tables: {tables.length} • Filter:{" "}
            {selectedLocation === "all" ? "All" : selectedLocation}
          </span>
        </div>

        {/* Tables cluster */}
        <div
          style={{
            paddingInline: 8,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 12,
          }}
        >
          {tables.map((table) => {
            const matchesLocation =
              selectedLocation === "all" || table.location === selectedLocation;
            const isMuted = !matchesLocation;
            const isSelected = selectedTableId === table.id;
            const signals = tableSignals?.[table.id] ?? {};

            // Base colours
            const baseBg = table.available ? "#dcfce7" : "#fee2e2";
            const baseBorder = table.available ? "#16a34a" : "#f97373";
            const baseText = table.available ? "#14532d" : "#991b1b";

            // Shape & size based on number of seats
            let width = baseSize * 1.2;
            let height = baseSize * 0.9;
            let borderRadius = "14px";

            if (table.seats <= 2) {
              width = baseSize * 1.0;
              height = width;
              borderRadius = "9999px";
            } else if (table.seats <= 4) {
              width = baseSize * 1.1;
              height = width;
              borderRadius = "12px";
            } else if (table.seats >= 7) {
              width = baseSize * 1.6;
              height = baseSize;
              borderRadius = "16px";
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

            const badges: JSX.Element[] = [];
            if (signals.hasRequest) badges.push(badge("REQUEST", "#f59e0b"));
            if (signals.hasOrder) badges.push(badge("ORDER", "#0ea5e9"));
            if (signals.inProcess) badges.push(badge("IN PROCESS", "#fb7185"));
            if (signals.ready) badges.push(badge("READY", "#10b981"));
            if (signals.pickingUp) badges.push(badge("PICKUP", "#6366f1"));

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
                    ? "0 0 0 4px rgba(34,197,94,0.6)"
                    : "0 4px 14px rgba(15,23,42,0.12)",
                  transform: isSelected ? "scale(1.02)" : "scale(1.0)",
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  textAlign: "left",
                  padding: 10,
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ fontWeight: 800, lineHeight: 1.1 }}>
                    #{table.number}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      lineHeight: 1.1,
                      color: "#0f172a",
                      fontWeight: 600,
                    }}
                  >
                    {table.seats} seats
                  </div>
                </div>
                {badges.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    {badges}
                  </div>
                )}
                {badges.length === 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#475569",
                      opacity: 0.8,
                    }}
                  >
                    No active tickets
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

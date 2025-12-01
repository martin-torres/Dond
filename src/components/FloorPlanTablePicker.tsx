import React from "react";
import { Table, Language } from "../types";

interface FloorPlanTablePickerProps {
  tables: Table[];
  language: Language; // kept for future use
  selectedLocation: string; // 'all' or one of the table locations
  selectedTableId: string | null;
  onTableClick: (table: Table) => void;
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
  // Base size between 32px and 56px depending on how many tables total
  const minSize = 32;
  const maxSize = 56;
  const clampedCount = Math.min(Math.max(tableCount, 15), 36);
  const ratio = (clampedCount - 15) / (36 - 15); // 0 -> 1
  const baseSize = maxSize - (maxSize - minSize) * ratio;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: 220,
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
            fontSize: 10,
            color: "#6b7280",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span>Floor plan preview</span>
          <span>
            Tables: {tables.length} • Filter:{" "}
            {selectedLocation === "all" ? "All" : selectedLocation}
          </span>
        </div>

        {/* Orientation labels */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 10,
            fontSize: 10,
            color: "#6b7280",
          }}
        >
          BAR
        </div>
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 10,
            fontSize: 10,
            color: "#6b7280",
          }}
        >
          STAGE
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 6,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            color: "#6b7280",
          }}
        >
          MAIN DOOR
        </div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: 10,
            transform: "translateY(-50%)",
            fontSize: 10,
            color: "#6b7280",
            textAlign: "right",
          }}
        >
          WINDOWS
        </div>

        {/* Tables cluster */}
        <div
          style={{
            marginTop: 16,
            paddingInline: 8,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {tables.map((table) => {
            const matchesLocation =
              selectedLocation === "all" || table.location === selectedLocation;
            const isMuted = !matchesLocation;
            const isSelected = selectedTableId === table.id;
            const isAvailable = table.available;

            // Base colours
            const baseBg = isAvailable ? "#dcfce7" : "#fee2e2";
            const baseBorder = isAvailable ? "#16a34a" : "#f97373";
            const baseText = isAvailable ? "#14532d" : "#991b1b";

            // Shape & size based on number of seats
            let width = baseSize;
            let height = baseSize;
            let borderRadius = "9999px"; // full circle by default

            if (table.seats <= 2) {
              // small round (bar stool / tiny table)
              width = baseSize * 0.85;
              height = width;
              borderRadius = "9999px";
            } else if (table.seats <= 4) {
              // medium square
              width = baseSize * 1.0;
              height = width;
              borderRadius = "12px";
            } else if (table.seats <= 6) {
              // wider rectangle (larger table)
              width = baseSize * 1.4;
              height = baseSize * 0.9;
              borderRadius = "14px";
            } else {
              // biggest rectangle for 7–8+ seats
              width = baseSize * 1.6;
              height = baseSize;
              borderRadius = "16px";
            }

            return (
              <button
                key={table.id}
                onClick={() => onTableClick(table)}
                disabled={!isAvailable || isMuted}
                style={{
                  width,
                  height,
                  borderRadius,
                  border: `2px solid ${baseBorder}`,
                  background: baseBg,
                  color: baseText,
                  fontSize: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  opacity: isMuted ? 0.15 : 1,
                  cursor:
                    !isAvailable || isMuted ? "not-allowed" : "pointer",
                  boxShadow: isSelected
                    ? "0 0 0 3px rgba(34,197,94,0.5)"
                    : "0 1px 2px rgba(15,23,42,0.1)",
                  transform: isSelected ? "scale(1.05)" : "scale(1.0)",
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  textAlign: "center",
                  paddingInline: 4,
                }}
              >
                <div style={{ fontWeight: 700, lineHeight: 1 }}>
                  #{table.number}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    lineHeight: 1.1,
                    marginTop: 2,
                  }}
                >
                  {table.seats} seats
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FloorPlanTablePicker;

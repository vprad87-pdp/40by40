import { useState, useEffect } from "react";
import BottomSheet from "../layout/BottomSheet";

export default function FuzzyGoalSheet({ goal, milestone, accentColor, onSave, onClose, isOpen }) {
  const [pct, setPct] = useState(milestone?.progress_pct ?? 0);
const [note, setNote] = useState(milestone?.notes ?? "");
const [isDone, setIsDone] = useState(milestone?.is_done ?? false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Sync when milestone data changes (e.g. after tab switch + refetch)
useEffect(() => {
  setPct(milestone?.progress_pct ?? 0);
  setNote(milestone?.notes ?? "");
  setIsDone(milestone?.is_done ?? false);
}, [milestone]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

 async function handleSave() {
  setSaving(true);
  const result = await onSave(goal.id, pct, note, isDone);  // ← separate args, not object
  setSaving(false);
  if (result?.error) {
    showToast("Error saving. Please try again.");
  } else {
    showToast("Progress saved! 🎯");
    setTimeout(() => onClose(), 1500);
  }
}

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={goal.title}
        accentColor={accentColor}
        footer={
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              background: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px",
              fontFamily: "Outfit, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>
        }
      >
        <div style={{ padding: "20px 20px 32px" }}>

          {/* Progress % */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: "#7A8F7A",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                Progress
              </label>
              <span style={{
                fontFamily: "Lora, serif",
                fontSize: 20,
                fontWeight: 700,
                color: accentColor,
              }}>
                {pct}%
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={pct}
              onChange={e => setPct(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: accentColor,
                height: 6,
                cursor: "pointer",
              }}
            />

            <div style={{
              height: 6,
              borderRadius: 6,
              background: "#E8F0E8",
              marginTop: 8,
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                borderRadius: 6,
                background: accentColor,
                width: `${pct}%`,
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>

          {/* Note */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: "#7A8F7A",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: 8,
            }}>
              Notes
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="How's it going? Any updates..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #D8E4D8",
                background: "#F7F9F7",
                fontFamily: "Outfit, sans-serif",
                fontSize: 14,
                color: "#1C2B1C",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Mark as done */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: isDone ? "#F0FAF4" : "#F7F9F7",
            border: `1px solid ${isDone ? "#A7F3D0" : "#D8E4D8"}`,
            borderRadius: 12,
            padding: "14px 16px",
          }}>
            <div>
              <p style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: "#1C2B1C",
                margin: "0 0 2px",
              }}>
                Mark as completed
              </p>
              <p style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 12,
                color: "#7A8F7A",
                margin: 0,
              }}>
                {isDone ? "🎉 Goal achieved!" : "Flip when fully done"}
              </p>
            </div>
            <div
              onClick={() => setIsDone(!isDone)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: isDone ? "#2E7D52" : "#D8E4D8",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute",
                top: 2,
                left: isDone ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
              }} />
            </div>
          </div>

        </div>
      </BottomSheet>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 90,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#3D2B1F",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: 20,
          fontFamily: "Outfit, sans-serif",
          fontSize: 14,
          zIndex: 300,
          whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}
    </>
  );
}
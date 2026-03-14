// src/components/layout/BottomSheet.jsx
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Reusable slide-up bottom sheet.
 *
 * Props:
 *   isOpen    {boolean}   — show/hide
 *   onClose   {function}  — called on backdrop click or X tap
 *   title     {string}    — header text
 *   emoji     {string}    — optional emoji beside title
 *   accentColor {string}  — hex colour for the top drag pill + title
 *   children  {ReactNode}
 */
export default function BottomSheet({
  isOpen,
  onClose,
  title,
  emoji,
  accentColor = "var(--sage)",
  children,
}) {
  const sheetRef = useRef(null);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(28,43,28,0.55)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Sheet ────────────────────────────────────────────────────── */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl flex flex-col
          transition-transform duration-350 ease-out
          ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{
          background:   "var(--surface)",
          maxHeight:    "88vh",
          boxShadow:    "0 -8px 32px rgba(28,43,28,0.18)",
        }}
      >
        {/* Drag pill */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div
            className="w-10 h-1 rounded-full opacity-40"
            style={{ background: accentColor }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pb-3 pt-1 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            {emoji && (
              <span className="text-xl leading-none">{emoji}</span>
            )}
            <h2
              className="text-lg font-semibold leading-tight"
              style={{ fontFamily: "Lora, serif", color: "var(--brown)" }}
            >
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
              transition-colors duration-150"
            style={{
              background: "var(--surface2)",
              color:       "var(--muted)",
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );
}

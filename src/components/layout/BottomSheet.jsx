// src/components/layout/BottomSheet.jsx
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  emoji,
  accentColor = "#7A9E7E",
  children,
  footer,
}) {
  const sheetRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position:      "fixed",
          inset:         0,
          zIndex:        40,
          background:    "rgba(28,43,28,0.55)",
          opacity:       isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition:    "opacity 0.3s",
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position:    "fixed",
          bottom:      0,
          left:        0,
          right:       0,
          zIndex:      50,
          borderRadius:"20px 20px 0 0",
          background:  "#FFFFFF",
          maxHeight:   "88vh",
          boxShadow:   "0 -4px 24px rgba(28,43,28,0.15)",
          transform:   isOpen ? "translateY(0)" : "translateY(100%)",
          transition:  "transform 0.35s ease-out",
          display:     "flex",
          flexDirection:"column",
        }}
      >
        {/* Drag pill */}
        <div style={{
          display:        "flex",
          justifyContent: "center",
          padding:        "10px 0 6px",
          flexShrink:     0,
        }}>
          <div style={{
            width:        36,
            height:       4,
            borderRadius: 2,
            background:   accentColor,
            opacity:      0.35,
          }} />
        </div>

        {/* Header */}
        {title && (
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "8px 16px 12px",
            borderBottom:   "1px solid #E8F0E8",
            flexShrink:     0,
            background:     "#FFFFFF",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {emoji && (
                <span style={{ fontSize: 20, lineHeight: 1 }}>{emoji}</span>
              )}
              <h2 style={{
                fontFamily: "Lora, serif",
                fontSize:   18,
                fontWeight: 600,
                color:      "#3D2B1F",
                margin:     0,
              }}>
                {title}
              </h2>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width:          34,
                height:         34,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                borderRadius:   "50%",
                background:     "#F0F4F0",
                color:          "#7A8F7A",
                border:         "none",
                cursor:         "pointer",
                flexShrink:     0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{
          flex:                   1,
          overflowY:              "auto",
          WebkitOverflowScrolling:"touch",
          overscrollBehavior:     "contain",
          paddingBottom:          80,
        }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            flexShrink:   0,
            padding:      "12px 16px 72px",
            borderTop:    "1px solid #E8F0E8",
            background:   "#FFFFFF",
          }}>
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
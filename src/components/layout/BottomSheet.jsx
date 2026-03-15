// src/components/layout/BottomSheet.jsx
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  emoji,
  accentColor = "var(--sage)",
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
    return () => {
      document.body.style.overflow = "";
    };
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
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(28,43,28,0.55)',
          transition: 'opacity 0.3s',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderRadius: '16px 16px 0 0',
          background: 'var(--surface)',
          maxHeight: '92vh',
          boxShadow: '0 -8px 32px rgba(28,43,28,0.18)',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s ease-out',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drag pill */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            background: accentColor,
            opacity: 0.4,
          }} />
        </div>

        {/* Header — only shown if title prop is passed */}
        {title && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 20px 12px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {emoji && <span style={{ fontSize: '20px', lineHeight: 1 }}>{emoji}</span>}
              <h2 style={{
                fontFamily: 'Lora, serif',
                color: 'var(--brown)',
                fontSize: '18px',
                fontWeight: 600,
              }}>
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'var(--surface2)',
                color: 'var(--muted)',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}>
          {children}
        </div>

        {/* Fixed footer — buttons always visible */}
        {footer && (
          <div style={{
            flexShrink: 0,
            padding: '12px 16px 24px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
          }}>
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
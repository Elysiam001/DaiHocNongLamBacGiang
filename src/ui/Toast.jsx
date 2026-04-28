import React, { useEffect } from "react";

export default function Toast({ message, variant = "error", onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), 2600);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast--${variant}`} role="status" aria-live="polite">
      <div className="toast__inner">{message}</div>
      <button className="toast__close" onClick={onClose} aria-label="Đóng">
        ×
      </button>
    </div>
  );
}


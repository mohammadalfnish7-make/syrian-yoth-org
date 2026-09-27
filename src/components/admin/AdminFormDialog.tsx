"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type AdminFormDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function AdminFormDialog({
  open,
  title,
  onClose,
  children,
}: AdminFormDialogProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="admin-dialog" onClick={() => onCloseRef.current()}>
      <div
        className="admin-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-dialog__header">
          <h3 id="admin-dialog-title" className="admin-card__title">
            {title}
          </h3>
          <button
            type="button"
            className="admin-btn-icon"
            onClick={() => onCloseRef.current()}
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

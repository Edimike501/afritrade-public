"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[maxWidth];

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ position: "fixed", inset: 0, zIndex: 110 }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full z-10 bg-card text-foreground rounded-lg border border-border shadow-md p-6 overflow-hidden transition-all duration-200",
          maxWidthClass,
          className
        )}
        style={{ position: "relative", zIndex: 10 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <h2
              id="modal-title"
              className="font-display font-bold text-xl text-foreground tracking-tight"
            >
              {title}
            </h2>
            {description && (
              <p
                id="modal-description"
                className="text-xs text-muted-foreground mt-1"
              >
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 -mt-2 p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-4 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* Footer Actions */}
        {footer && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document !== "undefined" && document.body) {
    return createPortal(content, document.body);
  }

  return content;
}

export const Dialog = Modal;

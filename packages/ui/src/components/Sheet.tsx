"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  side?: "left" | "right";
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  side = "right",
  children,
  footer,
  className,
}: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

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

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || "Slide-over panel"}
      className="fixed inset-0 z-50 flex overflow-hidden"
      style={{ position: "fixed", inset: 0, zIndex: 100 }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        ref={sheetRef}
        className={cn(
          "relative z-10 w-full max-w-md bg-card text-foreground shadow-md flex flex-col h-full border-border transition-transform duration-250 ease-out",
          side === "left" ? "mr-auto border-r" : "ml-auto border-l",
          className
        )}
        style={{
          position: "relative",
          zIndex: 10,
          marginLeft: side === "right" ? "auto" : undefined,
          marginRight: side === "left" ? "auto" : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border/40 gap-4 shrink-0">
          <div>
            {title && (
              <h2 className="font-display font-bold text-lg text-foreground tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 -mt-2 p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-4 border-t border-border/40 bg-muted/20 flex items-center justify-end gap-3 shrink-0">
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

export const Drawer = Sheet;

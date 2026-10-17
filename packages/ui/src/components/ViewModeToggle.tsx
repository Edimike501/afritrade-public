"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "../lib/utils";

export type ViewMode = "grid" | "list";

export interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewModeToggle({
  mode,
  onChange,
  className,
}: ViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="View presentation toggle"
      className={cn(
        "inline-flex items-center rounded-sm border border-border bg-muted/40 p-0.5 select-none",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-pressed={mode === "grid"}
        aria-label="Grid view"
        title="Grid view"
        className={cn(
          "inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xs px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring gap-1.5",
          mode === "grid"
            ? "bg-card text-foreground shadow-xs font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid size={18} />
        <span className="hidden sm:inline">Grid</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("list")}
        aria-pressed={mode === "list"}
        aria-label="List view"
        title="List view"
        className={cn(
          "inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xs px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring gap-1.5",
          mode === "list"
            ? "bg-card text-foreground shadow-xs font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List size={18} />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
}

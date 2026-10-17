import React from "react";
import { cn } from "../lib/utils";

export interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtitle,
  icon,
  isLoading = false,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card p-5 shadow-sm flex flex-col justify-between transition-all hover:border-border/80",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
          {label}
        </span>
        {icon && (
          <div className="p-2 rounded-sm bg-muted/50 text-primary shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded-xs" />
        ) : (
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight tabular-nums">
            {value}
          </div>
        )}

        {subtitle && (
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

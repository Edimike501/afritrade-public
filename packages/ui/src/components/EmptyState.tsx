import React from "react";
import { Package } from "lucide-react";
import { cn } from "../lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6 select-none",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-muted/60 text-primary flex items-center justify-center mb-4 shrink-0 shadow-xs">
        {icon || <Package size={30} />}
      </div>

      <h3 className="font-display font-bold text-lg text-foreground tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground max-w-md mt-1.5 leading-relaxed">
        {description}
      </p>

      {action && <div className="mt-6 inline-flex">{action}</div>}
    </div>
  );
}

"use client";

import React from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "../lib/utils";

export interface VerificationWarningBannerProps {
  title?: string;
  description?: string;
  submittedAt?: string | null;
  className?: string;
}

export function VerificationWarningBanner({
  title = "Notice: Updating KYB Details or Documents May Extend Verification Duration",
  description = "You can modify your statutory KYB registration details and supporting documents while your profile has not yet been approved. Please note that saving changes or replacing documents resets your review timestamp in the compliance queue and may extend verification duration by 24–48 hours.",
  submittedAt,
  className,
}: VerificationWarningBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-foreground flex items-start gap-3.5",
        className,
      )}
    >
      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
        <AlertTriangle size={18} />
      </div>
      <div className="space-y-1 flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display font-bold text-sm text-amber-900 dark:text-amber-200">
            {title}
          </p>
          {submittedAt && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
              <Clock size={12} />
              <span>Last queued: {new Date(submittedAt).toLocaleString()}</span>
            </span>
          )}
        </div>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

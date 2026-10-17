import React from "react";
import { Info } from "lucide-react";
import {
  formatMoney,
  calculateIndicativeEquivalent,
  DEFAULT_INDICATIVE_RATES,
} from "@afritrade/shared";
import { cn } from "../lib/utils";

export interface PriceDisplayProps {
  amount: string | number;
  currency: string;
  preferredCurrency?: string;
  rates?: Record<string, number>;
  unitLabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({
  amount,
  currency,
  preferredCurrency,
  rates = DEFAULT_INDICATIVE_RATES,
  unitLabel,
  size = "md",
  className,
}: PriceDisplayProps) {
  const priceMinor =
    typeof amount === "string"
      ? Math.round(Number(amount) * 100) /* policy-allow: display-only minor conversion */
      : Math.round(amount * 100);

  const isDifferentCurrency =
    preferredCurrency && preferredCurrency !== currency;

  const indicative = isDifferentCurrency
    ? calculateIndicativeEquivalent(
        priceMinor,
        currency,
        preferredCurrency,
        rates
      )
    : null;

  const sizeClasses = {
    sm: {
      primary: "text-sm font-bold",
      secondary: "text-[11px]",
      pill: "text-[10px] px-1 py-0.2",
    },
    md: {
      primary: "text-base font-extrabold",
      secondary: "text-xs",
      pill: "text-[11px] px-1.5 py-0.5",
    },
    lg: {
      primary: "text-2xl font-extrabold",
      secondary: "text-sm",
      pill: "text-xs px-2 py-0.5",
    },
  }[size];

  return (
    <div className={cn("flex flex-col leading-tight select-none", className)}>
      {/* Primary Settlement Line (DESIGN.md §8.1) */}
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span
          className={cn(
            "tabular-nums text-foreground tracking-tight",
            sizeClasses.primary
          )}
        >
          {formatMoney(amount, currency)}
        </span>

        {unitLabel && (
          <span className="text-xs text-muted-foreground font-medium">
            {unitLabel}
          </span>
        )}

        <span
          className={cn(
            "rounded-xs bg-muted font-mono font-semibold text-muted-foreground uppercase border border-border/80",
            sizeClasses.pill
          )}
          title={`Settlement Currency: ${currency}`}
        >
          {currency}
        </span>
      </div>

      {/* Secondary Indicative Conversion Line (DESIGN.md §8.1) */}
      {indicative && (
        <div
          className={cn(
            "flex items-center gap-1 text-muted-foreground mt-0.5 group",
            sizeClasses.secondary
          )}
          title="Billed in supplier currency. Converted price is indicative only."
        >
          <span className="tabular-nums font-medium">
            ≈ {indicative.formatted}
          </span>
          <span className="text-[11px] opacity-75">(indicative)</span>
          <Info
            size={12}
            className="text-muted-foreground/80 group-hover:text-primary transition-colors cursor-help"
          />
        </div>
      )}
    </div>
  );
}

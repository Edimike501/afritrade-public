"use client";

import React from "react";
import { Coins, ChevronDown, Check } from "lucide-react";
import { cn } from "../lib/utils";

export interface CurrencyOption {
  code: string;
  name?: string;
  symbol?: string;
  flag?: string;
}

export const DEFAULT_CURRENCIES: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵", flag: "🇬🇭" },
];

export interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  currencies?: CurrencyOption[];
  className?: string;
}

export function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  currencies = DEFAULT_CURRENCIES,
  className,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const activeOption =
    currencies.find((c) => c.code === selectedCurrency) || currencies[0];

  return (
    <div ref={containerRef} className={cn("relative inline-block select-none", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current indicative viewing currency: ${activeOption.code}`}
        className="inline-flex items-center justify-between min-w-[44px] min-h-[44px] px-3 py-2 rounded-sm border border-border bg-card hover:bg-muted/50 text-foreground text-xs font-semibold tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring gap-2 shadow-xs"
      >
        <span className="flex items-center gap-1.5 font-mono">
          <Coins size={16} className="text-primary" />
          <span>{activeOption.code}</span>
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-muted-foreground transition-transform duration-150",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select indicative currency"
          className="absolute right-0 mt-1.5 w-48 rounded-md border border-border bg-popover text-popover-foreground shadow-md p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 mb-1">
            Indicative View Currency
          </div>

          <div className="space-y-0.5">
            {currencies.map((curr) => {
              const isSelected = curr.code === selectedCurrency;
              return (
                <button
                  key={curr.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onCurrencyChange(curr.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between min-h-[38px] px-2.5 py-1.5 rounded-xs text-xs transition-colors text-left",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 font-mono">
                    {curr.flag && <span className="text-sm">{curr.flag}</span>}
                    <span className="font-bold">{curr.code}</span>
                    {curr.name && (
                      <span
                        className={cn(
                          "text-[11px] truncate max-w-[80px]",
                          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}
                      >
                        {curr.name}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useBuyerCurrency } from "@/context/CurrencyContext";
import { Dropdown } from "@afritrade/ui";

interface CurrencySelectorProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "subtle" | "ghost";
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$ USD",
  NGN: "₦ NGN",
  ZAR: "R ZAR",
  GHS: "GH₵ GHS",
};

export function CurrencySelector({
  className = "",
  showLabel = true,
  size,
  variant = "default",
}: CurrencySelectorProps) {
  const { buyerCurrency, setBuyerCurrency, availableCurrencies } = useBuyerCurrency();

  const options = availableCurrencies.map((curr) => ({
    value: curr,
    label: CURRENCY_SYMBOLS[curr] || curr,
    badge: curr,
  }));

  const effectiveSize = size || (showLabel ? "md" : "sm");

  return (
    <div
      className={`currency-selector-wrap ${className}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      {showLabel && (
        <label
          htmlFor="currency-select-input"
          className="muted"
          style={{ fontSize: "0.85rem", whiteSpace: "nowrap", margin: 0 }}
        >
          Viewing Currency:
        </label>
      )}
      <Dropdown
        id="currency-select-input"
        value={buyerCurrency}
        onChange={(val) => setBuyerCurrency(val)}
        options={options}
        size={effectiveSize}
        variant={variant}
        fullWidth={false}
        showSearch={false}
        aria-label="Select preferred viewing currency"
        triggerClassName="currency-selector-trigger"
      />
    </div>
  );
}

"use client";

import { useBuyerCurrency } from "@/context/CurrencyContext";
import {
  formatMoney,
  calculateIndicativeEquivalent,
  DEFAULT_INDICATIVE_RATES,
} from "@afritrade/shared";

export interface PriceDisplayProps {
  amount: string | number;
  currency: string;
  preferredCurrency?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function PriceDisplay({
  amount,
  currency,
  preferredCurrency: customPref,
  className = "",
  size = "md",
  showLabel = true,
}: PriceDisplayProps) {
  const { buyerCurrency } = useBuyerCurrency();
  const targetCurrency = customPref || buyerCurrency || "USD";

  const priceMinor =
    typeof amount === "string"
      ? Math.round(Number(amount) * 100)
      : Math.round(amount * 100);

  const isDifferentCurrency = targetCurrency && targetCurrency !== currency;
  const indicative = isDifferentCurrency
    ? calculateIndicativeEquivalent(
        priceMinor,
        currency,
        targetCurrency,
        DEFAULT_INDICATIVE_RATES
      )
    : null;

  return (
    <div className={`price-display price-display-${size} ${className}`}>
      {/* Primary: Supplier Listed Currency (The actual legal/settlement currency) */}
      <div className="price-primary">
        <span>{formatMoney(amount, currency)}</span>
        <span className="currency-code-pill" title={`Supplier listing currency: ${currency}`}>
          {currency}
        </span>
      </div>

      {/* Secondary: Converted Indicative Price in Buyer's Currency */}
      {indicative && (
        <div className="price-conversion">
          <span className="conversion-value">
            ≈ {indicative.formatted}
          </span>
          <span className="currency-code-pill secondary-pill" title={`Your viewing currency: ${targetCurrency}`}>
            {targetCurrency}
          </span>
          {showLabel && (
            <span className="tag-indicative" title="Indicative exchange conversion for comparison">
              indicative
            </span>
          )}
        </div>
      )}
    </div>
  );
}

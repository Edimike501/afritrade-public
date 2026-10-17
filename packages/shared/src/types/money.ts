/**
 * Money is stored as Postgres Decimal and travels over the API as a decimal
 * STRING (e.g. "12500.00") — never a JS float. Currency is always an explicit
 * ISO code from the `currencies` table. The frontend only formats for display.
 */
export function formatMoney(amount: string | number, currencyCode: string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

/** Multiply a decimal-string price by an integer quantity, returning a 2dp string. */
export function multiplyMoney(unitPrice: string, quantity: number): string {
  const cents = Math.round(Number(unitPrice) * 100) * quantity;
  return (cents / 100).toFixed(2);
}

export interface IndicativeRate {
  baseCurrency: "USD";
  targetCurrency: "NGN" | "ZAR" | "GHS" | "USD";
  ratePerUsd: number; // e.g. 1500 for NGN, 18 for ZAR, 15 for GHS, 1 for USD
  updatedAt: string;
}

export const DEFAULT_INDICATIVE_RATES: Record<string, number> = {
  USD: 1.0,
  NGN: 1550.0,
  ZAR: 18.5,
  GHS: 15.2,
};

/**
 * Calculates indicative equivalent in the viewer's preferred currency.
 * Returns null if the preferred currency is identical to the listed currency.
 * Uses minor unit arithmetic to avoid floating point drift.
 */
export function calculateIndicativeEquivalent(
  amountMinor: number | string,
  sourceCurrency: string,
  targetCurrency: string,
  rates: Record<string, number>,
): { amountMinor: number; formatted: string } | null {
  if (sourceCurrency === targetCurrency) return null;
  const numMinor = typeof amountMinor === "string" ? Number(amountMinor) : amountMinor;
  const sourcePerUsd = rates[sourceCurrency] || 1;
  const targetPerUsd = rates[targetCurrency] || 1;
  // Convert minor units: (amount in source / sourceRate) * targetRate
  const convertedMinor = Math.round((numMinor / sourcePerUsd) * targetPerUsd);
  return {
    amountMinor: convertedMinor,
    formatted: formatMoney(convertedMinor / 100, targetCurrency),
  };
}

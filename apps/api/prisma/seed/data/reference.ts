// Reference data. Adding a market = add a row here (or via admin tooling later) and re-run the seed.
export const COUNTRIES = [
  { name: "Nigeria", isoCode: "NG" },
  { name: "South Africa", isoCode: "ZA" },
  { name: "Ghana", isoCode: "GH" },
];

export const CURRENCIES = [
  { code: "NGN", minorUnitExponent: 2, isLive: true, paymentProvider: "MOCK" as const },
  { code: "ZAR", minorUnitExponent: 2, isLive: false, paymentProvider: "MOCK" as const },
  { code: "GHS", minorUnitExponent: 2, isLive: false, paymentProvider: "MOCK" as const },
  { code: "USD", minorUnitExponent: 2, isLive: false, paymentProvider: "MOCK" as const },
];

export const INDICATIVE_RATES = [
  { targetCurrency: "NGN", ratePerUsd: 1550 },
  { targetCurrency: "ZAR", ratePerUsd: 18.5 },
  { targetCurrency: "GHS", ratePerUsd: 15.2 },
  { targetCurrency: "USD", ratePerUsd: 1 },
];

/** Local currency per country — used only by the seed to price sample products. */
export const COUNTRY_CURRENCY: Record<string, { code: string; perUsd: number }> = {
  NG: { code: "NGN", perUsd: 1550 },
  ZA: { code: "ZAR", perUsd: 18.5 },
  GH: { code: "GHS", perUsd: 15.2 },
};

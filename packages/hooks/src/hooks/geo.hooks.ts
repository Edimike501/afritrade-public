import { useQuery } from "@tanstack/react-query";
import { getCountries, getCurrencies, getExchangeRates } from "../api/geo.api";

export const geoKeys = {
  all: ["geo"] as const,
  countries: () => [...geoKeys.all, "countries"] as const,
  currencies: () => [...geoKeys.all, "currencies"] as const,
  rates: () => [...geoKeys.all, "rates"] as const,
};

export function useCountries() {
  return useQuery({
    queryKey: geoKeys.countries(),
    queryFn: () => getCountries(),
  });
}

export function useCurrencies() {
  return useQuery({
    queryKey: geoKeys.currencies(),
    queryFn: () => getCurrencies(),
  });
}

export function useExchangeRates() {
  return useQuery({
    queryKey: geoKeys.rates(),
    queryFn: () => getExchangeRates(),
    staleTime: 5 * 60 * 1000,
  });
}

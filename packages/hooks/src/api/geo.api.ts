import { defaultApiClient, type ApiClient } from "../client";

export interface CountryDto {
  id: string;
  name: string;
  isoCode: string;
}

export interface CurrencyDto {
  id: string;
  code: string;
}

export async function getCountries(client: ApiClient = defaultApiClient): Promise<CountryDto[]> {
  const res = await client.get<CountryDto[]>("/countries");
  return res.data;
}

export async function getCurrencies(client: ApiClient = defaultApiClient): Promise<CurrencyDto[]> {
  const res = await client.get<CurrencyDto[]>("/currencies");
  return res.data;
}

export async function getExchangeRates(
  client: ApiClient = defaultApiClient,
): Promise<Record<string, number>> {
  const res = await client.get<Record<string, number>>("/currencies/rates");
  return res.data;
}

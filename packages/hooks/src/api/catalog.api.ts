import { defaultApiClient, type ApiClient } from "../client";
import {
  CreateProductSchema,
  UpdateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "@afritrade/shared";

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  currencyId?: string;
  currency?: {
    id?: string;
    code: string;
    isLive?: boolean;
  };
  currencyCode?: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt?: string;
  businessProfile?: {
    id: string;
    businessName: string;
    country: { isoCode: string; name: string };
  };
  supplier?: {
    id: string;
    businessName: string;
    countryCode: string;
    countryName: string;
  };
}

export function normalizeProduct(p: any): ProductDto {
  const currencyCode =
    p.currencyCode ??
    p.currency?.code ??
    (typeof p.currency === "string" ? p.currency : "USD");

  const businessName =
    p.supplier?.businessName ??
    p.businessProfile?.businessName ??
    "Verified Supplier";

  const countryName =
    p.supplier?.countryName ??
    p.businessProfile?.country?.name ??
    p.businessProfile?.country?.isoCode ??
    "";

  const countryCode =
    p.supplier?.countryCode ??
    p.businessProfile?.country?.isoCode ??
    "";

  return {
    ...p,
    currencyCode,
    supplier: p.supplier ?? {
      id: p.businessProfile?.id ?? p.businessProfileId ?? "",
      businessName,
      countryCode,
      countryName,
    },
    businessProfile: p.businessProfile ?? {
      id: p.supplier?.id ?? "",
      businessName,
      country: { isoCode: countryCode, name: countryName },
    },
  };
}

export interface ProductQueryParams {
  country?: string;
  category?: string;
  search?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts extends Array<ProductDto> {
  items: ProductDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function createPaginatedProducts(
  items: ProductDto[],
  meta?: { page?: number; limit?: number; total?: number },
): PaginatedProducts {
  const page = meta?.page ?? 1;
  const limit = meta?.limit ?? (items.length || 20);
  const total = meta?.total ?? items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const result = [...items] as PaginatedProducts;
  result.items = items;
  result.total = total;
  result.page = page;
  result.limit = limit;
  result.totalPages = totalPages;
  return result;
}

export async function getProducts(
  params?: ProductQueryParams,
  client: ApiClient = defaultApiClient,
): Promise<PaginatedProducts> {
  const query = new URLSearchParams();
  if (params?.country) query.set("country", params.country);
  if (params?.category) query.set("category", params.category);
  const search = params?.q ?? params?.search;
  if (search) query.set("q", search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  const res = await client.get<ProductDto[]>(`/products${qs ? `?${qs}` : ""}`);
  const rawItems = Array.isArray(res.data) ? res.data : [];
  const items = rawItems.map(normalizeProduct);
  return createPaginatedProducts(items, {
    page: res.meta?.page ?? (params?.page ?? 1),
    limit: res.meta?.limit ?? (params?.limit ?? 12),
    total: res.meta?.total ?? items.length,
  });
}

export async function getProductById(id: string, client: ApiClient = defaultApiClient): Promise<ProductDto> {
  const res = await client.get<ProductDto>(`/products/${id}`);
  return normalizeProduct(res.data);
}

export async function getSupplierProducts(client: ApiClient = defaultApiClient): Promise<ProductDto[]> {
  const res = await client.get<ProductDto[]>("/supplier/products");
  return Array.isArray(res.data) ? res.data.map(normalizeProduct) : [];
}

export async function createProduct(
  input: CreateProductInput,
  client: ApiClient = defaultApiClient,
): Promise<ProductDto> {
  const validated = CreateProductSchema.parse(input);
  const res = await client.post<ProductDto>("/supplier/products", validated);
  return normalizeProduct(res.data);
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
  client: ApiClient = defaultApiClient,
): Promise<ProductDto> {
  const validated = UpdateProductSchema.parse(input);
  const res = await client.patch<ProductDto>(`/supplier/products/${id}`, validated);
  return normalizeProduct(res.data);
}

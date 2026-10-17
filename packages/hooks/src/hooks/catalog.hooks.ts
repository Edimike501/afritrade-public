import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProductById,
  getSupplierProducts,
  createProduct,
  updateProduct,
  type ProductQueryParams,
} from "../api/catalog.api";
import type { CreateProductInput, UpdateProductInput } from "@afritrade/shared";
import { dashboardKeys } from "./dashboard.hooks";

export interface CatalogQueryOptions {
  refetchInterval?: number | false;
}

export const catalogKeys = {
  all: ["catalog"] as const,
  list: (params?: ProductQueryParams) => [...catalogKeys.all, "list", params ?? {}] as const,
  detail: (id: string) => [...catalogKeys.all, "detail", id] as const,
  supplier: () => [...catalogKeys.all, "supplier"] as const,
};

export function useProducts(params?: ProductQueryParams, options?: CatalogQueryOptions) {
  return useQuery({
    queryKey: catalogKeys.list(params),
    queryFn: () => getProducts(params),
    refetchInterval: options?.refetchInterval,
  });
}

export function useProduct(id: string, options?: CatalogQueryOptions) {
  return useQuery({
    queryKey: catalogKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
    refetchInterval: options?.refetchInterval,
  });
}

export function useSupplierProducts(options?: CatalogQueryOptions) {
  return useQuery({
    queryKey: catalogKeys.supplier(),
    queryFn: () => getSupplierProducts(),
    refetchInterval: options?.refetchInterval,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) => updateProduct(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: catalogKeys.supplier() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  getAdminOrders,
  getSupplierOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  type CreateOrderInput,
  type CancelOrderInput,
} from "../api/orders.api";
import { dashboardKeys } from "./dashboard.hooks";

export interface OrderQueryOptions {
  refetchInterval?: number | false;
}

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  admin: () => [...orderKeys.all, "admin"] as const,
  supplier: () => [...orderKeys.all, "supplier"] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export function useOrders(options?: OrderQueryOptions) {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => getOrders(),
    refetchInterval: options?.refetchInterval,
  });
}

export const useBuyerOrders = useOrders;

export function useAdminOrders(options?: OrderQueryOptions) {
  return useQuery({
    queryKey: orderKeys.admin(),
    queryFn: () => getAdminOrders(),
    refetchInterval: options?.refetchInterval,
  });
}

export function useSupplierOrders(options?: OrderQueryOptions) {
  return useQuery({
    queryKey: orderKeys.supplier(),
    queryFn: () => getSupplierOrders(),
    refetchInterval: options?.refetchInterval,
  });
}

export function useOrder(id: string, options?: OrderQueryOptions) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrderById(id),
    enabled: Boolean(id),
    refetchInterval: options?.refetchInterval,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: CancelOrderInput }) =>
      cancelOrder(orderId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

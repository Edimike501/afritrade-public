import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payOrder, initiatePayment, verifyPayment, type PaymentInitInput } from "../api/payments.api";
import { orderKeys } from "./orders.hooks";
import { dashboardKeys } from "./dashboard.hooks";

export const paymentKeys = {
  all: ["payments"] as const,
  verify: (reference: string) => [...paymentKeys.all, "verify", reference] as const,
};

export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => payOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PaymentInitInput) => initiatePayment(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useVerifyPayment(reference: string) {
  return useQuery({
    queryKey: paymentKeys.verify(reference),
    queryFn: () => verifyPayment(reference),
    enabled: Boolean(reference),
  });
}

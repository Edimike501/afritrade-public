import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLogisticsPartners,
  updateOrderShipment,
  createLogisticsPartner,
  updateLogisticsPartner,
  type LogisticsPartnerDto,
  type UpdateShipmentInput,
  type UpsertLogisticsPartnerInput,
} from "../api/logistics.api";

export const logisticsKeys = {
  all: ["logistics"] as const,
  partners: () => [...logisticsKeys.all, "partners"] as const,
};

export function useLogisticsPartners() {
  return useQuery({
    queryKey: logisticsKeys.partners(),
    queryFn: () => getLogisticsPartners(),
  });
}

import { dashboardKeys } from "./dashboard.hooks";

export function useUpdateOrderShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: UpdateShipmentInput }) =>
      updateOrderShipment(orderId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: logisticsKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useCreateLogisticsPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertLogisticsPartnerInput) =>
      createLogisticsPartner(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logisticsKeys.partners() });
    },
  });
}

export function useUpdateLogisticsPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UpsertLogisticsPartnerInput> }) =>
      updateLogisticsPartner(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logisticsKeys.partners() });
    },
  });
}

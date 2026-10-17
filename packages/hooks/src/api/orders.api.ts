import { defaultApiClient, type ApiClient } from "../client";
import {
  CreateOrderSchema,
  CancelOrderSchema,
  type CreateOrderInput,
  type CancelOrderInput,
  type OrderDto,
  type OrderItemDto,
} from "@afritrade/shared";

export type { CreateOrderInput, CancelOrderInput, OrderDto, OrderItemDto };

export async function getOrders(client: ApiClient = defaultApiClient): Promise<OrderDto[]> {
  const res = await client.get<OrderDto[]>("/orders");
  return res.data;
}

export const getBuyerOrders = getOrders;

export async function getAdminOrders(client: ApiClient = defaultApiClient): Promise<OrderDto[]> {
  const res = await client.get<OrderDto[]>("/admin/orders");
  return res.data;
}

export async function getSupplierOrders(client: ApiClient = defaultApiClient): Promise<OrderDto[]> {
  const res = await client.get<OrderDto[]>("/supplier/orders");
  return res.data;
}

export async function getOrderById(id: string, client: ApiClient = defaultApiClient): Promise<OrderDto> {
  const res = await client.get<OrderDto>(`/orders/${id}`);
  return res.data;
}

export const getOrder = getOrderById;

export async function createOrder(input: CreateOrderInput, client: ApiClient = defaultApiClient): Promise<OrderDto> {
  // Fail-fast client validation (RULES §10b, §20)
  const validated = CreateOrderSchema.parse(input);
  const res = await client.post<OrderDto>("/orders", validated);
  return res.data;
}

export async function cancelOrder(
  orderId: string,
  input: CancelOrderInput,
  client: ApiClient = defaultApiClient,
): Promise<OrderDto> {
  // Fail-fast client validation (RULES §10b, §20)
  const validated = CancelOrderSchema.parse(input);
  const res = await client.post<OrderDto>(`/orders/${orderId}/cancel`, validated);
  return res.data;
}

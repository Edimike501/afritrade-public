import { z } from "zod";
import { OrderStatusSchema } from "../types/enums";
import { PaginatedQuerySchema } from "../validation/pagination";

export const OrderItemInputSchema = z.object({
  productId: z.string().uuid("Product ID must be a valid UUID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(100000),
});
export type OrderItemInput = z.infer<typeof OrderItemInputSchema>;

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemInputSchema).min(1, "Order must contain at least one item").max(50),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const CancelOrderSchema = z.object({
  reason: z.string().trim().min(3, "Cancellation reason must be at least 3 characters").max(300),
});
export type CancelOrderInput = z.infer<typeof CancelOrderSchema>;

export const OrderItemDtoSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string(),
  quantity: z.number().int(),
  unitPrice: z.string(),
  currency: z.string(),
});
export type OrderItemDto = z.infer<typeof OrderItemDtoSchema>;

export const OrderDtoSchema = z.object({
  id: z.string().uuid(),
  buyerId: z.string().uuid(),
  status: OrderStatusSchema,
  currency: z.string(),
  totalAmount: z.string(),
  items: z.array(OrderItemDtoSchema),
  shipment: z
    .object({
      id: z.string().uuid(),
      status: OrderStatusSchema,
      logisticsPartner: z
        .object({
          id: z.string().uuid(),
          name: z.string(),
        })
        .nullable(),
    })
    .nullable(),
  payment: z
    .object({
      id: z.string().uuid(),
      reference: z.string(),
      status: z.string(),
      provider: z.string(),
    })
    .nullable()
    .optional(),
  createdAt: z.string().datetime(),
});
export type OrderDto = z.infer<typeof OrderDtoSchema>;

export const OrderListQuerySchema = PaginatedQuerySchema.extend({
  status: OrderStatusSchema.optional(),
});
export type OrderListQuery = z.infer<typeof OrderListQuerySchema>;

import Link from "next/link";
import { OrderStatus } from "@afritrade/shared";
import { Money, OrderStatusBadge } from "./ui";

export interface OrderItemSummary {
  id?: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice?: string;
}

export interface OrderTableItem {
  id: string;
  status: OrderStatus;
  currencyCode: string;
  totalAmount: string;
  createdAt: string;
  buyer?: { id: string; fullName: string; email: string };
  items: OrderItemSummary[];
  shipment?: {
    status?: OrderStatus;
    logisticsPartner?: { id: string; name: string } | null;
  } | null;
}

/** Shared by buyer, supplier and admin order lists — one source of truth for order presentation. */
export function OrderTable({
  orders,
  showBuyer = false,
  orderLinkPrefix = "/orders",
}: {
  orders: OrderTableItem[];
  showBuyer?: boolean;
  orderLinkPrefix?: string;
}) {
  if (orders.length === 0) return <p className="muted">No orders yet.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            {showBuyer && <th>Buyer</th>}
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Logistics</th>
            <th>Placed</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <Link href={`${orderLinkPrefix}/${o.id}`}>#{o.id.slice(0, 8)}</Link>
              </td>
              {showBuyer && <td>{o.buyer?.fullName ?? "—"}</td>}
              <td>{o.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ")}</td>
              <td>
                <Money amount={o.totalAmount} currency={o.currencyCode} />
              </td>
              <td>
                <OrderStatusBadge status={o.status} />
              </td>
              <td>{o.shipment?.logisticsPartner?.name ?? <span className="muted">—</span>}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { ReactNode } from "react";
import {
  ORDER_STATUS_LABELS,
  formatMoney,
  KybStatus,
  OrderStatus,
} from "@afritrade/shared";

export function ErrorBox({ message }: { message: string | null }) {
  return message ? (
    <div className="alert error" role="alert">
      {message}
    </div>
  ) : null;
}

export function Loading({ what = "" }: { what?: string }) {
  return <p className="muted">Loading{what ? ` ${what}` : ""}…</p>;
}

export function Money({ amount, currency }: { amount: string; currency: string }) {
  return <>{formatMoney(amount, currency)}</>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="card">
      <div className="stat">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

const orderTone = (s: OrderStatus) =>
  s === OrderStatus.DELIVERED
    ? "success"
    : s === OrderStatus.CANCELLED
    ? "danger"
    : s === OrderStatus.PAYMENT_PENDING
    ? "warn"
    : "";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge ${orderTone(status)}`}>{ORDER_STATUS_LABELS[status]}</span>;
}

export function KybBadge({ status }: { status: KybStatus }) {
  const tone =
    status === KybStatus.APPROVED
      ? "success"
      : status === KybStatus.REJECTED
      ? "danger"
      : status === KybStatus.PENDING
      ? "warn"
      : "";
  return <span className={`badge ${tone}`}>{status.replace("_", " ")}</span>;
}

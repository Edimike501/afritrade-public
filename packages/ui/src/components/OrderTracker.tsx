import React from "react";
import {
  Check,
  Package,
  CreditCard,
  CheckCircle2,
  Truck,
  Warehouse,
  Scale,
  BadgeCheck,
  XCircle,
  Building2,
} from "lucide-react";
import { OrderStatus } from "@afritrade/shared";
import { cn } from "../lib/utils";

export interface OrderEvent {
  status: OrderStatus;
  timestamp?: string | Date;
  note?: string;
}

export interface OrderTrackerProps {
  currentStatus: OrderStatus;
  events?: OrderEvent[];
  cancellationReason?: string;
  cancelledAt?: string | Date;
  className?: string;
}

interface MilestoneDef {
  status: OrderStatus;
  label: string;
  icon: React.ComponentType<any>;
}

const MILESTONES: MilestoneDef[] = [
  { status: OrderStatus.ORDER_PLACED, label: "Placed", icon: Package },
  { status: OrderStatus.PAYMENT_PENDING, label: "Payment Pending", icon: CreditCard },
  { status: OrderStatus.PAYMENT_CONFIRMED, label: "Payment Confirmed", icon: CheckCircle2 },
  { status: OrderStatus.LOGISTICS_ASSIGNED, label: "Logistics Assigned", icon: Building2 },
  { status: OrderStatus.PICKED_UP, label: "Picked Up", icon: Warehouse },
  { status: OrderStatus.IN_TRANSIT, label: "In Transit", icon: Truck },
  { status: OrderStatus.CUSTOMS, label: "Customs", icon: Scale },
  { status: OrderStatus.DELIVERED, label: "Delivered", icon: BadgeCheck },
];

export function OrderTracker({
  currentStatus,
  events = [],
  cancellationReason,
  cancelledAt,
  className,
}: OrderTrackerProps) {
  // If cancelled, render distinct red cancellation card per DESIGN.md §8.3
  if (currentStatus === OrderStatus.CANCELLED) {
    const formattedCancelledDate = cancelledAt
      ? new Date(cancelledAt).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

    return (
      <div
        className={cn(
          "w-full rounded-md border border-destructive/40 bg-destructive/10 p-5 text-destructive-foreground shadow-sm",
          className
        )}
      >
        <div className="flex items-start gap-3.5">
          <div className="rounded-full bg-destructive/20 p-2 text-destructive shrink-0 mt-0.5">
            <XCircle size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-display font-bold text-base text-destructive tracking-tight">
                Order Cancelled
              </h4>
              {formattedCancelledDate && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formattedCancelledDate}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground/80 mt-1">
              {cancellationReason || "This order was cancelled and terminal refund or reversing entries were logged."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Find index of current milestone
  const currentIndex = MILESTONES.findIndex((m) => m.status === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  const eventMap = new Map<OrderStatus, OrderEvent>();
  events.forEach((ev) => eventMap.set(ev.status, ev));

  return (
    <div
      className={cn(
        "w-full rounded-md border border-border bg-card p-5 sm:p-6 shadow-sm overflow-x-auto",
        className
      )}
    >
      <div className="min-w-[680px] flex items-center justify-between relative">
        {MILESTONES.map((milestone, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isPending = idx > activeIndex;

          const IconComponent = milestone.icon;
          const event = eventMap.get(milestone.status);

          const formattedDate = event?.timestamp
            ? new Date(event.timestamp).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })
            : null;

          return (
            <div
              key={milestone.status}
              className="flex-1 flex flex-col items-center text-center relative group"
            >
              {/* Connector line between steps */}
              {idx < MILESTONES.length - 1 && (
                <div
                  className={cn(
                    "absolute top-5 left-[50%] right-[-50%] h-[3px] z-0 transition-colors duration-200",
                    idx < activeIndex ? "bg-primary" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Milestone Icon Pill */}
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 select-none",
                  isCompleted &&
                    "bg-primary border-primary text-primary-foreground shadow-xs",
                  isCurrent &&
                    "bg-card border-primary text-primary ring-4 ring-primary/20 scale-110 shadow-sm",
                  isPending &&
                    "bg-card border-border text-muted-foreground/60"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check size={18} />
                ) : (
                  <IconComponent
                    size={20}
                    className={isCurrent ? "text-primary" : "text-muted-foreground/80"}
                  />
                )}
              </div>

              {/* Label & Meta */}
              <div className="mt-3 flex flex-col items-center">
                <span
                  className={cn(
                    "text-xs leading-tight transition-colors",
                    isCurrent && "font-bold text-foreground",
                    isCompleted && "font-medium text-foreground/90",
                    isPending && "font-normal text-muted-foreground"
                  )}
                >
                  {milestone.label}
                </span>

                {formattedDate && (
                  <span className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                    {formattedDate}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

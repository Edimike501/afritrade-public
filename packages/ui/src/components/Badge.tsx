import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Package,
  BadgeCheck,
  Info,
  ArrowLeftRight,
} from "lucide-react";
import { OrderStatus, ORDER_STATUS_LABELS, KybStatus } from "@afritrade/shared";
import { cn } from "../lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center font-medium rounded-full transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-secondary text-secondary-foreground border border-border/80",
        secondary:
          "bg-secondary text-secondary-foreground border border-border/80",
        primary:
          "bg-primary/10 text-primary border border-primary/20",
        success:
          "bg-success/15 text-success border border-success/30",
        warning:
          "bg-warning/15 text-warning border border-warning/30",
        destructive:
          "bg-destructive/15 text-destructive border border-destructive/30",
        outline:
          "border border-border text-foreground bg-transparent",
        accent:
          "bg-accent/20 text-accent-foreground border border-accent/40 font-semibold",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px] gap-1",
        md: "px-2.5 py-1 text-xs gap-1.5",
        lg: "px-3.5 py-1.5 text-sm gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export const StatusPill = Badge;

/**
 * Domain-specific Order Status Badge
 * Strictly pairs color with text label and Lucide icon (WCAG 2.2 AA)
 */
export function OrderStatusBadge({
  status,
  size = "md",
  className,
}: {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const iconSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;

  switch (status) {
    case OrderStatus.DELIVERED:
      return (
        <Badge
          variant="success"
          size={size}
          className={className}
          icon={<CheckCircle2 size={iconSize} />}
        >
          {ORDER_STATUS_LABELS[status]}
        </Badge>
      );
    case OrderStatus.CANCELLED:
      return (
        <Badge
          variant="destructive"
          size={size}
          className={className}
          icon={<XCircle size={iconSize} />}
        >
          {ORDER_STATUS_LABELS[status]}
        </Badge>
      );
    case OrderStatus.IN_TRANSIT:
    case OrderStatus.PICKED_UP:
    case OrderStatus.CUSTOMS:
      return (
        <Badge
          variant="primary"
          size={size}
          className={className}
          icon={<Truck size={iconSize} />}
        >
          {ORDER_STATUS_LABELS[status]}
        </Badge>
      );
    case OrderStatus.PAYMENT_CONFIRMED:
    case OrderStatus.LOGISTICS_ASSIGNED:
      return (
        <Badge
          variant="primary"
          size={size}
          className={className}
          icon={<Package size={iconSize} />}
        >
          {ORDER_STATUS_LABELS[status]}
        </Badge>
      );
    case OrderStatus.ORDER_PLACED:
    case OrderStatus.PAYMENT_PENDING:
    default:
      return (
        <Badge
          variant="warning"
          size={size}
          className={className}
          icon={<Clock size={iconSize} />}
        >
          {ORDER_STATUS_LABELS[status]}
        </Badge>
      );
  }
}

/**
 * Domain-specific KYB Verification Badge
 */
export function KybBadge({
  status,
  size = "md",
  className,
}: {
  status: KybStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const iconSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;

  switch (status) {
    case KybStatus.APPROVED:
      return (
        <Badge
          variant="success"
          size={size}
          className={className}
          icon={<BadgeCheck size={iconSize} />}
        >
          Verified Exporter
        </Badge>
      );
    case KybStatus.REJECTED:
      return (
        <Badge
          variant="destructive"
          size={size}
          className={className}
          icon={<XCircle size={iconSize} />}
        >
          Verification Rejected
        </Badge>
      );
    case KybStatus.PENDING:
    default:
      return (
        <Badge
          variant="warning"
          size={size}
          className={className}
          icon={<Clock size={iconSize} />}
        >
          KYB Review Pending
        </Badge>
      );
  }
}

/**
 * Domain-specific Corridor Pill
 */
export function CorridorBadge({
  country,
  origin,
  destination,
  size = "sm",
  className,
}: {
  country?: string;
  origin?: string;
  destination?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const iconSize = size === "sm" ? 12 : 14;
  const label = country || (origin && destination ? `${origin} ➔ ${destination}` : origin || destination || "AFR");

  return (
    <Badge
      variant="outline"
      size={size}
      className={cn("bg-muted/40 font-mono tracking-tight", className)}
      icon={<ArrowLeftRight size={iconSize} className="text-primary" />}
    >
      {label}
    </Badge>
  );
}

/**
 * Domain-specific Simulated Mode Disclosure Pill (DESIGN.md §8.2)
 */
export function SimulatedBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="warning"
      size="sm"
      className={cn("font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30", className)}
      icon={<Info size={13} />}
    >
      Simulated Transaction — MVP Demo Mode
    </Badge>
  );
}

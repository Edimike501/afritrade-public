import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const cardVariants = cva(
  "rounded-md border border-border bg-card text-foreground transition-all duration-150",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        elevated: "shadow-md hover:shadow-md",
        interactive:
          "shadow-sm hover:border-primary/50 hover:shadow-md cursor-pointer active:scale-[0.99]",
        selected: "border-primary ring-2 ring-primary/20 shadow-sm",
        flat: "border border-border/60 shadow-none bg-muted/20",
      },
      padding: {
        none: "p-0",
        sm: "p-3.5",
        md: "p-5",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-4 border-b border-border/40", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display font-bold text-lg text-foreground tracking-tight leading-snug",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-muted-foreground leading-normal", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-4 border-t border-border/40 gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

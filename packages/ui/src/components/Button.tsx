"use client";

import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] transition-transform",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-border bg-card text-foreground hover:bg-muted hover:text-foreground shadow-sm",
        ghost:
          "text-foreground hover:bg-muted hover:text-foreground",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm font-semibold",
      },
      size: {
        sm: "min-h-[36px] min-w-[36px] px-3 py-1.5 text-xs rounded-sm gap-1.5",
        md: "min-h-[44px] min-w-[44px] px-4 py-2.5 text-sm rounded-sm gap-2", // Default 44px WCAG AA
        lg: "min-h-[50px] min-w-[50px] px-6 py-3 text-base rounded-md gap-2.5",
        icon: "h-11 w-11 p-0 rounded-sm",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(
          buttonVariants({ variant, size, fullWidth }),
          className,
          (children.props as any)?.className
        ),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2
              size={size === "sm" ? 16 : size === "lg" ? 22 : 18}
              className="animate-spin text-current"
            />
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

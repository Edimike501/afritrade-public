"use client";

import React, { forwardRef, useId } from "react";
import { cn } from "../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
  suffixText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      helperText,
      error,
      id,
      leftIcon,
      rightIcon,
      prefixText,
      suffixText,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const isNumeric = type === "number";

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div
          className={cn(
            "relative flex items-center w-full min-h-[44px] rounded-sm border bg-card transition-colors",
            error
              ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/30"
              : "border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
            disabled && "opacity-60 bg-muted/30 cursor-not-allowed",
            className
          )}
        >
          {leftIcon && (
            <div className="pl-3.5 pr-1 text-muted-foreground pointer-events-none shrink-0 flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          {prefixText && (
            <span className="pl-3.5 pr-1 text-sm font-semibold text-muted-foreground select-none shrink-0">
              {prefixText}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              "w-full h-full min-h-[42px] px-3.5 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed border-0 shadow-none ring-0 focus:ring-0 focus:border-0",
              (leftIcon || prefixText) && "pl-1.5",
              (rightIcon || suffixText) && "pr-1.5",
              isNumeric && "tabular-nums"
            )}
            {...props}
          />

          {suffixText && (
            <span className="pr-3.5 pl-1 text-sm font-semibold text-muted-foreground select-none shrink-0">
              {suffixText}
            </span>
          )}

          {rightIcon && (
            <div className="pr-3.5 pl-1 text-muted-foreground shrink-0">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p id={errorId} className="text-xs font-medium text-destructive mt-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-muted-foreground mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

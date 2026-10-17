"use client";

import React, { forwardRef, useId } from "react";
import { cn } from "../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

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

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            "w-full min-h-[96px] p-3.5 text-sm rounded-sm border bg-card text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
            error
              ? "border-destructive focus:ring-2 focus:ring-destructive/30"
              : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20",
            className
          )}
          {...props}
        />

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

Textarea.displayName = "Textarea";

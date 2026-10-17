"use client";

import React from "react";
import { cn } from "../lib/utils";
import { EmptyState } from "./EmptyState";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  isNumeric?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  error,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries to display at this time.",
  emptyAction,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive font-medium my-4">
        {error}
      </div>
    );
  }

  if (!isLoading && (!data || data.length === 0)) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-md border border-border bg-card shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none",
                    col.align === "right" || col.isNumeric
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5">
                      <div className="h-4 bg-muted rounded-xs w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              data.map((row, rIdx) => {
                const key = row.id ?? rIdx;
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "transition-colors duration-100 hover:bg-muted/30",
                      onRowClick && "cursor-pointer active:bg-muted/50"
                    )}
                  >
                    {columns.map((col, cIdx) => {
                      const value = col.cell
                        ? col.cell(row, rIdx)
                        : col.accessorKey
                        ? (row[col.accessorKey] as React.ReactNode)
                        : null;

                      return (
                        <td
                          key={cIdx}
                          className={cn(
                            "px-4 py-3 text-foreground whitespace-nowrap",
                            (col.align === "right" || col.isNumeric) &&
                              "text-right tabular-nums",
                            col.align === "center" && "text-center",
                            col.className
                          )}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

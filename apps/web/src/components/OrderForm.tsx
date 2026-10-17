"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ShoppingCart, AlertCircle, Loader2, Coins } from "lucide-react";
import { useCreateOrder, usePayOrder, ApiError } from "@afritrade/hooks";
import { useAuth, Button } from "@afritrade/ui";
import { PriceDisplay } from "@/components/PriceDisplay";

interface OrderFormProps {
  productId: string;
  unitPrice?: string;
  currency?: string;
}

/** Order + pay in one action. Whichever provider is active, the buyer UI is identical. */
export function OrderForm({ productId, unitPrice, currency = "USD" }: OrderFormProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const createOrderMutation = useCreateOrder();
  const payOrderMutation = usePayOrder();
  const busy = createOrderMutation.isPending || payOrderMutation.isPending;

  const total = unitPrice ? (Number(unitPrice) * quantity).toFixed(2) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground">
        <Loader2 size={20} className="animate-spin mr-2" />
        <span className="text-sm">Checking authentication status…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Sign in with a verified buyer account to place wholesale procurement orders.
        </p>
        <Link
          href={`/login?next=/marketplace/${productId}`}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors w-full"
        >
          <span>Log in to Order</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (user.role !== "BUYER") {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3">
        <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-medium">Buyer Account Required</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Only registered procurement buyer accounts can initiate purchase orders and settle simulated payments.
          </p>
        </div>
      </div>
    );
  }

  async function submit() {
    setError(null);
    try {
      const order = await createOrderMutation.mutateAsync({ items: [{ productId, quantity }] });
      const pay = await payOrderMutation.mutateAsync(order.id);
      if (pay.authorizationUrl) {
        window.location.href = pay.authorizationUrl; // redirect providers (Paystack)
      } else {
        router.push(`/orders/${order.id}`); // mock completes instantly
      }
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Could not complete order placement");
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="qty" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Order Quantity (Units)
        </label>
        <div className="flex items-center gap-3">
          <input
            id="qty"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold tabular-nums ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={busy}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Wholesale volume pricing applies. Single currency batch settlement.
        </p>
      </div>

      {total && (
        <div className="p-3 bg-muted/30 rounded-lg border border-border flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground">Total Settlement ({currency})</span>
          <PriceDisplay amount={total} currency={currency} size="lg" />
        </div>
      )}

      <div className="flex items-start gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-800 dark:text-amber-200">
        <Coins size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <span>Simulated Settlement: Instant execution without real financial liability in supplier currency ({currency}).</span>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="button"
        variant="default"
        size="lg"
        onClick={submit}
        disabled={busy}
        className="w-full h-11 text-base font-semibold gap-2 shadow-sm"
      >
        {busy ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Processing Order & Escrow…</span>
          </>
        ) : (
          <>
            <ShoppingCart size={18} />
            <span>Confirm & Pay (Simulated)</span>
          </>
        )}
      </Button>

      <div className="rounded-md bg-muted/40 p-2.5 text-center">
        <p className="text-[11px] text-muted-foreground">
          🔒 Prototype Simulation: Instant zero-loss settlement in supplier currency.
        </p>
      </div>
    </div>
  );
}

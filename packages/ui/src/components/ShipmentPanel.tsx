"use client";
import { useState } from "react";
import {
  ORDER_STATUS_LABELS,
  ADMIN_SHIPMENT_TRANSITIONS,
  OrderStatus,
} from "@afritrade/shared";
import { useLogisticsPartners, useUpdateOrderShipment, type LogisticsPartnerDto } from "@afritrade/hooks";
import { ErrorBox } from "./ui";
import { Dropdown } from "./Dropdown";

export type PartnerDto = LogisticsPartnerDto;

export interface OrderShipmentInfo {
  id: string;
  status: OrderStatus;
}

/** Admin-only: assign a curated logistics partner and manually advance shipment status. */
export function ShipmentPanel({
  order,
  onUpdated,
}: {
  order: OrderShipmentInfo;
  onUpdated: () => void;
}) {
  const { data: partners = [], error: partnersError } = useLogisticsPartners();
  const updateShipment = useUpdateOrderShipment();
  const [partnerId, setPartnerId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Directly enforce the restricted transition table for Admin updates (P0 item 2)
  const next = ADMIN_SHIPMENT_TRANSITIONS[order.status] ?? [];
  if (next.length === 0) {
    return <p className="muted">No further manual updates available for this order.</p>;
  }

  async function move(status: OrderStatus) {
    setError(null);
    try {
      await updateShipment.mutateAsync({
        orderId: order.id,
        input: {
          status,
          ...(status === OrderStatus.LOGISTICS_ASSIGNED ? { logisticsPartnerId: partnerId } : {}),
        },
      });
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  const errorMessage = error ?? (partnersError instanceof Error ? partnersError.message : null);

  return (
    <div className="card stack">
      <h3>Shipment (manual)</h3>
      <ErrorBox message={errorMessage} />
      {next.includes(OrderStatus.LOGISTICS_ASSIGNED) && (
        <div className="field">
          <label htmlFor="partner">Logistics partner</label>
          <Dropdown
            id="partner"
            value={partnerId}
            onChange={(val) => setPartnerId(val)}
            placeholder="Select a partner…"
            showSearch={partners.length >= 6}
            searchPlaceholder="Search logistics partners…"
            options={[
              { value: "", label: "Select a partner…" },
              ...partners
                .filter((p) => p.isActive)
                .map((p) => ({
                  value: p.id,
                  label: p.name,
                  description: `Coverage: ${p.countryCoverage.join(", ")}`,
                })),
            ]}
            aria-label="Select a logistics partner"
          />
        </div>
      )}
      <div className="row">
        {next.map((s) => (
          <button
            key={s}
            className={`btn small ${s === OrderStatus.CANCELLED ? "danger" : ""}`}
            disabled={updateShipment.isPending || (s === OrderStatus.LOGISTICS_ASSIGNED && !partnerId)}
            onClick={() =>
              s === OrderStatus.CANCELLED ? confirm("Cancel this order?") && move(s) : move(s)
            }
          >
            {s === OrderStatus.CANCELLED ? "Cancel order" : `Mark: ${ORDER_STATUS_LABELS[s]}`}
          </button>
        ))}
      </div>
    </div>
  );
}

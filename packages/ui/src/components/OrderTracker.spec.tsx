import React from "react";
import { render, screen } from "@testing-library/react";
import { OrderStatus } from "@afritrade/shared";
import { OrderTracker } from "./OrderTracker";

describe("OrderTracker component", () => {
  it("renders all 8 milestones and marks current milestone as step", () => {
    render(
      <OrderTracker
        currentStatus={OrderStatus.IN_TRANSIT}
        events={[
          {
            status: OrderStatus.ORDER_PLACED,
            timestamp: new Date("2026-10-01"),
          },
        ]}
      />
    );

    expect(screen.getByText("Placed")).toBeInTheDocument();
    expect(screen.getByText("Payment Pending")).toBeInTheDocument();
    expect(screen.getByText("Payment Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Logistics Assigned")).toBeInTheDocument();
    expect(screen.getByText("Picked Up")).toBeInTheDocument();
    expect(screen.getByText("In Transit")).toBeInTheDocument();
    expect(screen.getByText("Customs")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();

    const currentStep = screen.getByRole("generic", { current: "step" });
    expect(currentStep).toBeInTheDocument();
  });

  it("renders distinct red card when order is cancelled", () => {
    render(
      <OrderTracker
        currentStatus={OrderStatus.CANCELLED}
        cancellationReason="Supplier shipment deadline elapsed"
      />
    );

    expect(screen.getByText("Order Cancelled")).toBeInTheDocument();
    expect(
      screen.getByText("Supplier shipment deadline elapsed")
    ).toBeInTheDocument();
  });
});

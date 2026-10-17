import React from "react";
import { render, screen } from "@testing-library/react";
import { OrderDistributionWidget } from "./OrderDistributionWidget";
import { OrderStatus } from "@afritrade/shared";

describe("OrderDistributionWidget Component", () => {
  const sampleDistribution: Record<string, number> = {
    [OrderStatus.ORDER_PLACED]: 5,
    [OrderStatus.PAYMENT_CONFIRMED]: 3,
    [OrderStatus.LOGISTICS_ASSIGNED]: 2,
    [OrderStatus.PICKED_UP]: 1,
    [OrderStatus.IN_TRANSIT]: 4,
    [OrderStatus.CUSTOMS]: 1,
    [OrderStatus.DELIVERED]: 8,
    [OrderStatus.CANCELLED]: 0,
  };

  it("renders lifecycle pipeline heading and total count", () => {
    render(<OrderDistributionWidget distribution={sampleDistribution} />);

    expect(screen.getByText("Order Fulfillment Lifecycle Pipeline")).toBeInTheDocument();
    expect(screen.getByText("24 Total Orders")).toBeInTheDocument();
    expect(screen.getByText("Manage Orders")).toBeInTheDocument();
  });

  it("renders status segments with correct percentages and counts", () => {
    render(<OrderDistributionWidget distribution={sampleDistribution} />);

    // Order Placed: 5/24 => 21%
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("21%")).toBeInTheDocument();

    // Delivered: 8/24 => 33%
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  it("handles empty order distribution gracefully", () => {
    render(<OrderDistributionWidget distribution={{}} />);

    expect(screen.getByText("0 Total Orders")).toBeInTheDocument();
  });
});

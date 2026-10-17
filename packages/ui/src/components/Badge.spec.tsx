import React from "react";
import { render, screen } from "@testing-library/react";
import { OrderStatus, KybStatus } from "@afritrade/shared";
import {
  Badge,
  OrderStatusBadge,
  KybBadge,
  CorridorBadge,
  SimulatedBadge,
} from "./Badge";

describe("Badge and StatusPill components", () => {
  it("renders generic Badge with custom variant and icon", () => {
    render(
      <Badge variant="primary" icon={<span data-testid="badge-icon">*</span>}>
        Active
      </Badge>
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
  });

  it("renders OrderStatusBadge with icon and human text", () => {
    render(<OrderStatusBadge status={OrderStatus.DELIVERED} />);
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("renders KybBadge for verified exporter", () => {
    render(<KybBadge status={KybStatus.APPROVED} />);
    expect(screen.getByText("Verified Exporter")).toBeInTheDocument();
  });

  it("renders CorridorBadge with trade path", () => {
    render(<CorridorBadge origin="Lagos (NG)" destination="Tema (GH)" />);
    expect(screen.getByText(/Lagos \(NG\) ➔ Tema \(GH\)/)).toBeInTheDocument();
  });

  it("renders SimulatedBadge with MVP Demo Mode notice", () => {
    render(<SimulatedBadge />);
    expect(
      screen.getByText("Simulated Transaction — MVP Demo Mode")
    ).toBeInTheDocument();
  });
});

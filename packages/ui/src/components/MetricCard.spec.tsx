import React from "react";
import { render, screen } from "@testing-library/react";
import { MetricCard } from "./MetricCard";

describe("MetricCard component", () => {
  it("renders metric label and value", () => {
    render(
      <MetricCard
        label="Settled Trade Volume"
        value="$1,450,200"
        subtitle="Last 30 Days"
      />
    );
    expect(screen.getByText("Settled Trade Volume")).toBeInTheDocument();
    expect(screen.getByText("$1,450,200")).toBeInTheDocument();
    expect(screen.getByText("Last 30 Days")).toBeInTheDocument();
  });

  it("renders skeleton loader when isLoading is true", () => {
    const { container } = render(
      <MetricCard label="Orders" value="12" isLoading />
    );
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});

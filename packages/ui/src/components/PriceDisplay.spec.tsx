import React from "react";
import { render, screen } from "@testing-library/react";
import { PriceDisplay } from "./PriceDisplay";

describe("PriceDisplay component", () => {
  it("renders single settlement currency when no preference is set", () => {
    render(<PriceDisplay amount="150.00" currency="GHS" unitLabel="/ 50kg bag" />);
    expect(screen.getByText(/150\.00/)).toBeInTheDocument();
    expect(screen.getByText("GHS")).toBeInTheDocument();
    expect(screen.getByText("/ 50kg bag")).toBeInTheDocument();
  });

  it("renders dual-currency with indicative equivalent when currencies differ", () => {
    render(
      <PriceDisplay
        amount="100.00"
        currency="USD"
        preferredCurrency="NGN"
      />
    );
    expect(screen.getByText(/100\.00/)).toBeInTheDocument();
    expect(screen.getByText(/≈/)).toBeInTheDocument();
    expect(screen.getByText("(indicative)")).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CurrencySelector } from "./CurrencySelector";

describe("CurrencySelector component", () => {
  it("renders active currency and opens dropdown to select new currency", () => {
    const handleCurrencyChange = jest.fn();
    render(
      <CurrencySelector
        selectedCurrency="USD"
        onCurrencyChange={handleCurrencyChange}
      />
    );

    const trigger = screen.getByRole("button", {
      name: /current indicative viewing currency: usd/i,
    });
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);

    const ngnOption = screen.getByRole("option", { name: /ngn/i });
    expect(ngnOption).toBeInTheDocument();

    fireEvent.click(ngnOption);
    expect(handleCurrencyChange).toHaveBeenCalledWith("NGN");
  });
});

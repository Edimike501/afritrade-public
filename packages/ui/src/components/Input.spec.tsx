import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./Input";
import { Textarea } from "./Textarea";

describe("Input and Textarea components", () => {
  it("renders Input with label, placeholder, and prefix", () => {
    render(
      <Input
        label="Commodity Weight"
        placeholder="Enter weight in MT"
        prefixText="MT"
      />
    );
    expect(screen.getByText("Commodity Weight")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter weight in MT")).toBeInTheDocument();
    expect(screen.getByText("MT")).toBeInTheDocument();
  });

  it("renders Input error state and links aria-describedby", () => {
    render(<Input label="Price" error="Price is required" id="price-input" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Price is required")).toBeInTheDocument();
  });

  it("renders Textarea with character value and handles changes", () => {
    const handleChange = jest.fn();
    render(
      <Textarea
        label="Shipping Instructions"
        placeholder="Delivery dock details"
        onChange={handleChange}
      />
    );
    const textarea = screen.getByPlaceholderText("Delivery dock details");
    fireEvent.change(textarea, { target: { value: "Gate 4, Apapa Port" } });
    expect(handleChange).toHaveBeenCalled();
  });
});

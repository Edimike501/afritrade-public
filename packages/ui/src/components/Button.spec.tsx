import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button component", () => {
  it("renders with default primary styling and handles click", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit Order</Button>);

    const button = screen.getByRole("button", { name: "Submit Order" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders loading spinner and disables button when isLoading is true", () => {
    render(<Button isLoading>Processing...</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders left and right icons", () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">Left</span>}
        rightIcon={<span data-testid="right-icon">Right</span>}
      >
        Export Trade
      </Button>
    );
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });
});

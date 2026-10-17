import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewModeToggle } from "./ViewModeToggle";

describe("ViewModeToggle component", () => {
  it("renders both grid and list options and toggles between them", () => {
    const handleChange = jest.fn();
    render(<ViewModeToggle mode="grid" onChange={handleChange} />);

    const gridBtn = screen.getByRole("button", { name: /grid/i });
    const listBtn = screen.getByRole("button", { name: /list/i });

    expect(gridBtn).toHaveAttribute("aria-pressed", "true");
    expect(listBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(listBtn);
    expect(handleChange).toHaveBeenCalledWith("list");
  });
});

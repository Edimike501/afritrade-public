import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sheet } from "./Sheet";

describe("Sheet component", () => {
  it("renders when open and responds to close", () => {
    const handleClose = jest.fn();
    render(
      <Sheet
        isOpen={true}
        onClose={handleClose}
        title="Inspection Report"
        side="left"
      >
        <p>Phytosanitary certificate verified.</p>
      </Sheet>
    );

    expect(screen.getByText("Inspection Report")).toBeInTheDocument();
    expect(
      screen.getByText("Phytosanitary certificate verified.")
    ).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Close panel" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

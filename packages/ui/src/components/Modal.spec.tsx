import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal component", () => {
  it("renders when isOpen is true and closes via close button and Escape key", () => {
    const handleClose = jest.fn();
    const { rerender } = render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Approve Exporter KYB"
        description="Review registration documents"
      >
        <p>Confirm export certificate validity.</p>
      </Modal>
    );

    expect(screen.getByText("Approve Exporter KYB")).toBeInTheDocument();
    expect(
      screen.getByText("Confirm export certificate validity.")
    ).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Close dialog" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(2);

    rerender(
      <Modal
        isOpen={false}
        onClose={handleClose}
        title="Approve Exporter KYB"
      >
        <p>Hidden</p>
      </Modal>
    );
    expect(screen.queryByText("Approve Exporter KYB")).not.toBeInTheDocument();
  });
});

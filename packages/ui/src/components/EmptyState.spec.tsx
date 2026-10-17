import React from "react";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";
import { Button } from "./Button";

describe("EmptyState component", () => {
  it("renders empty state with title, description and action button", () => {
    render(
      <EmptyState
        title="No Orders Found"
        description="You have not placed any trade orders in this currency corridor."
        action={<Button>Browse Marketplace</Button>}
      />
    );

    expect(screen.getByText("No Orders Found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You have not placed any trade orders in this currency corridor."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Browse Marketplace" })
    ).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./Card";

describe("Card component suite", () => {
  it("renders card with title, content and footer", () => {
    render(
      <Card variant="interactive">
        <CardHeader>
          <CardTitle>Commodity Batch #9482</CardTitle>
          <CardDescription>Export Grade Sesame Seeds</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Total Lot: 25 Metric Tonnes</p>
        </CardContent>
        <CardFooter>
          <span>FOB Lagos</span>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText("Commodity Batch #9482")).toBeInTheDocument();
    expect(screen.getByText("Export Grade Sesame Seeds")).toBeInTheDocument();
    expect(screen.getByText("Total Lot: 25 Metric Tonnes")).toBeInTheDocument();
    expect(screen.getByText("FOB Lagos")).toBeInTheDocument();
  });
});

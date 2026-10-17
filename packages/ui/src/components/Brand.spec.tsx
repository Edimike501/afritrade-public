import React from "react";
import { render, screen } from "@testing-library/react";
import { BrandLogo, BrandMark } from "./Brand";

describe("Brand Components", () => {
  it("renders BrandMark with accessible label", () => {
    render(<BrandMark size={40} />);
    const mark = screen.getByLabelText("AfriTrade Connect Mark");
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveAttribute("width", "40");
    expect(mark).toHaveAttribute("height", "40");
  });

  it("renders BrandLogo with brand text", () => {
    render(<BrandLogo />);
    expect(screen.getByText("AfriTrade")).toBeInTheDocument();
    expect(screen.getByText("Connect")).toBeInTheDocument();
  });
});

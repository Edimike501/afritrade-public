import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle & ThemeProvider", () => {
  beforeEach(() => {
    // Clear cookies
    document.cookie = "theme=; path=/; max-age=0";
    document.documentElement.classList.remove("dark");
  });

  it("renders toggle button with accessible label and switches theme on click", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole("button", { name: /switch to dark theme/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.cookie).toContain("theme=dark");
    expect(screen.getByRole("button", { name: /switch to light theme/i })).toBeInTheDocument();
  });

  it("defaults to light mode when user preference is not set", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(screen.getByRole("button", { name: /switch to dark theme/i })).toBeInTheDocument();
  });

  it("honors user preference when cookie is set to dark", () => {
    document.cookie = "theme=dark; path=/";
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByRole("button", { name: /switch to light theme/i })).toBeInTheDocument();
  });
});

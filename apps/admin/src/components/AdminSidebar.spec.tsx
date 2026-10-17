import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminSidebar } from "./AdminSidebar";
import { ThemeProvider } from "@afritrade/ui";

jest.mock("next/navigation", () => ({
  usePathname: () => "/orders",
}));

jest.mock("./ProfileModal", () => ({
  ProfileModal: () => null,
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider defaultTheme="light">{ui}</ThemeProvider>);
}

describe("AdminSidebar Component", () => {
  it("renders both Operations and Users navigation groups", () => {
    renderWithTheme(<AdminSidebar />);

    expect(screen.getByText("Operations")).toBeInTheDocument();
    expect(screen.getByText("Users & Verification")).toBeInTheDocument();
    expect(screen.getByText("Platform Overview")).toBeInTheDocument();
    expect(screen.getByText("Orders Oversight")).toBeInTheDocument();
    expect(screen.getByText("Logistics Partners")).toBeInTheDocument();
  });

  it("renders admin user groups: All Users Directory, KYB Review Queue, and KYC Placeholder", () => {
    renderWithTheme(<AdminSidebar />);

    expect(screen.getByText("All Users Directory")).toBeInTheDocument();
    expect(screen.queryByText("Buyers Directory")).not.toBeInTheDocument();
    expect(screen.queryByText("Suppliers Directory")).not.toBeInTheDocument();
    expect(screen.getByText("KYB Review Queue")).toBeInTheDocument();
    expect(screen.getByText("KYC Placeholder")).toBeInTheDocument();
    expect(screen.getByText("Soon")).toBeInTheDocument();
  });

  it("renders authenticated administrator profile card", () => {
    renderWithTheme(
      <AdminSidebar
        user={{
          fullName: "Amina Bello",
          email: "amina@afritrade.org",
          role: "ADMIN",
        }}
      />
    );

    expect(screen.getByText("Amina Bello")).toBeInTheDocument();
    expect(screen.getByText("amina@afritrade.org")).toBeInTheDocument();
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("renders authenticating state when user session is hydrating", () => {
    renderWithTheme(<AdminSidebar />);
    expect(screen.getByText("Authenticating…")).toBeInTheDocument();
    expect(screen.getByText("Checking session")).toBeInTheDocument();
  });
});

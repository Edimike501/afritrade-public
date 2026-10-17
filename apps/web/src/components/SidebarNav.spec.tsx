import React from "react";
import { render, screen } from "@testing-library/react";
import { DashboardSidebar } from "./SidebarNav";
import { Role } from "@afritrade/shared";
import { ThemeProvider } from "@afritrade/ui";

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("./ProfileModal", () => ({
  ProfileModal: () => null,
}));

jest.mock("@afritrade/ui", () => {
  const actual = jest.requireActual("@afritrade/ui");
  return {
    ...actual,
    useAuth: () => ({
      user: {
        id: "usr-1",
        fullName: "Amara Okafor",
        email: "amara@example.com",
        role: "BUYER",
      },
      signOut: jest.fn(),
      loading: false,
    }),
  };
});

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider defaultTheme="light">{ui}</ThemeProvider>);
}

describe("DashboardSidebar Component", () => {
  it("renders buyer navigation links when role is BUYER", () => {
    renderWithTheme(<DashboardSidebar role={Role.BUYER} />);

    expect(screen.getByText("Buyer")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Marketplace")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /marketplace/i })).toHaveAttribute(
      "href",
      "/dashboard/marketplace",
    );
    expect(screen.getByText("My Orders")).toBeInTheDocument();
    expect(screen.getByText("Amara Okafor")).toBeInTheDocument();
  });

  it("renders supplier navigation links when role is SUPPLIER", () => {
    renderWithTheme(<DashboardSidebar role={Role.SUPPLIER} />);

    expect(screen.getByText("Supplier")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("My Products")).toBeInTheDocument();
    expect(screen.getByText("Incoming Orders")).toBeInTheDocument();
    expect(screen.getByText("Business Profile")).toBeInTheDocument();
    expect(screen.getByText("KYB Verification")).toBeInTheDocument();
  });
});

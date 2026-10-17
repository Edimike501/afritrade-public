import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable, type ColumnDef } from "./DataTable";

interface MockOrder {
  id: string;
  orderNumber: string;
  amount: string;
  status: string;
}

const mockOrders: MockOrder[] = [
  { id: "1", orderNumber: "ORD-9482", amount: "$15,000", status: "Delivered" },
  { id: "2", orderNumber: "ORD-9483", amount: "$8,500", status: "In Transit" },
];

const columns: ColumnDef<MockOrder>[] = [
  { header: "Order ID", accessorKey: "orderNumber" },
  { header: "Amount", accessorKey: "amount", isNumeric: true },
  { header: "Status", accessorKey: "status" },
];

describe("DataTable component", () => {
  it("renders data rows with tabular numeric styling", () => {
    const handleRowClick = jest.fn();
    render(
      <DataTable
        columns={columns}
        data={mockOrders}
        onRowClick={handleRowClick}
      />
    );

    expect(screen.getByText("ORD-9482")).toBeInTheDocument();
    expect(screen.getByText("$15,000")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();

    fireEvent.click(screen.getByText("ORD-9482"));
    expect(handleRowClick).toHaveBeenCalledWith(mockOrders[0]);
  });

  it("renders empty state when data is empty", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyTitle="No Orders Found"
        emptyDescription="Your order ledger is empty."
      />
    );
    expect(screen.getByText("No Orders Found")).toBeInTheDocument();
  });
});

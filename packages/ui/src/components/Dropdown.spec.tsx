import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Dropdown, type DropdownOption } from "./Dropdown";

const sampleOptions: DropdownOption[] = [
  { value: "opt1", label: "Option One", description: "First description" },
  { value: "opt2", label: "Option Two", badge: "NEW" },
  { value: "opt3", label: "Option Three", disabled: true },
  { value: "opt4", label: "Option Four" },
];

describe("Dropdown Component", () => {
  it("renders trigger with placeholder when no value is selected", () => {
    render(
      <Dropdown
        id="test-dropdown"
        options={sampleOptions}
        placeholder="Choose something…"
      />
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Choose something…")).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders label and associates with trigger", () => {
    render(
      <Dropdown
        id="labeled-dropdown"
        label="Preferred Category"
        required
        options={sampleOptions}
      />
    );

    expect(screen.getByText("Preferred Category")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays currently selected option label", () => {
    render(
      <Dropdown
        options={sampleOptions}
        value="opt2"
      />
    );

    expect(screen.getByText("Option Two")).toBeInTheDocument();
  });

  it("opens menu when trigger is clicked and closes on outside click", () => {
    render(
      <div>
        <div data-testid="outside">Outside Element</div>
        <Dropdown options={sampleOptions} />
      </div>
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Option One")).toBeInTheDocument();

    // Click outside to close
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("selects an option on click and invokes onChange", () => {
    const handleChange = jest.fn();
    render(
      <Dropdown
        options={sampleOptions}
        onChange={handleChange}
      />
    );

    fireEvent.click(screen.getByRole("combobox"));
    const optionOne = screen.getByText("Option One");
    fireEvent.click(optionOne);

    expect(handleChange).toHaveBeenCalledWith("opt1");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not select disabled options", () => {
    const handleChange = jest.fn();
    render(
      <Dropdown
        options={sampleOptions}
        onChange={handleChange}
      />
    );

    fireEvent.click(screen.getByRole("combobox"));
    const optionThree = screen.getByText("Option Three");
    fireEvent.click(optionThree);

    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("supports keyboard navigation: open with ArrowDown, close with Escape", () => {
    render(<Dropdown options={sampleOptions} />);
    const trigger = screen.getByRole("combobox");

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("supports keyboard selection with Enter", () => {
    const handleChange = jest.fn();
    render(
      <Dropdown
        options={sampleOptions}
        onChange={handleChange}
      />
    );
    const trigger = screen.getByRole("combobox");

    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Highlight is on first item (index 0), press Enter to select
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(handleChange).toHaveBeenCalledWith("opt1");
  });

  it("renders error message and helper text", () => {
    const { rerender } = render(
      <Dropdown
        options={sampleOptions}
        error="This field is required"
      />
    );
    expect(screen.getByText("This field is required")).toBeInTheDocument();

    rerender(
      <Dropdown
        options={sampleOptions}
        helperText="Please select from verified options"
      />
    );
    expect(screen.getByText("Please select from verified options")).toBeInTheDocument();
  });

  it("renders hidden input with name and value for form submissions", () => {
    const { container } = render(
      <Dropdown
        name="currencyCode"
        value="opt2"
        options={sampleOptions}
      />
    );

    const hiddenInput = container.querySelector("input[type='hidden']") as HTMLInputElement;
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput.name).toBe("currencyCode");
    expect(hiddenInput.value).toBe("opt2");
  });

  it("filters options when search input is used", () => {
    render(
      <Dropdown
        options={sampleOptions}
        showSearch={true}
      />
    );

    fireEvent.click(screen.getByRole("combobox"));
    const searchInput = screen.getByRole("textbox");
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "Two" } });
    expect(screen.getByText("Option Two")).toBeInTheDocument();
    expect(screen.queryByText("Option One")).not.toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByRole("button", { name: "Clear search" });
    fireEvent.click(clearBtn);
    expect(screen.getByText("Option One")).toBeInTheDocument();
  });
});

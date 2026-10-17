"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  useMemo,
  type ReactNode,
  type KeyboardEvent,
} from "react";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

export interface DropdownProps<T extends string = string> {
  id?: string;
  name?: string;
  label?: string;
  options: DropdownOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string | null;
  helperText?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "subtle" | "ghost";
  fullWidth?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  prefixIcon?: ReactNode;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  "aria-label"?: string;
}

export function Dropdown<T extends string = string>({
  id: externalId,
  name,
  label,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = "Select an option…",
  disabled = false,
  required = false,
  error = null,
  helperText,
  size = "md",
  variant = "default",
  fullWidth = true,
  showSearch,
  searchPlaceholder = "Search options…",
  prefixIcon,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  "aria-label": ariaLabel,
}: DropdownProps<T>) {
  const generatedId = useId();
  const dropdownId = externalId || `dropdown-${generatedId}`;
  const listboxId = `${dropdownId}-listbox`;

  const [internalValue, setInternalValue] = useState<T>(
    () => (controlledValue !== undefined ? controlledValue : (defaultValue ?? ("" as T)))
  );

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-enable search if there are 8 or more items and not explicitly disabled
  const shouldShowSearch = showSearch !== undefined ? showSearch : options.length >= 8;

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!shouldShowSearch || !searchQuery.trim()) {
      return options;
    }
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q)) ||
        (opt.badge && opt.badge.toLowerCase().includes(q))
    );
  }, [options, searchQuery, shouldShowSearch]);

  // Currently selected option object
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === currentValue);
  }, [options, currentValue]);

  // Synchronize internal value when controlled value changes
  useEffect(() => {
    if (isControlled) {
      setInternalValue(controlledValue);
    }
  }, [isControlled, controlledValue]);

  // Handle closing when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  // Focus search input or selected item upon opening
  useEffect(() => {
    if (isOpen) {
      if (shouldShowSearch && searchInputRef.current) {
        searchInputRef.current.focus();
      }
      // Set initial highlighted index to current selected option index
      const selIdx = filteredOptions.findIndex((opt) => opt.value === currentValue);
      setHighlightedIndex(selIdx >= 0 ? selIdx : 0);
    } else {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [isOpen, shouldShowSearch, filteredOptions, currentValue]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;
    const optionElements = listRef.current.querySelectorAll<HTMLElement>("[role='option']");
    const activeEl = optionElements[highlightedIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [highlightedIndex, isOpen]);

  const selectOption = useCallback(
    (option: DropdownOption<T>) => {
      if (option.disabled) return;
      if (!isControlled) {
        setInternalValue(option.value);
      }
      onChange?.(option.value);
      setIsOpen(false);
      setSearchQuery("");
      triggerRef.current?.focus();
    },
    [isControlled, onChange]
  );

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;

      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev + 1;
          if (next >= filteredOptions.length) next = 0;
          while (filteredOptions[next]?.disabled && next !== prev) {
            next = (next + 1) % filteredOptions.length;
          }
          return next;
        });
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev - 1;
          if (next < 0) next = filteredOptions.length - 1;
          while (filteredOptions[next]?.disabled && next !== prev) {
            next = (next - 1 + filteredOptions.length) % filteredOptions.length;
          }
          return next;
        });
        break;

      case "Home":
        if (e.target !== searchInputRef.current) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;

      case "End":
        if (e.target !== searchInputRef.current) {
          e.preventDefault();
          setHighlightedIndex(filteredOptions.length - 1);
        }
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const opt = filteredOptions[highlightedIndex];
          if (opt && !opt.disabled) {
            selectOption(opt);
          }
        }
        break;

      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`aft-dropdown aft-dropdown--${size} aft-dropdown--variant-${variant} ${
        fullWidth ? "aft-dropdown--full-width" : ""
      } ${isOpen ? "aft-dropdown--open" : ""} ${disabled ? "aft-dropdown--disabled" : ""} ${
        error ? "aft-dropdown--error" : ""
      } ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for standard HTML form compatibility */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue ?? ""}
          required={required}
          disabled={disabled}
        />
      )}

      {/* Built-in Label if supplied */}
      {label && (
        <label htmlFor={dropdownId} className="aft-dropdown-label">
          {label}
          {required && <span className="aft-dropdown-required">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={dropdownId}
        role="combobox"
        className={`aft-dropdown-trigger ${triggerClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel || label || placeholder}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={toggleDropdown}
      >
        <span className="aft-dropdown-trigger-inner">
          {prefixIcon && <span className="aft-dropdown-prefix-icon">{prefixIcon}</span>}
          {selectedOption ? (
            <span className="aft-dropdown-selection">
              {selectedOption.icon && (
                <span className="aft-dropdown-option-icon">{selectedOption.icon}</span>
              )}
              <span className="aft-dropdown-value-text">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="aft-dropdown-badge">{selectedOption.badge}</span>
              )}
            </span>
          ) : (
            <span className="aft-dropdown-placeholder">{placeholder}</span>
          )}
        </span>

        {/* Animated Dropdown Chevron */}
        <span className="aft-dropdown-chevron" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Floating Dropdown Menu Popover */}
      {isOpen && (
        <div className={`aft-dropdown-menu ${menuClassName}`} role="presentation">
          {/* Optional In-Menu Search Input */}
          {shouldShowSearch && (
            <div className="aft-dropdown-search-wrap">
              <span className="aft-dropdown-search-icon" aria-hidden="true">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                ref={searchInputRef}
                type="text"
                className="aft-dropdown-search-input"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                aria-label={searchPlaceholder}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="aft-dropdown-search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* List of Options */}
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            className="aft-dropdown-list"
            aria-activedescendant={
              highlightedIndex >= 0 ? `${dropdownId}-opt-${highlightedIndex}` : undefined
            }
          >
            {filteredOptions.length === 0 ? (
              <div className="aft-dropdown-empty">No options found</div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === currentValue;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={`${option.value}-${index}`}
                    id={`${dropdownId}-opt-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    className={`aft-dropdown-option ${
                      isSelected ? "aft-dropdown-option--selected" : ""
                    } ${isHighlighted ? "aft-dropdown-option--highlighted" : ""} ${
                      option.disabled ? "aft-dropdown-option--disabled" : ""
                    }`}
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => {
                      if (!option.disabled) setHighlightedIndex(index);
                    }}
                  >
                    <div className="aft-dropdown-option-left">
                      {option.icon && (
                        <span className="aft-dropdown-option-icon">{option.icon}</span>
                      )}
                      <div className="aft-dropdown-option-details">
                        <span className="aft-dropdown-option-label">{option.label}</span>
                        {option.description && (
                          <span className="aft-dropdown-option-desc">{option.description}</span>
                        )}
                      </div>
                    </div>

                    <div className="aft-dropdown-option-right">
                      {option.badge && (
                        <span className="aft-dropdown-badge">{option.badge}</span>
                      )}
                      {isSelected && (
                        <span className="aft-dropdown-checkmark" aria-hidden="true">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Error or Helper Text */}
      {error && <p className="aft-dropdown-error-msg">{error}</p>}
      {!error && helperText && <p className="aft-dropdown-helper-msg">{helperText}</p>}
    </div>
  );
}

/** Convenient alias */
export const Select = Dropdown;

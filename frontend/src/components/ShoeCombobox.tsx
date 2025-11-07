"use client";

import * as React from "react";
import Select from "react-select";

export interface ShoeOption {
  id: number;
  label: string;
}

interface ShoeComboboxProps {
  options: ShoeOption[];
  value: number | null;
  onSelect: (option: ShoeOption | null) => void;
  placeholder?: string;
}

export function ShoeCombobox({ options, value, onSelect, placeholder = "Search shoes" }: ShoeComboboxProps) {
  const selectedOption = React.useMemo(
    () => (value === null ? null : options.find((opt) => opt.id === value) ?? null),
    [value, options]
  );

  const selectValue = selectedOption ? { value: selectedOption.id, label: selectedOption.label } : null;
  const selectOptions = React.useMemo(
    () => options.map((option) => ({ value: option.id, label: option.label })),
    [options]
  );

  return (
    <Select
      instanceId="shoe-combobox"
      classNamePrefix="shoe-combobox"
      placeholder={placeholder}
      options={selectOptions}
      value={selectValue}
      isClearable
      onChange={(option) => {
        if (!option) {
          onSelect(null);
          return;
        }
        const match = options.find((opt) => opt.id === option.value) ?? null;
        onSelect(match);
      }}
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: "var(--card)",
          borderColor: state.isFocused ? "var(--primary)" : "var(--border)",
          boxShadow: state.isFocused ? "0 0 0 1px var(--primary)" : "none",
          color: "var(--foreground)",
          minHeight: "42px",
          ':hover': {
            borderColor: "var(--primary)"
          }
        }),
        input: (base) => ({
          ...base,
          color: "var(--foreground)"
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "var(--card)",
          border: `1px solid var(--border)`
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? "var(--muted)" : state.isSelected ? "var(--primary)" : "transparent",
          color: state.isFocused || state.isSelected ? "var(--foreground)" : "var(--foreground)"
        }),
        singleValue: (base) => ({
          ...base,
          color: "var(--foreground)"
        }),
        placeholder: (base) => ({
          ...base,
          color: "var(--muted-foreground)"
        }),
        clearIndicator: (base) => ({
          ...base,
          color: "var(--muted-foreground)",
          ':hover': { color: "var(--foreground)" }
        }),
        dropdownIndicator: (base, state) => ({
          ...base,
          color: state.isFocused ? "var(--primary)" : "var(--muted-foreground)",
          ':hover': { color: "var(--foreground)" }
        }),
        valueContainer: (base) => ({
          ...base,
          paddingLeft: "0.75rem"
        })
      }}
    />
  );
}

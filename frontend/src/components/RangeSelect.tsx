"use client";

import { useId, useState } from "react";
import {
  CUSTOM_RANGE_VALUE,
  findMatchingRange,
  isCustomRangeValue,
  type RangeOption,
} from "@/lib/ranges";

interface RangeSelectProps {
  ranges: RangeOption[];
  value: string;
  onChange: (value: string) => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
  customMin?: number;
  customStep?: number;
}

export function RangeSelect({
  ranges,
  value,
  onChange,
  allowCustom = true,
  customPlaceholder = "Enter exact amount",
  customMin = 0,
  customStep = 1000,
}: RangeSelectProps) {
  const id = useId();
  const custom = isCustomRangeValue(ranges, value);
  const [showCustom, setShowCustom] = useState(custom);

  const matched = findMatchingRange(ranges, value);
  const selectValue = showCustom || custom
    ? String(CUSTOM_RANGE_VALUE)
    : matched
      ? String(matched.value)
      : "";

  const handleSelect = (raw: string) => {
    if (raw === String(CUSTOM_RANGE_VALUE)) {
      setShowCustom(true);
      if (!custom) onChange("");
      return;
    }
    setShowCustom(false);
    onChange(raw);
  };

  return (
    <div className="range-select">
      <select
        id={id}
        className="form-input"
        value={selectValue}
        onChange={(e) => handleSelect(e.target.value)}
      >
        <option value="">Choose a range…</option>
        {ranges.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
        {allowCustom && (
          <option value={CUSTOM_RANGE_VALUE}>Enter exact amount…</option>
        )}
      </select>
      {(showCustom || custom) && (
        <input
          type="number"
          className="form-input range-custom-input"
          min={customMin}
          step={customStep}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={customPlaceholder}
          aria-label={customPlaceholder}
        />
      )}
    </div>
  );
}

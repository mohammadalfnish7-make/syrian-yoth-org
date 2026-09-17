"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export type GovernorateOption = {
  id: string;
  nameAr: string;
  nameEn: string | null;
};

type GovernorateSearchSelectProps = {
  governorates: GovernorateOption[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  required?: boolean;
};

export function GovernorateSearchSelect({
  governorates,
  value,
  onChange,
  disabled = false,
  required = false,
}: GovernorateSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const selected = governorates.find((gov) => gov.id === value);

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return governorates;

    const lower = trimmed.toLowerCase();
    return governorates.filter(
      (gov) =>
        gov.nameAr.includes(trimmed) ||
        (gov.nameEn?.toLowerCase().includes(lower) ?? false)
    );
  }, [governorates, query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function handleSelect(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  const displayValue = open
    ? query
    : selected
      ? `${selected.nameAr}${selected.nameEn ? ` / ${selected.nameEn}` : ""}`
      : "";

  return (
    <div
      ref={containerRef}
      className={`gov-search-select ${disabled ? "gov-search-select--disabled" : ""} ${open ? "gov-search-select--open" : ""}`}
    >
      <label htmlFor={inputId} className="gov-search-select__label">
        <span className="content-ar">المحافظة</span>
        <span className="content-en">Governorate</span>
        {required ? <span className="gov-search-select__required">*</span> : null}
      </label>

      <div className="gov-search-select__control">
        <Search size={16} className="gov-search-select__search-icon" aria-hidden />
        <input
          id={inputId}
          type="text"
          className="gov-search-select__input"
          disabled={disabled}
          required={required && !value}
          value={displayValue}
          placeholder="ابحث عن المحافظة... / Search governorate..."
          onChange={(event) => {
            setQuery(event.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${inputId}-listbox`}
        />
        {value && !disabled ? (
          <button
            type="button"
            className="gov-search-select__clear"
            onClick={() => {
              onChange("");
              setQuery("");
              setOpen(true);
            }}
            aria-label="Clear selection"
          >
            <X size={14} />
          </button>
        ) : null}
        <ChevronDown size={16} className="gov-search-select__chevron" aria-hidden />
      </div>

      {open && !disabled ? (
        <ul
          id={`${inputId}-listbox`}
          className="gov-search-select__list"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="gov-search-select__empty" role="option">
              <span className="content-ar">لا توجد نتائج</span>
              <span className="content-en">No results</span>
            </li>
          ) : (
            filtered.map((gov) => (
              <li key={gov.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={gov.id === value}
                  className={`gov-search-select__option ${gov.id === value ? "gov-search-select__option--active" : ""}`}
                  onClick={() => handleSelect(gov.id)}
                >
                  <span className="gov-search-select__option-ar">{gov.nameAr}</span>
                  {gov.nameEn ? (
                    <span className="gov-search-select__option-en">{gov.nameEn}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

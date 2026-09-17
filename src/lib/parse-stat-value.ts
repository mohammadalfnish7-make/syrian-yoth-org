export type ParsedStatValue = {
  numeric: number;
  prefix: string;
  suffix: string;
  useGrouping: boolean;
};

export function parseStatValue(value: string): ParsedStatValue {
  const trimmed = value.trim();
  const match = trimmed.match(/^([^0-9]*)([\d,]+)(.*)$/);

  if (!match) {
    return { numeric: 0, prefix: "", suffix: trimmed, useGrouping: false };
  }

  const prefix = match[1];
  const suffix = match[3];
  const rawNumber = match[2];
  const numeric = Number.parseInt(rawNumber.replace(/,/g, ""), 10);
  const useGrouping =
    rawNumber.includes(",") || (Number.isFinite(numeric) && numeric >= 1000);

  return {
    numeric: Number.isFinite(numeric) ? numeric : 0,
    prefix,
    suffix,
    useGrouping,
  };
}

export function formatStatValue(
  amount: number,
  parsed: Pick<ParsedStatValue, "prefix" | "suffix" | "useGrouping">
): string {
  const rounded = Math.round(amount);
  const formatted = parsed.useGrouping
    ? rounded.toLocaleString("en-US")
    : String(rounded);

  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

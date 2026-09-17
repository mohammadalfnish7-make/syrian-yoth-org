import { describe, it, expect } from "vitest";
import {
  parseStatValue,
  formatStatValue,
  easeOutCubic,
} from "@/lib/parse-stat-value";

describe("parseStatValue", () => {
  it("parses plain numbers", () => {
    expect(parseStatValue("10")).toEqual({
      numeric: 10,
      prefix: "",
      suffix: "",
      useGrouping: false,
    });
  });

  it("parses grouped numbers with suffix", () => {
    expect(parseStatValue("1,500+")).toEqual({
      numeric: 1500,
      prefix: "",
      suffix: "+",
      useGrouping: true,
    });
  });

  it("adds grouping for large unformatted numbers", () => {
    expect(parseStatValue("1500+")).toEqual({
      numeric: 1500,
      prefix: "",
      suffix: "+",
      useGrouping: true,
    });
  });

  it("parses large grouped values", () => {
    expect(parseStatValue("500,000+")).toEqual({
      numeric: 500000,
      prefix: "",
      suffix: "+",
      useGrouping: true,
    });
  });

  it("parses large values without commas from database", () => {
    expect(parseStatValue("500000+")).toEqual({
      numeric: 500000,
      prefix: "",
      suffix: "+",
      useGrouping: true,
    });
  });
});

describe("formatStatValue", () => {
  it("preserves suffix and grouping", () => {
    const parsed = parseStatValue("500,000+");
    expect(formatStatValue(250000, parsed)).toBe("250,000+");
  });
});

describe("easeOutCubic", () => {
  it("starts at 0 and ends at 1", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });
});

import { describe, expect, test } from "bun:test";

import {
  applyThemeTo,
  DEFAULT_THEME,
  GLASS_BRUTAL_THEME,
  isThemeEnabled,
  isThemeName,
  resolveStoredTheme,
  THEME_ATTRIBUTE,
  THEMES,
} from "@/utils/theme_flag";

const createRoot = () => {
  const attributes = new Map<string, string>();

  return {
    attributes,
    setAttribute: (name: string, value: string) => {
      attributes.set(name, value);
    },
    removeAttribute: (name: string) => {
      attributes.delete(name);
    },
  };
};

describe("theme flag", () => {
  test("knows its own theme names", () => {
    expect(THEMES).toEqual(["default", "glass-brutal"]);
    expect(DEFAULT_THEME).toBe("default");
    expect(GLASS_BRUTAL_THEME).toBe("glass-brutal");
  });

  test("accepts only declared themes", () => {
    expect(isThemeName("glass-brutal")).toBe(true);
    expect(isThemeName("default")).toBe(true);
    expect(isThemeName("glass-brutalist")).toBe(false);
    expect(isThemeName(undefined)).toBe(false);
    expect(isThemeName(7)).toBe(false);
  });

  test("treats only glass-brutal as an enabled theme", () => {
    expect(isThemeEnabled(GLASS_BRUTAL_THEME)).toBe(true);
    expect(isThemeEnabled(DEFAULT_THEME)).toBe(false);
  });

  test("falls back to the original look for unknown stored values", () => {
    expect(resolveStoredTheme("glass-brutal")).toBe("glass-brutal");
    expect(resolveStoredTheme("neon")).toBe("default");
    expect(resolveStoredTheme(null)).toBe("default");
    expect(resolveStoredTheme(undefined)).toBe("default");
  });

  test("sets the attribute only when the theme is enabled", () => {
    const root = createRoot();

    applyThemeTo(root, GLASS_BRUTAL_THEME);
    expect(root.attributes.get(THEME_ATTRIBUTE)).toBe("glass-brutal");

    applyThemeTo(root, DEFAULT_THEME);
    expect(root.attributes.has(THEME_ATTRIBUTE)).toBe(false);
  });

  test("removing the attribute is a full rollback to the base styles", () => {
    const root = createRoot();

    applyThemeTo(root, GLASS_BRUTAL_THEME);
    applyThemeTo(root, DEFAULT_THEME);

    expect([...root.attributes.keys()]).toEqual([]);
  });
});
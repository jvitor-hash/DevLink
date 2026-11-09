import { cache, CACHE_KEYS } from "@/utils/session_cache";

export const THEME_ATTRIBUTE = "data-theme";

export const THEMES = ["default", "glass-brutal"] as const;

export type ThemeName = (typeof THEMES)[number];

export const DEFAULT_THEME: ThemeName = "default";

export const GLASS_BRUTAL_THEME: ThemeName = "glass-brutal";

type ThemeRoot = {
  setAttribute: (name: string, value: string) => void;
  removeAttribute: (name: string) => void;
};

export const isThemeName = (value: unknown): value is ThemeName =>
  typeof value === "string" && (THEMES as ReadonlyArray<string>).includes(value);

export const isThemeEnabled = (theme: ThemeName): boolean => theme !== DEFAULT_THEME;

// Unknown or tampered storage falls back to the original look rather than throwing.
export const resolveStoredTheme = (raw: unknown): ThemeName => isThemeName(raw) ? raw : DEFAULT_THEME;

export const readStoredTheme = (): ThemeName => resolveStoredTheme(cache.get<string>(CACHE_KEYS.THEME));

export const persistTheme = (theme: ThemeName): void => {
  cache.set(CACHE_KEYS.THEME, theme);
};

export const applyThemeTo = (root: ThemeRoot, theme: ThemeName): void => {
  if (isThemeEnabled(theme)) root.setAttribute(THEME_ATTRIBUTE, theme);
  else root.removeAttribute(THEME_ATTRIBUTE);
};

export const applyTheme = (theme: ThemeName): void => {
  persistTheme(theme);
  applyThemeTo(document.documentElement, theme);
};

export const initializeTheme = (): void => {
  applyThemeTo(document.documentElement, readStoredTheme());
};
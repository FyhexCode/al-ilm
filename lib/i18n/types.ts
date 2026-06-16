export type Locale = "en" | "id";

export const LOCALES: Locale[] = ["en", "id"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  id: "ID",
};

export const STORAGE_KEY = "al-ilm-locale";
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "id";
}

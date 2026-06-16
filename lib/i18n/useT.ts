"use client";

import { useCallback } from "react";
import { useLanguage } from "./useLanguage";
import { translate, type DictKey } from "./dictionary";

/** Returns a `t(key, params?)` bound to the current locale. */
export function useT() {
  const { locale } = useLanguage();
  return useCallback(
    (key: DictKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale]
  );
}

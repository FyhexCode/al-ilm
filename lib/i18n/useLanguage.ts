"use client";

import { useContext } from "react";
import { LanguageContext } from "./LanguageProvider";

export function useLanguage() {
  return useContext(LanguageContext);
}

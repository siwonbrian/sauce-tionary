"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Language } from "./i18n";
import { UI_STRINGS } from "./i18n";

const STORAGE_KEY = "sosaekgwa_lang";

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
  t: (typeof UI_STRINGS)["ko"];
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "ko",
  toggleLanguage: () => {},
  t: UI_STRINGS.ko,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ko");

  // 브라우저에 저장해둔 이전 선택을 불러옴 (없으면 한국어 기본값 유지)
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "ko" || saved === "en") setLanguage(saved);
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next: Language = prev === "ko" ? "en" : "ko";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, t: UI_STRINGS[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

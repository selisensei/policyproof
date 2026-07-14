"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import {
  formatTranslation,
  translations,
  type Locale,
  type TranslationKey,
} from "@/src/i18n/translations";

const STORAGE_KEY = "policyproof-locale";
const CHANGE_EVENT = "policyproof-locale-change";
let fallbackLocale: Locale = "en";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getLocaleSnapshot(): Locale {
  try {
    fallbackLocale = window.localStorage.getItem(STORAGE_KEY) === "fr" ? "fr" : "en";
    return fallbackLocale;
  } catch {
    return fallbackLocale;
  }
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getLocaleSnapshot, (): Locale => "en");
  const setLocale = useCallback((nextLocale: Locale) => {
    fallbackLocale = nextLocale;
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // The in-memory UI still remains usable when browser storage is unavailable.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, values) => formatTranslation(translations[locale][key], values),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider.");
  return context;
}

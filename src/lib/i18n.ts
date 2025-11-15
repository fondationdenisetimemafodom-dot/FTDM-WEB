/*-----------------------------------------------------------------------------------------------------
 | @file     i18n.ts
 | @brief    i18next configuration for handling internationalization in the app
 | @param    --
 | @return   Configured i18n instance
 -----------------------------------------------------------------------------------------------------*/

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";

/*-----------------------------------------------------------------------------------------------------
 | @blocktype Initialization
 | @brief    Initialize i18next with language detection, backend loading, and React binding
 | @param    --
 | @return   Initialized i18n instance
 -----------------------------------------------------------------------------------------------------*/
i18n
  .use(LanguageDetector) // Detects user language from browser/localStorage
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`../locales/${language}/${namespace}.json`)
    )
  )
  .init({
    lng: "fr",
    fallbackLng: "fr",
    debug: import.meta.env.MODE === "development",

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    supportedLngs: ["en", "fr", "it", "de"], // supported languages
  });

export default i18n;

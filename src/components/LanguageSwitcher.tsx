"use client";

import { useTranslation } from "react-i18next";
import { useState } from "react";
import i18n from "../lib/i18n";
/*-----------------------------------------------------------------------------------------------------
 | @constant languages
 | @brief    Defines the list of supported languages with codes, names, and flags
 | @param    --
 | @return   Array of language objects
 -----------------------------------------------------------------------------------------------------*/
const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

/*-----------------------------------------------------------------------------------------------------
 | @function LanguageSwitcher
 | @brief    Provides a simple dropdown menu to switch the app's language using i18next
 | @param    --
 | @return   JSX.Element - language selector UI
 -----------------------------------------------------------------------------------------------------*/
export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);

  // Get the currently active language or fallback to first in list
  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  /*---------------------------------------------------------------------------------------------------
   | @function changeLanguage
   | @brief    Updates the i18next language and closes the dropdown
   | @param    {string} languageCode - code of the new language
   | @return   --
   ---------------------------------------------------------------------------------------------------*/
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 border rounded bg-white text-sm"
      >
        <span>{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
      </button>

      {/* Dropdown list */}
      {open && (
        <ul className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md">
          {languages.map((language) => (
            <li key={language.code}>
              <button
                onClick={() => changeLanguage(language.code)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                  i18n.language === language.code ? "bg-gray-200" : ""
                }`}
              >
                <span className="mr-2">{language.flag}</span>
                {language.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

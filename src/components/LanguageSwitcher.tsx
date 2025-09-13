"use client";

import { useState } from "react";
import i18n from "../lib/i18n";
/*-----------------------------------------------------------------------------------------------------
 | @constant languages
 | @brief    Defines the list of supported languages with codes, names, and flags
 | @param    --
 | @return   Array of language objects
 -----------------------------------------------------------------------------------------------------*/
const languages = [
  { code: "en", name: "English", flag: "EN" },
  { code: "fr", name: "Français", flag: "FR" },
  { code: "it", name: "Italiano", flag: "IT" },
  { code: "de", name: "Deutsch", flag: "DE" },
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
        className="flex items-center gap-1 px-2 py-1 text-lg font-medium text-gray-700 hover:text-color-main-500"
      >
        <span>{currentLanguage.flag}</span>
        <span className="ml-1">▾</span>
      </button>

      {/* Dropdown list */}
      {open && (
        <ul className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-md text-sm">
          {languages.map((language) => (
            <li key={language.code}>
              <button
                onClick={() => changeLanguage(language.code)}
                className={`flex justify-between w-full px-3 py-2 hover:bg-gray-100 ${
                  i18n.language === language.code
                    ? "bg-gray-200 font-semibold"
                    : ""
                }`}
              >
                <span>{language.name}</span>
                <span>{language.flag}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

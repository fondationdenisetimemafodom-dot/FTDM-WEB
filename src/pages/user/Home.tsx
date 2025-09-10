"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/LanguageSwitcher";

function Home() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Language Switcher at the top */}
      <div className="flex justify-end mb-6">
        <LanguageSwitcher />
      </div>
      <div>Home page</div>
      {/* Welcome Message */}
      <h1 className="text-3xl text-amber-400">{t("hero.title")}</h1>
    </div>
  );
}

export default Home;

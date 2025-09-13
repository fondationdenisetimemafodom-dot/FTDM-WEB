"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import UserNavbar from "../../components/UserNavbar";

function Home() {
  const { t } = useTranslation("home");

  return (
    <div>
      <UserNavbar />
      <div>Home page</div>
      {/* Welcome Message */}
      <h1 className="text-3xl text-amber-400">{t("hero.title")}</h1>
    </div>
  );
}

export default Home;

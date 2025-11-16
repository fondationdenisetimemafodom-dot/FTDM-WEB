import React, { useState } from "react";

import CreateProjectView from "../../components/Admin/CreateProjectView";
import ViewProjectsView from "../../components/Admin/ViewProjectsView";
import { useTranslation } from "react-i18next";

const AdminProjects: React.FC = () => {
  const { t } = useTranslation("admin-projects");

  const [activeTab, setActiveTab] = useState<"create" | "view">("create");

  return (
    <div className="bg-bg-blue-100 min-h-screen">
      {/* Header */}
      <div className="">
        <div className="flex items-center px-6 py-4">
          <div>
            <div className="flex items-center space-x-6 ">
              <button
                onClick={() => setActiveTab("create")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "create"
                    ? "text-main-500 "
                    : "text-gray-500 hover:text-gray-700 "
                }`}
              >
                {t("header.createProjects")}
              </button>
              <button
                onClick={() => setActiveTab("view")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "view"
                    ? "text-main-500 "
                    : "text-gray-500 hover:text-gray-700 "
                }`}
              >
                {t("header.viewProjects")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "create" ? <CreateProjectView /> : <ViewProjectsView />}
    </div>
  );
};

export default AdminProjects;

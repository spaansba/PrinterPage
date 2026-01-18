import React, { useState } from "react";

function ToastSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="form-checkbox" />
              <span className="text-blue-900">Public profile</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="form-checkbox" />
              <span className="text-blue-900">Show activity status</span>
            </label>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="form-checkbox" />
              <span className="text-blue-900">Enable notifications</span>
            </label>
          </div>
        );
      case "privacy":
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="form-checkbox" />
              <span className="text-blue-900">Private account</span>
            </label>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <>
      {/* Tabs */}
      <div className="flex border border-gray-500 mb-3 text-xs bg-[#dfdfdf]">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 px-2 py-1 flex items-center justify-center gap-1 ${
            activeTab === "profile"
              ? "bg-[#c0c0c0] border-r border-t border-l border-white"
              : "border-b border-gray-500"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex-1 px-2 py-1 flex items-center justify-center gap-1 ${
            activeTab === "notifications"
              ? "bg-[#c0c0c0] border-r border-t border-l border-white"
              : "border-b border-gray-500"
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`flex-1 px-2 py-1 flex items-center justify-center gap-1 ${
            activeTab === "privacy"
              ? "bg-[#c0c0c0] border-r border-t border-l border-white"
              : "border-b border-gray-500"
          }`}
        >
          Privacy
        </button>
      </div>

      {/* Content */}
      <div className="bg-[#dfdfdf] p-3 border border-gray-400 mb-3">
        {renderContent()}
      </div>
    </>
  );
}

export default ToastSettings;

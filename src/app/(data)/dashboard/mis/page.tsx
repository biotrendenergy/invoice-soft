"use client";

import React from "react";
import { useState } from "react";
import VendorChallanForm from "./_components/VendorChallanForm";
import SlipDetailsForm from "./_components/SlipDetailsForm";

const ChallanForm = () => {
  const [selectedTab, setSelectedTab] = useState("vendor");

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-green-900 tracking-tight">MIS Entry</h1>
        <p className="text-xs text-green-600 mt-0.5">Submit vendor challan and slip details to Google Sheets · BioTrend Energy</p>
      </div>

      {/* Tab Switcher */}
      <div
        className="flex gap-1 rounded-xl p-1 w-fit border border-white/60 shadow-sm"
        style={{ background: "rgba(255,255,255,0.60)", backdropFilter: "blur(12px)" }}
      >
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === "vendor"
              ? "bg-green-500 text-white shadow"
              : "text-gray-500 hover:text-green-700 hover:bg-green-50/60"
          }`}
          onClick={() => setSelectedTab("vendor")}
        >
          Vendor Challan
        </button>
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === "slip"
              ? "bg-green-500 text-white shadow"
              : "text-gray-500 hover:text-green-700 hover:bg-green-50/60"
          }`}
          onClick={() => setSelectedTab("slip")}
        >
          Slip Details
        </button>
      </div>

      {/* Tab Content */}
      <div
        className="rounded-xl p-6 border border-white/60 shadow-lg"
        style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}
      >
        {selectedTab === "vendor" && <VendorChallanForm />}
        {selectedTab === "slip" && <SlipDetailsForm />}
      </div>
    </div>
  );
};

export default ChallanForm;

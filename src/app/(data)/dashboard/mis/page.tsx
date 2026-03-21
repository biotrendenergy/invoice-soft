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
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">MIS Entry</h1>
        <p className="text-xs text-slate-500 mt-0.5">Submit vendor challan and slip details to Google Sheets · BioTrend Energy</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-base-200 border border-base-300 rounded-xl p-1 w-fit">
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === "vendor"
              ? "bg-base-100 text-slate-100 shadow"
              : "text-slate-500 hover:text-slate-300"
          }`}
          onClick={() => setSelectedTab("vendor")}
        >
          Vendor Challan
        </button>
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === "slip"
              ? "bg-base-100 text-slate-100 shadow"
              : "text-slate-500 hover:text-slate-300"
          }`}
          onClick={() => setSelectedTab("slip")}
        >
          Slip Details
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-base-200 border border-base-300 rounded-xl p-6">
        {selectedTab === "vendor" && <VendorChallanForm />}
        {selectedTab === "slip" && <SlipDetailsForm />}
      </div>
    </div>
  );
};

export default ChallanForm;

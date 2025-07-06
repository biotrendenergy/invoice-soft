"use client";

import React from "react";
import { useState } from "react";
import VendorChallanForm from "./_components/VendorChallanForm";
import SlipDetailsForm from "./_components/SlipDetailsForm";

const ChallanForm = () => {
  const [selectedTab, setSelectedTab] = useState("vendor");

  return (
    <div className="tabs tabs-border ">
      {/* Radio input for Vendor Tab */}
      <input
        type="radio"
        name="my_tabs_2"
        id="tab1"
        className="tab"
        aria-label="Vendor Challan"
        checked={selectedTab === "vendor"}
        onChange={() => setSelectedTab("vendor")}
      />

      <div
        className={`tab-content border-base-300 bg-base-100 p-10  ${
          selectedTab === "vendor" ? "block" : "hidden"
        }`}
      >
        <VendorChallanForm />
      </div>

      {/* Radio input for Slip Tab */}
      <input
        type="radio"
        name="my_tabs_2"
        id="tab2"
        className="tab"
        aria-label="Slip Details"
        checked={selectedTab === "slip"}
        onChange={() => setSelectedTab("slip")}
      />

      <div
        className={`tab-content border-base-300 bg-base-100 p-10 ${
          selectedTab === "slip" ? "block" : "hidden"
        }`}
      >
        <SlipDetailsForm />
      </div>
    </div>
  );
};

export default ChallanForm;

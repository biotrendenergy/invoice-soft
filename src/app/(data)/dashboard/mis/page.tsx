"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ocr } from "@/generated/prisma";
import { getAllOcr } from "@/action/ocr";
import axios from "axios";
import { Field } from "./_components/Field";
import VendorChallanForm from "./_components/VendorChallanForm";
import SlipDetailsForm from "./_components/SlipDetailsForm";

type FormValues = {
  vendorName: string;
  vendorChallanDate: string;
  vendorChallanNo: string;
  vendorEwayBillDate: string;
  vendorEwayBillNo: string;
  biomeChallanNo: string;
  vehicleNo: string;
  bteChallanNo: string;
  challanDate: string;
  hsnCode: string;
  registrationState: string;
  gstCode: string;
  gstNumber: string;
  ewayBillDate: string;
  ewayBillNo: string;
  grossWeight: string;
  tareWeight: string;
  netWeightNTPC: string;
  netWeightVendor: string;
};

const ChallanForm = () => {
  const [selectedTab, setSelectedTab] = useState("vendor");

  return (
    <div className="tabs tabs-border">
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
        className={`tab-content border-base-300 bg-base-100 p-10 ${
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

"use client";

import React, { useEffect, useState } from "react";
import RecordTable from "./_record";
import { getAllOcr_all } from "@/action/ocr";
import { ocr } from "@/generated/prisma";

const Page = () => {
  const [ocrData, setOcrData] = useState<ocr[]>([]);

  const fetchData = async () => {
    const data = await getAllOcr_all();
    setOcrData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);
  if (!ocrData) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }
  if (!ocrData || ocrData.length === 0) {
    return <div className="text-center text-gray-500">No records found.</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between my-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Records</h1>
        <p className="text-xs text-slate-500 mt-0.5">All challan records · BioTrend Energy</p>
      </div>
    </div>
      <RecordTable data={ocrData} />
    </>
  );
};

export default Page;

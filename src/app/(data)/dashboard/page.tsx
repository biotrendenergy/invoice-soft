"use client";

import React, { useEffect, useState } from "react";
import RecordTable from "./_record";
import { getAllOcr } from "@/action/ocr";
import { ocr } from "@/generated/prisma";

const Page = () => {
  const [ocrData, setOcrData] = useState<ocr[]>([]);

  const fetchData = async () => {
    const data = await getAllOcr();
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
      <h1 className="text-3xl font-semibold my-3">Records</h1>
      <RecordTable data={ocrData} />
    </>
  );
};

export default Page;

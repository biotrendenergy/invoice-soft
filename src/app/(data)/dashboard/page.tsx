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

  return (
    <>
      <h1 className="text-3xl font-semibold my-3">Records</h1>
      <RecordTable data={ocrData} />
    </>
  );
};

export default Page;

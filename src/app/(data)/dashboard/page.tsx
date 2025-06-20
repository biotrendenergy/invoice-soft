import React from "react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import EditButton from "./_components/editButton";
import DeleteButton from "./_components/deleteButton";
import RecordTable from "./_record";
const Page = async () => {
  const ocrData = await prisma.ocr.findMany();
  return (
    <>
      <h1 className="text-3xl font-semibold my-3"> Records</h1>
      <RecordTable data={ocrData} />
    </>
  );
};

export default Page;

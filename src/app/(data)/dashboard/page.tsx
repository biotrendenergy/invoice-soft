"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import RecordTable from "./_record";
import { getAllOcr_all } from "@/action/ocr";
import { getCurrentUser } from "@/action/user";
import { ocr } from "@/generated/prisma";

const Page = () => {
  const [ocrData, setOcrData] = useState<ocr[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getAllOcr_all().then(setOcrData);
    getCurrentUser().then((u) => setIsAdmin(u?.role === "admin"));
  }, []);

  if (!ocrData || ocrData.length === 0) {
    return <div className="text-center text-gray-500 py-10">No records found.</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between my-4">
        <div>
          <h1 className="text-2xl font-semibold text-green-900 tracking-tight">Records</h1>
          <p className="text-xs text-green-600 mt-0.5">All challan records · BioTrend Energy</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/recycle-bin">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/70 text-red-400 ring-1 ring-red-200 hover:bg-red-50 hover:text-red-500 transition-all duration-150 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Recycle Bin
            </button>
          </Link>
        )}
      </div>
      <RecordTable data={ocrData} isAdmin={isAdmin} />
    </>
  );
};

export default Page;

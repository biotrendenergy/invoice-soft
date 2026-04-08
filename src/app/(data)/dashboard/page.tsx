"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import RecordTable from "./_record";
import { getAllOcr_all } from "@/action/ocr";
import { getCurrentUser } from "@/action/user";
import { ocr } from "@/generated/prisma";

const StatCard = ({
  title,
  subtitle,
  count,
  icon,
  color,
}: {
  title: string;
  subtitle: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <div
    className="rounded-xl px-5 py-4 flex items-center justify-between gap-4 border border-white/60 shadow-md flex-1 min-w-[160px]"
    style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}
  >
    <div>
      <p className="text-2xl font-bold text-green-900">{count}</p>
      <p className="text-sm font-semibold text-gray-700 mt-0.5">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
  </div>
);

const Page = () => {
  const [ocrData, setOcrData] = useState<ocr[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    getAllOcr_all().then(setOcrData);
    getCurrentUser().then((u) => setIsAdmin(u?.role === "admin"));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalChallans = ocrData.length;
  const pendingDeliveries = ocrData.filter(
    (r) => r.delivery_status?.toLowerCase() === "pending" || !r.delivery_status
  ).length;
  const todaysDeliveries = ocrData.filter((r) => {
    const d = new Date(r.delivery_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  }).length;
  const vehiclesInTransit = ocrData.filter(
    (r) => !r.delivery_status || r.delivery_status.trim() === ""
  ).length;
  const completedDeliveries = ocrData.filter((r) =>
    ["delivered", "completed"].includes(r.delivery_status?.toLowerCase() ?? "")
  ).length;

  const filteredData = dateFilter
    ? ocrData.filter((r) => {
        const d = new Date(r.delivery_date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}` === dateFilter;
      })
    : ocrData;

  if (!ocrData || ocrData.length === 0) {
    return <div className="text-center text-gray-500 py-10">No records found.</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between my-4">
        <div>
          <h1 className="text-2xl font-semibold text-green-900 tracking-tight">Records Dashboard</h1>
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

      {/* Stat Cards */}
      <div className="flex flex-wrap gap-3 mb-5">
        <StatCard
          title="Total Challans"
          subtitle="All time records"
          count={totalChallans}
          color="bg-blue-50 text-blue-500"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Pending Deliveries"
          subtitle="Awaiting completion"
          count={pendingDeliveries}
          color="bg-amber-50 text-amber-500"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Today's Deliveries"
          subtitle="Scheduled for today"
          count={todaysDeliveries}
          color="bg-indigo-50 text-indigo-500"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Vehicles in Transit"
          subtitle="Active vehicles"
          count={vehiclesInTransit}
          color="bg-orange-50 text-orange-500"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 17h.01M16 17h.01M5 7h14l1 9H4L5 7zM3 7V5a1 1 0 011-1h2l1 3" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
            </svg>
          }
        />
        <StatCard
          title="Completed Deliveries"
          subtitle="Successfully delivered"
          count={completedDeliveries}
          color="bg-emerald-50 text-emerald-500"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/60 shadow-sm"
          style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}
        >
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-sm text-gray-700 bg-transparent outline-none cursor-pointer"
          />
        </div>
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg ring-1 ring-gray-200 bg-white/60"
          >
            Clear filter
          </button>
        )}
        {dateFilter && (
          <p className="text-xs text-gray-500">
            Showing <span className="font-medium text-gray-700">{filteredData.length}</span> record{filteredData.length !== 1 ? "s" : ""} for selected date
          </p>
        )}
      </div>

      <RecordTable data={filteredData} isAdmin={isAdmin} />
    </>
  );
};

export default Page;

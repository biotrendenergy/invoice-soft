"use client";

import React, { startTransition, useState } from "react";
import Link from "next/link";
import EditButton from "./_components/editButton";
import { ocr } from "@/generated/prisma";
import { deleteMultipleOCR } from "@/action/ocr";

type Record = ocr;

const RecordTable = ({ data, isAdmin }: { data: Record[]; isAdmin: boolean }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (!confirm("Are you sure you want to delete selected records?")) return;
    startTransition(async () => {
      await deleteMultipleOCR(selected.map((v) => Number(v))).then(() => {
        alert("Selected records deleted successfully.");
        setSelected([]);
        window.location.reload();
      });
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "completed":
        return "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-300";
      case "pending":
        return "bg-amber-50 text-amber-600 ring-1 ring-amber-300";
      case "cancelled":
        return "bg-red-50 text-red-500 ring-1 ring-red-300";
      default:
        return "bg-gray-100 text-gray-500 ring-1 ring-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Delete Button — admin only */}
      {isAdmin && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleDeleteSelected}
            disabled={selected.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${selected.length > 0
                ? "bg-red-500/15 text-red-500 ring-1 ring-red-300 hover:bg-red-500/25 cursor-pointer"
                : "bg-white/50 text-gray-400 ring-1 ring-gray-200 cursor-not-allowed"
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Selected
            {selected.length > 0 && (
              <span className="bg-red-100 text-red-500 text-xs px-1.5 py-0.5 rounded-full">
                {selected.length}
              </span>
            )}
          </button>

          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div
        className="overflow-x-auto rounded-xl shadow-lg border border-white/60"
        style={{ background: "rgba(255,255,255,0.60)", backdropFilter: "blur(16px)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b border-green-100/80"
              style={{ background: "rgba(240,253,244,0.80)" }}
            >
              {isAdmin && (
                <th className="px-4 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === data.length && data.length > 0}
                    onChange={(e) =>
                      setSelected(e.target.checked ? data.map((d) => d.id.toString()) : [])
                    }
                    className="w-4 h-4 rounded border-green-300 accent-emerald-500 cursor-pointer"
                  />
                </th>
              )}
              {["#", "Challan", "Address", "Delivery Date", "Vehicle Number", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-green-700 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-green-100/60">
            {data.map((ocr, index) => {
              const isSelected = selected.includes(ocr.id.toString());
              return (
                <tr
                  key={ocr.id}
                  className={`transition-colors duration-100 group
                    ${isSelected
                      ? "bg-emerald-50/70 hover:bg-emerald-50"
                      : "bg-white/30 hover:bg-white/60"
                    }`}
                >
                  {/* Checkbox — admin only */}
                  {isAdmin && (
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(ocr.id.toString())}
                        className="w-4 h-4 rounded border-green-300 accent-emerald-500 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* # */}
                  <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">
                    {index + 1}
                  </td>

                  {/* Challan */}
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-gray-800 font-mono tracking-wide">
                      {ocr.challan}
                    </span>
                  </td>

                  {/* Address */}
                  <td className="px-4 py-3.5 text-gray-500 max-w-[180px] truncate">
                    {ocr.address}
                  </td>

                  {/* Delivery Date */}
                  <td className="px-4 py-3.5">
                    <span className="text-gray-700 bg-green-50/80 px-2.5 py-1 rounded-lg text-xs font-medium ring-1 ring-green-200/60">
                      {new Date(ocr.delivery_date).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </span>
                  </td>

                  {/* Vehicle Number */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-gray-700 bg-green-50/80 px-2.5 py-1 rounded-lg ring-1 ring-green-200/60 tracking-wider">
                      {ocr.vehicle_number}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(ocr.delivery_status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {ocr.delivery_status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link href={`/data/${ocr.id}`}>
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/70 text-gray-600 ring-1 ring-gray-200 hover:bg-white hover:text-gray-900 transition-all duration-150 cursor-pointer whitespace-nowrap shadow-sm">
                          Print Annexure
                        </button>
                      </Link>
                      <Link href={`/challan/${ocr.id}`}>
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white ring-1 ring-green-400 hover:bg-green-600 transition-all duration-150 cursor-pointer whitespace-nowrap shadow-sm">
                          Print Challan
                        </button>
                      </Link>
                      <EditButton {...ocr} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer row count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-gray-400">
          Showing <span className="text-gray-600 font-medium">{data.length}</span> records
        </p>
        {selected.length > 0 && (
          <p className="text-xs text-emerald-600">
            {selected.length} record{selected.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    </div>
  );
};

export default RecordTable;

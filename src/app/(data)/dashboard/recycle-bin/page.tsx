"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRecycleBin, restoreFromRecycleBin, permanentDeleteFromBin } from "@/action/ocr";
import { getCurrentUser } from "@/action/user";
import Pagination from "../_components/Pagination";

type DeletedRecord = {
  id: number;
  originalId: number;
  challan: string;
  vehicle_number: string;
  delivery_status: string;
  net_weight: number;
  address: string;
  deletedAt: Date;
  deletedBy: string;
};

function getTimeRemaining(deletedAt: Date) {
  const expiresAt = new Date(deletedAt).getTime() + 24 * 60 * 60 * 1000;
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return "Expiring soon";
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

function getUrgencyColor(deletedAt: Date) {
  const expiresAt = new Date(deletedAt).getTime() + 24 * 60 * 60 * 1000;
  const remaining = expiresAt - Date.now();
  const hours = remaining / (1000 * 60 * 60);
  if (hours < 2) return "text-red-500 bg-red-50 ring-red-200";
  if (hours < 6) return "text-amber-600 bg-amber-50 ring-amber-200";
  return "text-green-600 bg-green-50 ring-green-200";
}

export default function RecycleBinPage() {
  const router = useRouter();
  const [records, setRecords] = useState<DeletedRecord[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [confirmPermanent, setConfirmPermanent] = useState<DeletedRecord | null>(null);

  const refresh = async () => {
    const data = await getRecycleBin();
    setRecords(data as DeletedRecord[]);
  };

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u || u.role !== "admin") {
        router.replace("/dashboard");
        return;
      }
    });
    refresh();
  }, []);

  const handleRestore = async (id: number) => {
    setLoading(true);
    setActionId(id);
    try {
      await restoreFromRecycleBin(id);
      await refresh();
    } catch (e: any) {
      alert(e.message ?? "Failed to restore");
    } finally {
      setLoading(false);
      setActionId(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirmPermanent) return;
    setLoading(true);
    await permanentDeleteFromBin(confirmPermanent.id);
    setConfirmPermanent(null);
    await refresh();
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <h1 className="text-2xl font-semibold text-green-900 tracking-tight">Recycle Bin</h1>
          </div>
          <p className="text-xs text-green-600 mt-0.5">Deleted records are kept for 24 hours · BioTrend Energy</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-white/70 text-gray-600 ring-1 ring-gray-200 hover:bg-white transition-all shadow-sm"
        >
          ← Back to Records
        </button>
      </div>

      {/* Info banner */}
      <div
        className="rounded-xl px-5 py-3.5 border border-amber-200/60 flex items-start gap-3"
        style={{ background: "rgba(255,251,235,0.70)", backdropFilter: "blur(12px)" }}
      >
        <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="text-xs text-amber-700">
          Records in the recycle bin are <strong>automatically and permanently deleted after 24 hours</strong>.
          Restore a record to bring it back to the main table.
        </p>
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <div
          className="rounded-xl p-16 flex flex-col items-center justify-center gap-3 border border-white/60 shadow-md"
          style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}
        >
          <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <p className="text-gray-400 text-sm font-medium">Recycle bin is empty</p>
          <p className="text-gray-400 text-xs">Deleted records will appear here for 24 hours</p>
        </div>
      ) : (
        <div
          className="overflow-x-auto rounded-xl shadow-lg border border-white/60"
          style={{ background: "rgba(255,255,255,0.60)", backdropFilter: "blur(16px)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-green-100/80" style={{ background: "rgba(240,253,244,0.80)" }}>
                {["Challan", "Vehicle", "Status", "Net Weight", "Deleted By", "Time Remaining", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-green-700 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-green-100/60">
              {records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((record) => (
                <tr key={record.id} className="bg-white/30 hover:bg-white/60 transition-colors duration-100">
                  <td className="px-4 py-3.5 font-medium text-gray-800 font-mono">{record.challan}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-gray-700 bg-green-50/80 px-2.5 py-1 rounded-lg ring-1 ring-green-200/60 tracking-wider">
                      {record.vehicle_number}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                      ${record.delivery_status?.toLowerCase() === "completed"
                        ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-300"
                        : "bg-amber-50 text-amber-600 ring-1 ring-amber-300"
                      }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {record.delivery_status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{record.net_weight} kg</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-gray-500 bg-gray-100/60 px-2 py-0.5 rounded-md">
                      {record.deletedBy}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${getUrgencyColor(record.deletedAt)}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getTimeRemaining(record.deletedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={loading && actionId === record.id}
                        onClick={() => handleRestore(record.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white ring-1 ring-green-400 hover:bg-green-600 transition-all duration-150 shadow-sm disabled:opacity-50"
                      >
                        {loading && actionId === record.id ? "Restoring..." : "Restore"}
                      </button>
                      <button
                        disabled={loading}
                        onClick={() => setConfirmPermanent(record)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 ring-1 ring-red-200 hover:bg-red-100 transition-all duration-150 shadow-sm"
                      >
                        Delete Forever
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-green-100/60">
            <Pagination
              page={page}
              totalPages={Math.ceil(records.length / PAGE_SIZE)}
              onPageChange={setPage}
              totalItems={records.length}
              pageSize={PAGE_SIZE}
            />
          </div>
        </div>
      )}

      {/* Permanent Delete Confirm Modal */}
      {confirmPermanent && (
        <dialog open className="modal modal-open">
          <div
            className="modal-box border border-white/60"
            style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)" }}
          >
            <h3 className="font-bold text-lg text-red-600">Permanently Delete?</h3>
            <p className="py-3 text-gray-600 text-sm">
              This will <strong>permanently delete</strong> challan{" "}
              <strong className="font-mono">{confirmPermanent.challan}</strong> and cannot be undone.
            </p>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handlePermanentDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete Forever"}
              </button>
              <button className="btn" onClick={() => setConfirmPermanent(null)}>Cancel</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setConfirmPermanent(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

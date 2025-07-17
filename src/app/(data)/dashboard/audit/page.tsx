// app/audit/page.tsx
"use client";

import { useState } from "react";
import { getAuditLogs } from "@/action/audit";
import { format } from "date-fns";

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    const logs = await getAuditLogs({ search, from, to });
    setData(logs);
  };

  const downloadCSV = () => {
    const csv = data
      .map(
        (a) =>
          `${a.id},"${a.message}",${a.ip},${format(
            new Date(a.createAt),
            "yyyy-MM-dd HH:mm:ss"
          )}`
      )
      .join("\n");
    const blob = new Blob([`ID,Message,IP,CreatedAt\n${csv}`], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_logs.csv";
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="card shadow-xl p-6 bg-base-100">
        <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search message/IP"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="input input-bordered"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input input-bordered"
          />
          <button onClick={fetchData} className="btn btn-primary">
            Filter
          </button>
          <button onClick={downloadCSV} className="btn btn-outline">
            Download CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm">
            <thead>
              <tr className="uppercase">
                <th>ID</th>
                <th>Message</th>
                <th>IP</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.message}</td>
                    <td>{log.ip}</td>
                    <td>
                      {format(new Date(log.createAt), "yyyy-MM-dd HH:mm:ss")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

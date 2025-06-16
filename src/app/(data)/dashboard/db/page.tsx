"use client";

import { useEffect, useState } from "react";
import { getCompanies, getOcrByCompany } from "@/action/ocr";
import { downloadMediaZip } from "@/utility/downloadZip";

export default function OcrDashboard() {
  const [ocrData, setOcrData] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ocr, comps] = await Promise.all([
          getOcrByCompany(companyId ? parseInt(companyId) : undefined),
          getCompanies(),
        ]);
        setOcrData(ocr);
        setCompanies(comps);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [companyId]);

  const handleDownload = async (companyName: string, medias: any[]) => {
    await downloadMediaZip(companyName, medias);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <select
          className="select select-bordered w-60"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          <option value="">All Companies</option>
          {companies.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-lg font-semibold">
          Loading...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>ID</th>
                <th>Challan</th>
                <th>Company</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>Media Count</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {ocrData.map((ocr) => (
                <tr key={ocr.id}>
                  <td>{ocr.id}</td>
                  <td>{ocr.challan}</td>
                  <td>{ocr.company?.name}</td>
                  <td>{ocr.vendor?.name}</td>
                  <td>{new Date(ocr.created_at).toLocaleString()}</td>
                  <td>{ocr.medias.length}</td>
                  <td>
                    {ocr.medias.length > 0 && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          handleDownload(
                            ocr.company?.name || "media",
                            ocr.medias
                          )
                        }
                      >
                        Download ZIP
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import {
  addMedia,
  addOCRData,
  extractEWayBill_withIn,
  getFilePart,
} from "@/action/ocr";
import { use, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { parse, isValid, set } from "date-fns";
import { companyDetail } from "@/generated/prisma";
import { getAllCompany } from "@/action/company";

// Supported date formats
const formats = [
  "dd/MM/yyyy",
  "MM-dd-yyyy",
  "yyyy/MM/dd",
  "yyyy-MM-dd",
  "dd-MM-yyyy",
  "MM/dd/yyyy",
];

function parseFlexibleDate(dateStr: string) {
  for (const format of formats) {
    const parsedDate = parse(dateStr, format, new Date());
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  }
  return null;
}

const DataComp = ({ index, entry }: { index: number; entry: any }) => {
  const [e_way_bill, setEwayBill] = useState<Number | null>(null);
  const [entryData, setEntryData] = useState<any>(entry);
  const [e_way_bill_date, setEwayBill_date] = useState<Date | null>(null);
  const [e_way_bill_gst, setEwayBill_gst] = useState<string | null>(null);
  const [e_way_bill_file, setEwayBill_file] = useState<File | null>(null);
  const [e_way_bill_ship_to, setEwayBill_ship_to] = useState<string | null>(
    null
  );
  const [invoice, setInvoice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [companies, setCompanies] = useState<companyDetail[] | null>(null);
  const [company, setCompany] = useState<Number | null>(null);
  const [id, setId] = useState<null | number>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const handlePrintData = () => {
    if (id) window.open(`/data/${id}`, "popupWindow");
    else toast.error("No data to print!");
  };

  const handlePrintChallan = () => {
    if (id) window.open(`/challan/${id}`, "popupWindow");
    else toast.error("No data to print!");
  };

  const handlePrintMarges = () => {
    if (id) {
      window.open(`/marge/${id}`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };

  const handlePrintDataSign = () => {
    if (id) window.open(`/data/${id}/sign`, "popupWindow");
    else toast.error("No data to print!");
  };

  const handlePrintChallanSign = () => {
    if (id) window.open(`/challan/${id}/sign`, "popupWindow");
    else toast.error("No data to print!");
  };

  const handlePrintMargesSign = () => {
    if (id) {
      window.open(`/marge/${id}/sign`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };

  const handlePrintData2 = () => {
    if (id) {
      window.open(`/data/${id}/khar`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  const handlePrintMarges2 = () => {
    if (id) {
      window.open(`/marge/${id}/khar`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  const handlePrintChallan2 = () => {
    if (id) {
      window.open(`/challan/${id}/khar`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };

  const handlePrintData2sign = () => {
    if (id) {
      window.open(`/data/${id}/khar/sign`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  const handlePrintMarges2sign = () => {
    if (id) {
      window.open(`/marge/${id}/khar/sign`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  const handlePrintChallan2sign = () => {
    if (id) {
      window.open(`/challan/${id}/khar/sign`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  useEffect(() => {
    (async () => {
      setCompanies(await getAllCompany());
    })();
  }, []);
  useEffect(() => {
    setEntryData(() => {
      if (Number(entry["tare weight"]) > Number(entry["net weight"])) {
        entry = { ...entry, "tare weight": `❌ ${entry["tare weight"]}` };
      }
      if (Number(entry["net weight"]) > Number(entry["gross weight"])) {
        entry = { ...entry, "net weight": `❌ ${entry["net weight"]}` };
      }
      if (
        Number(entry["gross weight"]) !==
        Number(entry["tare weight"]) + Number(entry["net weight"])
      ) {
        entry = { ...entry, "gross weight": `❌ ${entry["gross weight"]}` };
      }
      return entry;
    });
  }, [entry]);

  return (
    <div key={index} className="rounded-xl p-5 flex flex-col gap-4 border border-white/60 shadow-md" style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}>
      {/* Card Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-0.5">Record</p>
          <h3 className="text-lg font-semibold text-green-900 tracking-tight">Vehicle #{index + 1}</h3>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Company (short name)</label>
          <select
            className="select select-bordered select-sm"
            value={company?.toString()}
            onChange={(e) => setCompany(Number(e.target.value))}
          >
            <option value="" disabled>Select short name</option>
            {companies?.map((v) => (
              <option key={v.id} value={v.id}>{v.shotName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Date", value: entryData["date"] },
          { label: "Vehicle Number", value: entryData["vehicle no"] },
          { label: "Invoice Number", value: invoice },
          { label: "Gross Weight (kg)", value: entryData["gross weight"] },
          { label: "Tare Weight (kg)", value: entryData["tare weight"] },
          { label: "Net Weight (kg)", value: entryData["net weight"] },
          { label: "Section A Weight (kg)", value: entryData["a weight"] },
          { label: "Section B Weight (kg)", value: entryData["b weight"] },
        ].map(({ label, value }) => (
          <div key={label} className="bg-green-50/80 rounded-lg px-4 py-3 ring-1 ring-green-100">
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900">{value || "-"}</p>
          </div>
        ))}
      </div>

      {/* E-Way Bill Upload */}
      {!e_way_bill && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Add E-Way Bill (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            className="file-input file-input-bordered w-full"
            ref={inputRef}
            disabled={loading}
            onChange={async (e) => {
              setLoading(true);
              if (!e.target.files) return;
              const file = await getFilePart(e.target.files[0]);
              const eWayBillData = await extractEWayBill_withIn(file);
              if (eWayBillData.vehicle_number !== entryData["vehicle no"]) {
                setEntryData((prev: any) => ({
                  ...prev,
                  "vehicle no": `❌ ${entryData["vehicle no"]} (E-way bill has ${eWayBillData.vehicle_number})`,
                }));
                setLoading(false);
                return;
              }
              setEwayBill(Number(eWayBillData.EWayBillNumber));
              setInvoice(eWayBillData.ChallanOrInvoiceNumber);
              setEwayBill_date(parseFlexibleDate(eWayBillData.generated_date));
              setEwayBill_gst(eWayBillData.gst_no);
              setEwayBill_ship_to(eWayBillData.shipping_address);
              setEwayBill_file(e.target.files[0]);
              setLoading(false);
            }}
          />
        </div>
      )}

      {/* Save Button */}
      {e_way_bill && !id && (
        <button
          className="btn btn-green w-full"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const parseDate = (d: string) => {
              const [day, month, year] = d.split("/");
              return new Date(`${year}-${month}-${day}`);
            };
            const safeNumber = (value: string) =>
              Number(value.replace(/[^\d.-]/g, "") || 0);
            try {
              const data = await addOCRData({
                id: 0,
                A_weight: safeNumber(entryData["a weight"] ?? "0"),
                B_weight: safeNumber(entryData["b weight"] ?? "0"),
                challan: invoice || "",
                address: "Default address or dynamic input",
                map_url: "https://maps.google.com/?q=26.9124,75.7873",
                latitude: 26.9124,
                longitude: 75.7873,
                delivery_date: new Date(),
                delivery_status: "pending",
                net_weight: safeNumber(entryData["net weight"] ?? "0"),
                tare_weight: safeNumber(entryData["tare weight"] ?? "0"),
                gross_weight: safeNumber(entryData["gross weight"] ?? "0"),
                vehicle_number: entryData["vehicle no"] || "",
                date: parseDate(
                  entryData["date"] && entryData["date"] !== ""
                    ? entryData["date"]
                    : new Date() ?? new Date()
                ),
                created_at: new Date(),
                e_way_bill: (e_way_bill ?? 0).toString(),
                e_way_bill_gst: e_way_bill_gst ?? "",
                vendorDetailId: null,
                companyDetailId: company?.valueOf() ?? null,
                e_way_bill_date: e_way_bill_date ?? new Date(),
                e_way_bill_ship_to: e_way_bill_ship_to,
                e_way_bill_bill_to: "",
              });
              if (!data || data instanceof Error) {
                toast.error(data.message);
                return;
              }
              if (e_way_bill_file)
                await addMedia("E-Way bill - " + invoice, e_way_bill_file, data.id);
              setId(data.id);
              localStorage.removeItem("ocr_input_text");
            } catch (e) {
              console.error(e);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Saving..." : "Save Record"}
        </button>
      )}

      {/* Print Buttons */}
      {id && e_way_bill && (
        <div className="flex flex-wrap gap-2 pt-1">
          {companies?.find((v) => v.id == company)?.shotName.toLowerCase() !== "dadri" && (
            <>
              <button className="btn btn-green btn-sm" onClick={handlePrintData}>Print Annexure</button>
              <button className="btn btn-green btn-sm" onClick={handlePrintChallan}>Print Challan</button>
              <button className="btn btn-green btn-sm" onClick={handlePrintMarges}>Merge PDF</button>
              <button className="btn btn-green btn-sm" onClick={handlePrintMargesSign}>Merge PDF (Signed)</button>
            </>
          )}
          {companies?.find((v) => v.id == company)?.shotName.toLowerCase() === "dadri" && (
            <>
              <button className="btn btn-green btn-sm" onClick={handlePrintData2}>Print Annexure 2</button>
              <button className="btn btn-green btn-sm" onClick={handlePrintChallan2}>Print Challan 2</button>
              <button className="btn btn-green btn-sm" onClick={handlePrintMarges2}>Merge PDF 2</button>
              <button className="btn btn-green btn-sm" onClick={handlePrintMarges2sign}>Merge PDF (Signed) 2</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const LOCAL_STORAGE_KEY = "ocr_input_text";
  const [input, setInput] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const savedInput = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedInput) setInput(savedInput);
  }, []);

  // Save to localStorage whenever input changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, input);
  }, [input]);

  // Split input into entries
  const parseBlock = (block: string) => {
    const lines = block.trim().split("\n");
    const data: Record<string, string> = {};
    lines.forEach((line) => {
      const [keyPart, ...valueParts] = line.split("-");
      if (!keyPart || valueParts.length === 0) return;
      const key = keyPart.trim().toLowerCase();
      const value = valueParts.join("-").trim();
      data[key] = value;
    });
    return data;
  };

  const entries = input
    .trim()
    .split(/\n\s*\n/)
    .map(parseBlock);

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-green-900 tracking-tight">Text Entry</h1>
        <p className="text-xs text-green-600 mt-0.5">Paste raw text records to extract and save challan data · BioTrend Energy</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Input Panel */}
        <div className="rounded-xl p-5 flex flex-col gap-3 border border-white/60 shadow-md" style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}>
          <h2 className="text-xs font-semibold text-green-600 uppercase tracking-widest">Input</h2>
          <label className="text-sm font-medium text-gray-700">Enter Multiple Records</label>
          <textarea
            className="textarea textarea-bordered w-full min-h-[400px] text-sm"
            placeholder={"date - 01/01/2025\nvehicle no - HR55AM1234\ngross weight - 5000\ntare weight - 2000\nnet weight - 3000\na weight - 1500\nb weight - 1500\n\n(blank line separates records)"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Parsed Records */}
        <div className="flex flex-col gap-4">
          {entries.length === 0 || (entries.length === 1 && Object.keys(entries[0]).length === 0) ? (
            <div className="rounded-xl p-10 flex flex-col items-center justify-center gap-2 border border-white/60 shadow-md" style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}>
              <p className="text-gray-400 text-sm font-medium">No records parsed yet</p>
              <p className="text-gray-400 text-xs">Paste text on the left to see records here</p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <DataComp entry={entry} index={index} key={index} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

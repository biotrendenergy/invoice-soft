"use client";

import { addOCRData, extractEWayBill_withIn, getFilePart } from "@/action/ocr";
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
      return entry;
    });
  }, [entry]);

  return (
    <div key={index} className="overflow-x-auto rounded-xl shadow-md p-4">
      <div className="text-lg font-semibold mb-2 flex w-full justify-between">
        Vehicle Record #{index + 1}
        <div>
          <label className="text-sm">Company (short name)</label>
          <select
            className="select"
            value={company?.toString()}
            onChange={(e) => setCompany(Number(e.target.value))}
          >
            <option value="" selected disabled>
              Select Invoice (short name)
            </option>
            {companies?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.shotName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="table table-zebra w-full">
        <tbody>
          <tr>
            <th>Date</th>
            <td>{entryData["date"] || "-"}</td>
          </tr>
          <tr>
            <th>Vehicle Number</th>
            <td>{entryData["vehicle no"] || "-"}</td>
          </tr>
          <tr>
            <th>Invoice Number</th>
            <td>{invoice || "-"}</td>
          </tr>
          <tr>
            <th>Gross Weight (kg)</th>
            <td>{entryData["gross weight"] || "-"}</td>
          </tr>
          <tr>
            <th>Tare Weight (kg)</th>
            <td>{entryData["tare weight"] || "-"}</td>
          </tr>
          <tr>
            <th>Net Weight (kg)</th>
            <td>{entryData["net weight"] || "-"}</td>
          </tr>
          <tr>
            <th>Section A Weight (kg)</th>
            <td>{entryData["a weight"] || "-"}</td>
          </tr>
          <tr>
            <th>Section B Weight (kg)</th>
            <td>{entryData["b weight"] || "-"}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex gap-1.5 my-2">
        {!e_way_bill && (
          <div className="flex flex-col">
            <label>Add e-way bill</label>
            <input
              type="file"
              accept=".pdf"
              className="input file-input"
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
                  console.log(entryData);
                  setLoading(false);

                  return;
                }

                setEwayBill(Number(eWayBillData.EWayBillNumber));
                setInvoice(eWayBillData.ChallanOrInvoiceNumber);
                setEwayBill_date(
                  parseFlexibleDate(eWayBillData.generated_date)
                );
                setEwayBill_gst(eWayBillData.gst_no);
                setEwayBill_ship_to(eWayBillData.shipping_address);
                setLoading(false);
              }}
            />
            {/* <button
              className="btn btn-active"
              onClick={() => inputRef.current?.click()}
            >
              Add E-way Bill
            </button> */}
          </div>
        )}

        {e_way_bill && !id && (
          <button
            className="btn btn-accent"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const parseDate = (d: string) => {
                const [day, month, year] = d.split("/");
                return new Date(`20${year}-${month}-${day}`);
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
                  delivery_status: "Pending",
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

                setId(data.id);
                localStorage.removeItem("ocr_input_text"); // Optional: clear saved text on submit
              } catch (e) {
                console.error(e);
              } finally {
                setLoading(false);
              }
            }}
          >
            Add Data
          </button>
        )}

        {id && e_way_bill && (
          <>
            <button className="btn btn-accent" onClick={handlePrintData}>
              Print Annexure
            </button>
            <button className="btn btn-accent" onClick={handlePrintChallan}>
              Print Challan
            </button>
            <button className="btn btn-accent" onClick={handlePrintMarges}>
              merge pdf
            </button>
          </>
        )}
      </div>
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
    <main className="min-h-screen p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Textarea Input */}
        <div>
          <label className="label">
            <span className="label-text text-lg font-semibold">
              Enter Multiple Records
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full h-full min-h-[400px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Rendered Tables */}
        <div className="space-y-6">
          {entries.map((entry, index) => (
            <DataComp entry={entry} index={index} key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}

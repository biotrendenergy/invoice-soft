"use client";

import {
  ExtractDataFORCompar,
  extractEWayBill,
  getAllOcr,
  getChallanNumber,
  getFilePart,
} from "@/action/ocr";
import { ocr } from "@/generated/prisma";
import { useState, useRef, DragEvent, ChangeEvent, useEffect } from "react";
import { toast } from "sonner";
const normalizeWeight = (value: string | null) => {
  if (!value) return null;
  const match = value.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
  if (!match) return value.trim(); // fallback: return as-is

  const [, number, unit] = match;
  let normalizedUnit = unit.toLowerCase();

  // Convert known variants to standard form
  if (normalizedUnit === "kgs") normalizedUnit = "kg";
  if (normalizedUnit === "mts") normalizedUnit = "mt";

  // Remove .00 if present
  const cleanNumber = number.endsWith(".00")
    ? parseInt(number).toString()
    : parseInt(number).toString();
  console.log(cleanNumber, cleanNumber.replace(",", ""));

  return `${cleanNumber} ${normalizedUnit}`;
};

const Page = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [rightFile, setRightFile] = useState<File[] | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const rightInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    setLoading(true);
    let leftData = {};
    let rightData = {};
    if (rightFile && ocrData) {
      leftData = [
        {
          vehicle_number: ocrData.vehicle_number,
          date: ocrData.date.toLocaleDateString("en-GB").split("/").join("-"),
          net_weight: ocrData.net_weight + " kg",
        },
      ];
      // leftData = await Promise.all(
      //   leftFile.map(async (e) => {
      //     const filePart = await getFilePart(e);
      //     return ExtractDataFORCompar(filePart);
      //   })
      // );
      rightData = await Promise.all(
        rightFile.map(async (e) => {
          const filePart = await getFilePart(e);
          return ExtractDataFORCompar(filePart);
        })
      );
    }
    console.log(leftData, rightData);

    // Compare leftData and rightData and show result
    // Assuming leftData and rightData are arrays of objects (one per file)
    let resultMessage = "";
    if (Array.isArray(leftData) && Array.isArray(rightData)) {
      const mismatches: string[] = [];
      leftData.forEach((leftObj, i) => {
        const rightObj = rightData[i];

        if (rightObj) {
          Object.keys(leftObj).forEach((key) => {
            let leftVal = leftObj[key];
            let rightVal = rightObj[key];
            if (rightObj[key] == null) {
              return;
            }
            if (key === "net_weight") {
              leftVal = normalizeWeight(leftVal);
              rightVal = normalizeWeight(rightVal);
            }
            if (leftVal !== rightVal) {
              mismatches.push(`File ${i + 1}: Field "${key}" does not match`);
            }
          });
        }
      });
      if (mismatches.length === 0) {
        resultMessage = "All fields match!";
        if (rightFile) {
          let data = await getChallanNumber(
            await Promise.all(
              rightFile.map(async (e) => {
                const filePart = await getFilePart(e);
                return filePart;
              })
            )
          );
          localStorage.setItem(
            `data_for_mis_${ocrData?.id}`,
            JSON.stringify(data)
          );
          toast.success("Data saved successfully!");
        }
      } else {
        resultMessage = "Mismatches found:\n" + mismatches.join("\n");
      }
    } else {
      resultMessage = "Comparison failed: Data format error.";
    }
    setResultMessage(resultMessage);
    setLoading(false);
    console.log(leftData, rightData);
  };

  const handleDrop = (
    e: DragEvent<HTMLDivElement>,
    setFile: React.Dispatch<React.SetStateAction<File[] | null>>
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setFile((pri) => (pri ? [...pri, file] : [file]));
    }
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File[] | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setFile((pri) => (pri ? [...pri, file] : [file]));
    }
  };

  const [ocr, setOcr] = useState<ocr[]>([]);
  const [ocrData, setOcrData] = useState<ocr>();
  useEffect(() => {
    (async () => {
      setOcr(await getAllOcr());
    })();
  }, []);
  const isMatch = resultMessage === "All fields match!";

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">PDF Compare</h1>
        <p className="text-xs text-slate-500 mt-0.5">Compare challan records against uploaded PDFs · BioTrend Energy</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Left — Challan Selector */}
        <div className="bg-base-200 border border-base-300 rounded-xl p-5 flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Step 1 — Select Challan</h2>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Challan Record</label>
            <select
              className="select select-bordered w-full"
              defaultValue=""
              onChange={(v) =>
                setOcrData(ocr.filter((xx) => xx.id == Number(v.target.value))[0])
              }
            >
              <option value="" disabled>Select challan</option>
              {ocr?.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.challan || `OCR #${o.id}`}
                </option>
              ))}
            </select>
          </div>

          {ocrData && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: "Vehicle Number", value: ocrData.vehicle_number },
                { label: "Date", value: new Date(ocrData.date).toLocaleDateString("en-GB") },
                { label: "Net Weight (kg)", value: ocrData.net_weight },
                { label: "Challan", value: ocrData.challan },
              ].map(({ label, value }) => (
                <div key={label} className="bg-base-300 rounded-lg px-4 py-3">
                  <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-slate-100">{String(value ?? "-")}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — PDF Upload */}
        <div className="bg-base-200 border border-base-300 rounded-xl p-5 flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Step 2 — Upload PDF(s)</h2>
          <div
            className="border-2 border-dashed border-base-300 hover:border-primary rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, setRightFile)}
            onClick={() => rightInputRef.current?.click()}
          >
            <p className="text-slate-400 text-sm">Drop PDF here or click to browse</p>
            <p className="text-slate-600 text-xs">Only PDF files are accepted</p>
            <input
              ref={rightInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e, setRightFile)}
            />
          </div>

          {rightFile && rightFile.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {rightFile.map((d, i) => (
                <div key={i} className="bg-base-300 rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <span className="text-slate-400 text-sm">📄</span>
                  <span className="text-sm text-slate-200 truncate">{d.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compare Action + Result */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-primary"
            disabled={!rightFile || !ocrData || loading}
            onClick={handleSubmit}
          >
            {loading ? "Comparing..." : "Compare"}
          </button>

          {resultMessage && (
            <button
              disabled={loading}
              className="btn btn-ghost text-warning"
              onClick={async () => {
                setLoading(true);
                if (rightFile) {
                  let data = await getChallanNumber(
                    await Promise.all(
                      rightFile.map(async (e) => {
                        const filePart = await getFilePart(e);
                        return filePart;
                      })
                    )
                  );
                  localStorage.setItem(`data_for_mis_${ocrData?.id}`, JSON.stringify(data));
                  toast.success("Data saved successfully!");
                }
                setLoading(false);
              }}
            >
              Accept anyway
            </button>
          )}
        </div>

        {resultMessage && (
          <div className={`bg-base-200 border rounded-xl px-5 py-4 ${isMatch ? "border-success/40" : "border-error/40"}`}>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${isMatch ? "text-success" : "text-error"}`}>
              {isMatch ? "Result — Match" : "Result — Mismatch"}
            </p>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{resultMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

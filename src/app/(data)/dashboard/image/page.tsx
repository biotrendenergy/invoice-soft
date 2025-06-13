"use client";
import {
  addOCRData,
  extractData,
  extractData_AllWight,
  ExtractDataJsonType,
  extractEWayBill,
  extractFromImages,
  getFilePart,
  ocrCount,
} from "@/action/ocr";
import { companyDetail, ocr, vendorDetail } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import React, { useEffect, useState } from "react";
import { toast } from "sonner"; // For notifications
import EditButton from "../_components/editButton";
import { getAllVendor } from "@/action/vendores";
import { getAllCompany } from "@/action/company";
// Import styles for the toast notifications
import { parse, isValid } from "date-fns";
import { incrementString } from "@/utility/getPrefixData";

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
  return null; // Couldn't parse with known formats
}
const Page = () => {
  const [netWeight, setNetWeight] = useState<ExtractDataJsonType | null>(null);
  const [grossWeight, setGrossWeight] = useState<ExtractDataJsonType | null>(
    null
  );
  const [tarWeight, setTarWeight] = useState<ExtractDataJsonType | null>(null);
  const [data, setData] = useState<ocr | null>(null); // Store extracted data
  const [loading, setLoading] = useState(false); // Loading state for the process
  const [ewayBill, setEwayBill] = useState<Number | null>(null);
  const [ewayBill_date, setEwayBill_date] = useState<Date | null>(null);
  const [invoiceString, setInvoiceString] = useState<string | null>(null);
  const [vender, setVendor] = useState<number | null>(null);
  const [vendors, setVendors] = useState<vendorDetail[] | null>(null);
  const [companies, setCompanies] = useState<companyDetail[] | null>(null);
  const [company, setCompany] = useState<Number | null>(null);
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    if (!e.target.files || !e.target.files[0]) {
      toast("file not found!!");
      return;
    }

    if (type === "net") {
      let dataPart = await getFilePart(e.target.files[0]);
      let getData = await extractData(dataPart);
      setNetWeight(getData);
      return;
    } else if (type === "gross") {
      let dataPart = await getFilePart(e.target.files[0]);
      let getData = await extractData(dataPart);
      setGrossWeight(getData);
      return;
    } else if (type === "tare") {
      let dataPart = await getFilePart(e.target.files[0]);
      let getData = await extractData(dataPart);
      setTarWeight(getData);
      return;
    } else if (type === "e-way_bill") {
      let dataPart = await getFilePart(e.target.files[0]);
      const data = await extractEWayBill(dataPart);
      console.log(data);

      setEwayBill(Number(data.eway_bill_no));
      setEwayBill_date(parseFlexibleDate(data.generated_date));
      return;
    }
  };

  const handleExtractData = async () => {
    console.log(netWeight, grossWeight, tarWeight);

    if (!netWeight || !grossWeight || !tarWeight) {
      toast.error("Please upload all three images!");
      return;
    }

    setLoading(true);
    try {
      /**
       *
       * tare weight is empty track
       * a weight = net_weight - tare weight
       * b weight =
       */
      const tare = tarWeight.weight;
      const a_weight = Math.abs(netWeight.weight - tarWeight.weight);
      const b_weight = Math.abs(netWeight.weight - grossWeight.weight);
      const gross = grossWeight.weight;
      const net_weight = a_weight + b_weight;

      // Prepare all required fields for ocr type
      const selectCompany = companies?.filter(
        (v) => v.id == Number(company)
      )[0];
      console.log(selectCompany, company);

      const ocrCountValue = (await ocrCount(company?.valueOf() ?? 0)) + 1;
      const getPre = incrementString(
        selectCompany?.stringNumber!,
        ocrCountValue
      );
      console.log(getPre);

      const challanNumber = `${selectCompany?.shotName}${getPre?.prefix}${getPre?.number}`;
      const ocrPayload = {
        A_weight: b_weight == tare ? 0 : a_weight,
        B_weight: b_weight == tare ? 0 : b_weight,
        gross_weight: gross,
        tare_weight: tare,
        net_weight: net_weight,
        challan: `${challanNumber}`, // Prefix with 000
        address: grossWeight.address,
        map_url: grossWeight.map_url,
        latitude: grossWeight.latitude,
        longitude: grossWeight.longitude,
        delivery_date: new Date(),
        delivery_status: "",
        vehicle_number: grossWeight.vehicle_number,
        created_at: new Date(),
        date: new Date(),
        e_way_bill: ewayBill?.toString() ?? "",
        companyDetailId: company ?? undefined,
        vendorDetailId: vender ?? undefined,
        e_way_bill_date: ewayBill_date,
      };

      const result = await addOCRData(ocrPayload as any);
      if (result instanceof Error || !result) {
        console.log(result);

        toast.error("Failed to save data!");
      } else {
        setData(result);
        toast.success("Data extracted successfully!");
      }
    } catch (error) {
      console.log(error);

      toast.error("Error extracting data: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintData = () => {
    if (data) {
      window.open(`/data/${data.id}`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  const handlePrintChallan = () => {
    if (data) {
      window.open(`/challan/${data.id}`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };

  useEffect(() => {
    (async () => {
      setVendors(await getAllVendor());
    })();
    (async () => {
      setCompanies(await getAllCompany());
    })();
  }, []);
  return (
    <div className="flex">
      {/* Left Column - File Upload */}
      <div className="flex p-6">
        <div className="flex-1 mr-6">
          <h2 className="text-2xl mb-4">Upload Images</h2>

          <div className="flex flex-col">
            <label>Vendor Name</label>
            <select
              className="select select-bordered"
              defaultValue=""
              onChange={(v) => {
                setVendor(Number(v.target.value));
              }}
            >
              <option value="" disabled>
                Select vendor
              </option>
              {vendors?.map((ocr) => (
                <option key={ocr.id} value={ocr.id}>
                  {ocr.name || `OCR #${ocr.id}`}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="fieldset mb-4">
            <legend className="fieldset-legend">Short name</legend>
            <select
              className="select"
              value={company?.toString() ?? ""}
              onChange={(e) => {
                console.log("sss->", e.target.value.split("$").at(-1));

                setInvoiceString(e.target.value.split("$").at(-1) || "");
                setCompany(Number(e.target.value));
              }}
            >
              <option value="" disabled>
                Select short name
              </option>
              {companies?.map((v, i) => (
                <option value={v.id}>{v.shotName}</option>
              ))}
              {/* <option
                value={`SKILL FLARE TECHNOLOGIES$CT/${year
                  .toString()
                  .slice(-2)}-${(year + 1).toString().slice(-2)}/`}
              >
                SKILL FLARE TECHNOLOGIES
              </option>
              <option
                value={`SHUBHSHREE$BTE/SUB-${year.toString().slice(-2)}${(
                  year + 1
                )
                  .toString()
                  .slice(-2)}-`}
              >
                SHUBHSHREE
              </option>
              <option value={`BTE$NTPC/KHAR/`}>BTE</option>
              <option
                value={`RELIABLE BIO PRODUCT$DF/${year.toString().slice(-2)}-${(
                  year + 1
                )
                  .toString()
                  .slice(-2)}/`}
              >
                RELIABLE BIO PRODUCT
              </option>
              <option
                value={`RBIOME$BI/${year.toString().slice(-2)}-${(year + 1)
                  .toString()
                  .slice(-2)}/`}
              >
                RBIOME
              </option>
              <option value={`BIOME SOLAPUR PLANT$BI/NTPC/SOL/`}>
                BIOME SOLAPUR PLANT
              </option> */}
            </select>
          </fieldset>

          {/* DaisyUI Tabs with radio inputs */}
          <div className="tabs tabs-lifted mb-6">
            <input
              type="radio"
              name="upload_mode"
              role="tab"
              className="tab"
              aria-label="Multi Upload"
              defaultChecked
            />
            <form
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 p-6"
            >
              {/* === Multi Upload Content === */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Eway Bill (PDF)</legend>
                <input
                  type="file"
                  className="file-input"
                  onChange={(e) => handleFileChange(e, "e-way_bill")}
                  accept=".pdf"
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Tare Image</legend>
                <input
                  type="file"
                  className="file-input"
                  onChange={(e) => handleFileChange(e, "tare")}
                  accept="image/*"
                />
              </fieldset>

              <div className="flex w-full gap-4">
                <fieldset className="flex-1 mb-4">
                  <legend className="fieldset-legend">Net Weight (A)</legend>
                  <input
                    type="file"
                    className="file-input"
                    onChange={(e) => handleFileChange(e, "net")}
                    accept="image/*"
                  />
                </fieldset>
                <fieldset className="flex-1 mb-4">
                  <legend className="fieldset-legend">Net Weight (B)</legend>
                  <input
                    type="file"
                    className="file-input"
                    onChange={(e) => handleFileChange(e, "gross")}
                    accept="image/*"
                  />
                </fieldset>
              </div>
            </form>

            <input
              type="radio"
              name="upload_mode"
              role="tab"
              className="tab"
              aria-label="Single Upload"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 p-6"
            >
              {/* === Single Upload Content === */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Eway Bill (PDF)</legend>
                <input
                  type="file"
                  className="file-input"
                  onChange={(e) => handleFileChange(e, "e-way_bill")}
                  accept=".pdf"
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  All Weights in One Image
                </legend>
                <input
                  type="file"
                  className="file-input"
                  accept="image/*"
                  onChange={async (e) => {
                    if (!e.target.files || !e.target.files[0]) {
                      toast("file not found!");
                      return;
                    }
                    const part = await getFilePart(e.target.files[0]);
                    const result = await extractData_AllWight(part);
                    setGrossWeight({
                      ...result,
                      weight: result.gross_weight ?? 0,
                      vehicle_number: result.vehicle_number ?? "",
                      address: result.address ?? "",
                      map_url: result.map_url ?? "",
                      date: new Date(),
                      latitude: result.latitude ?? 0,
                      longitude: result.longitude ?? 0,
                    });
                    setNetWeight({
                      ...result,
                      weight: result.net_weight ?? 0,
                      vehicle_number: result.vehicle_number ?? "",
                      address: result.address ?? "",
                      map_url: result.map_url ?? "",
                      date: new Date(),
                      latitude: result.latitude ?? 0,
                      longitude: result.longitude ?? 0,
                    });
                    setTarWeight({
                      ...result,
                      weight: result.tare_weight ?? 0,
                      vehicle_number: result.vehicle_number ?? "",
                      address: result.address ?? "",
                      map_url: result.map_url ?? "",
                      date: new Date(),
                      latitude: result.latitude ?? 0,
                      longitude: result.longitude ?? 0,
                    });
                  }}
                />
              </fieldset>
            </div>
          </div>

          {/* Gross weight (common field) */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">
              Gross weight (Auto-filled)
            </legend>
            <input
              type="text"
              disabled
              className="input input-bordered w-full"
              value={grossWeight?.weight || ""}
            />
          </fieldset>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleExtractData}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Processing..." : "Extract Data"}
            </button>
            {data && <EditButton {...data} />}
          </div>
        </div>
      </div>

      <div className="flex p-6">
        {/* Right Column - Display Extracted Data */}
        <div className="flex-1">
          <h2 className="text-2xl mb-4">Extracted Data</h2>
          {data ? (
            <div className=" p-4 rounded-lg">
              <p>
                <strong>Date:</strong> {new Date(data.date).toLocaleString()}
              </p>
              <p>
                <strong>Vehicle Number:</strong> {data.vehicle_number}
              </p>
              <p>
                <strong>Gross weight:</strong> {data.gross_weight}
              </p>
              <p>
                <strong>Tare weight:</strong> {data.tare_weight}
              </p>
              <p>
                <strong>Net weight:</strong> {data.net_weight}
              </p>
              <p>
                <strong>A weight:</strong> {data.A_weight}
              </p>
              <p>
                <strong>B weight:</strong> {data.B_weight}
              </p>
              {/* <p><strong>Map URL:</strong> <a href={data.map_url} target="_blank" rel="noopener noreferrer">Open Map</a></p> */}
              {/* <p><strong>Latitude:</strong> {data.latitude}</p> */}
              {/* <p><strong>Longitude:</strong> {data.longitude}</p> */}
              {/* <p><strong>Date:</strong> {new Date(data.date).toLocaleString()}</p> */}
              <button
                onClick={handlePrintData}
                className="btn btn-secondary mt-4"
              >
                Print annexure
              </button>
              <button
                onClick={handlePrintChallan}
                className="btn btn-secondary mt-4"
              >
                Print Challan
              </button>
            </div>
          ) : (
            <p>No data to display</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;

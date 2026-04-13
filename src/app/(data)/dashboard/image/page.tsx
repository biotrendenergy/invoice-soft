"use client";

import { getAllCompany } from "@/action/company";
import {
  addMedia,
  addOCRData,
  extractData,
  extractData_AllWight,
  extractEWayBill_withIn,
  getFilePart,
} from "@/action/ocr";
import { getAllVendor } from "@/action/vendores";
import { companyDetail, ocr, vendorDetail } from "@/generated/prisma";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import EditButton from "../_components/editButton";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import {
  formSchema,
  formType,
  parseFlexibleDate,
} from "@/lib/validation/imageForm";

const page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    setError,
    clearErrors,
    getValues,
    resetField,
    reset,
    watch,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const normalizeVehicle = (v: string | null | undefined) =>
    (v ?? "").toUpperCase().replace(/[\s\-_]/g, "");

  const normalizeExtractedData = (raw: any) => ({
    weight: typeof raw?.weight === "number" ? raw.weight : 0,
    vehicle_number: raw?.vehicle_number ?? "",
    address: raw?.address ?? "",
    map_url: raw?.map_url ?? "",
    latitude: typeof raw?.latitude === "number" ? raw.latitude : 0,
    longitude: typeof raw?.longitude === "number" ? raw.longitude : 0,
    date: raw?.date ? new Date(raw.date) : new Date(),
  });

  const clearWeightErrors = () => {
    clearErrors("tar_file");
    clearErrors("tar_data");
    clearErrors("net_file");
    clearErrors("net_data");
    clearErrors("gross_file");
    clearErrors("gross_data");
  };
  const [companies, setCompanies] = useState<companyDetail[] | null>(null);
  const [vendors, setVendors] = useState<vendorDetail[] | null>(null);
  const [vehicle_number, setVehicle] = useState<string | null>(null);
  const [data, setData] = useState<ocr | null>(null); // Store extracted data
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      setVendors(await getAllVendor());
      setCompanies(await getAllCompany());
    })();
  }, []);
  useEffect(() => {
    console.log(errors, isValid);
  }, [errors, isValid]);
  const onSubmit = async (data: formType) => {
    console.log(data);
    setLoading(true);

    if (!data.net_file) {
      setError("net_file", { message: "Net image not uploaded" });
    }
    if (!data.gross_file) {
      setError("gross_file", { message: "Gross image not uploaded" });
    }
    if (!data.tar_file) {
      setError("tar_file", { message: "Tar image not uploaded" });
    }

    // Show a toast if *any* file is missing (only for multi-upload mode)
    if (!data.multi_file && (!data.net_file || !data.gross_file || !data.tar_file)) {
      toast.error("Please upload all required weight images.");
      setLoading(false);
      return;
    }
    try {
      const tare = data.tar_data.weight;
      const a_weight = Math.abs(data.net_data.weight - data.tar_data.weight);
      const b_weight = Math.abs(data.net_data.weight - data.gross_data.weight);
      const gross = data.gross_data.weight;
      const net_weight = a_weight + b_weight;

      // Prepare all required fields for ocr type
      const selectCompany = companies?.filter(
        (v) => v.id == Number(data.companyId)
      )[0];
      console.log(selectCompany, data.companyId);

      const challanNumber = data.challanNo;
      const ocrPayload = {
        A_weight: b_weight == tare ? 0 : a_weight,
        B_weight: b_weight == tare ? 0 : b_weight,
        e_way_bill_gst: data.e_way_bill_gst,
        gross_weight: gross,
        tare_weight: tare,
        net_weight: net_weight,
        challan: `${challanNumber}`, // Prefix with 000
        address: data.gross_data.address,
        map_url: data.gross_data.map_url,
        latitude: data.gross_data.latitude,
        longitude: data.gross_data.longitude,
        delivery_date: new Date(),
        delivery_status: "pending",
        vehicle_number: data.gross_data.vehicle_number,
        created_at: new Date(),
        date: new Date(),
        e_way_bill: data.e_wayBill_data?.toString() ?? "",
        companyDetailId: data.companyId ?? undefined,
        vendorDetailId: data.vendorId ?? undefined,
        e_way_bill_date: data.e_wayBill_date,
        e_way_bill_ship_to: data.e_way_bill_ship_to,
      };

      const result = await addOCRData(ocrPayload as any);
      if (result instanceof Error || !result) {
        console.log(result);

        toast.error("Failed to save data!" + (result instanceof Error ? ": " + result.message : ""));
      } else {
        await addMedia(
          "E-Way bill - " + data.challanNo,
          data.e_wayBill,
          result.id
        );
        if (data.net_file && data.tar_file && data.gross_file) {
          await addMedia(
            "tar wight - " + data.challanNo,
            data.tar_file,
            result.id
          );
          await addMedia(
            "Net wight  - " + data.challanNo,
            data.net_file,
            result.id
          );
          await addMedia(
            "gross wight - " + data.challanNo,
            data.gross_file,
            result.id
          );
        } else if (data.multi_file) {
          console.log(data.multi_file[0]);
          console.log(getValues("multi_file"));

          await addMedia(
            `all wight file - ${data.challanNo}`,
            data.multi_file,
            result.id
          );
        }
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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const name = e.target.name as keyof formType;
    if (!e.target.files) {
      setError(name, { message: `${name} file not received` });
      setLoading(false);
      return;
    }

    setValue(name, e.target.files[0]);
    let dataPart = await getFilePart(e.target.files[0]);

    switch (name) {
      case "e_wayBill":
        clearErrors("e_wayBill");
        setValue("e_wayBill", e.target.files[0]);
        const e_way_bill_data = await extractEWayBill_withIn(dataPart);
        setValue("e_wayBill_data", Number(e_way_bill_data.EWayBillNumber));
        setValue("e_way_bill_gst", e_way_bill_data.gst_no);
        setValue(
          "e_wayBill_date",
          parseFlexibleDate(e_way_bill_data.generated_date) ?? new Date()
        );
        setValue("e_way_bill_ship_to", e_way_bill_data.shipping_address);
        setValue("challanNo", e_way_bill_data.ChallanOrInvoiceNumber);
        setVehicle(e_way_bill_data.vehicle_number);
        setLoading(false);
        return;

      case "tar_file":
        clearWeightErrors();
        const tar_data = await extractData(dataPart);

        if (!tar_data) {
          setError("tar_file", { message: "File not found or invalid format" });
          setLoading(false);
          return;
        }
        if (!vehicle_number) {
          setError("e_wayBill", { message: "Please upload the e-way bill first." });
          setLoading(false);
          return;
        }
        if (normalizeVehicle(tar_data.vehicle_number) !== normalizeVehicle(vehicle_number)) {
          setError("tar_file", {
            message: `Vehicle number mismatch: image has "${tar_data.vehicle_number}", e-way bill has "${vehicle_number}"`,
          });
          setLoading(false);
          return;
        }
        clearWeightErrors();
        setValue("tar_data", normalizeExtractedData(tar_data));
        setLoading(false);
        return;

      case "net_file":
        clearWeightErrors();
        const net_data = await extractData(dataPart);

        if (!net_data) {
          setError("net_data", { message: "File not found or invalid format" });
          setLoading(false);
          return;
        }
        if (!vehicle_number) {
          setError("e_wayBill", { message: "Please upload the e-way bill first." });
          setLoading(false);
          return;
        }
        if (normalizeVehicle(net_data.vehicle_number) !== normalizeVehicle(vehicle_number)) {
          setError("net_data", {
            message: `Vehicle number mismatch: image has "${net_data.vehicle_number}", e-way bill has "${vehicle_number}"`,
          });
          setLoading(false);
          return;
        }
        if (!getValues("tar_data")) {
          setError("tar_file", { message: "Please upload tare weight first." });
          setLoading(false);
          return;
        }
        if (getValues("tar_data.weight") > net_data.weight) {
          setError("net_data", {
            message: "Net weight (A) must be greater than tare weight. Please check and try again.",
          });
          setLoading(false);
          return;
        }
        clearWeightErrors();
        setValue("net_data", normalizeExtractedData(net_data));
        setLoading(false);
        return;

      case "gross_file":
        clearWeightErrors();
        const gross_data = await extractData(dataPart);

        if (!gross_data) {
          setError("gross_data", { message: "File not found or invalid format" });
          setLoading(false);
          return;
        }
        if (!vehicle_number) {
          setError("e_wayBill", { message: "Please upload the e-way bill first." });
          setLoading(false);
          return;
        }
        if (normalizeVehicle(gross_data.vehicle_number) !== normalizeVehicle(vehicle_number)) {
          setError("gross_data", {
            message: `Vehicle number mismatch: image has "${gross_data.vehicle_number}", e-way bill has "${vehicle_number}"`,
          });
          setLoading(false);
          return;
        }
        if (!getValues("net_data")) {
          setError("net_file", { message: "Please upload Net weight (A) first." });
          setLoading(false);
          return;
        }
        if (getValues("net_data").weight > gross_data.weight) {
          setError("net_data", {
            message: "Net weight (A) cannot be greater than gross weight (B). Please check and try again.",
          });
          setLoading(false);
          return;
        }
        clearWeightErrors();
        setValue("gross_data", normalizeExtractedData(gross_data));
        setLoading(false);
        return;

      default:
        setLoading(false);
        return;
    }
  };
  const handlePrintData = () => {
    if (data) {
      window.open(`/data/${data.id}`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  const handlePrintMarges = () => {
    if (data) {
      window.open(`/marge/${data.id}`, "popupWindow");
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

  const handlePrintDataSign = () => {
    if (data) {
      window.open(`/data/${data.id}/sign`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  const handlePrintMargesSign = () => {
    if (data) {
      window.open(`/marge/${data.id}/sign`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  const handlePrintChallanSign = () => {
    if (data) {
      window.open(`/challan/${data.id}/sign`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };

  const handlePrintData2 = () => {
    if (data) {
      window.open(`/data/${data.id}/khar`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  const handlePrintMarges2 = () => {
    if (data) {
      window.open(`/marge/${data.id}/khar`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  const handlePrintChallan2 = () => {
    if (data) {
      window.open(`/challan/${data.id}/khar`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };

  const handlePrintData2sign = () => {
    if (data) {
      window.open(`/data/${data.id}/khar/sign`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  const handlePrintMarges2sign = () => {
    if (data) {
      window.open(`/marge/${data.id}/khar/sign`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  const handlePrintChallan2sign = () => {
    if (data) {
      window.open(`/challan/${data.id}/khar/sign`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-green-900 tracking-tight">Upload Images</h1>
          <p className="text-xs text-green-600 mt-0.5">Extract challan data from weight images · BioTrend Energy</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Left Column - Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* Vendor & Company */}
          <div className="rounded-xl p-5 flex flex-col gap-4 border border-white/60 shadow-md" style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}>
            <h2 className="text-xs font-semibold text-green-600 uppercase tracking-widest">Details</h2>

            <fieldset className="fieldset flex flex-col gap-1 p-0 border-none">
              <label className="text-sm font-medium text-gray-700">Vendor Name</label>
              <select
                className="select select-bordered w-full"
                defaultValue=""
                disabled={loading}
                onChange={(v) => setValue("vendorId", Number(v.target.value))}
              >
                <option value="" disabled>Select vendor</option>
                {vendors?.map((ocr) => (
                  <option key={ocr.id} value={ocr.id}>{ocr.name || `OCR #${ocr.id}`}</option>
                ))}
              </select>
              {errors.vendorId && <p className="text-error text-xs">{errors.vendorId?.message}</p>}
            </fieldset>

            <fieldset className="fieldset flex flex-col gap-1 p-0 border-none">
              <label className="text-sm font-medium text-gray-700">Short Name</label>
              <select
                disabled={loading}
                className="select select-bordered w-full"
                defaultValue=""
                onChange={(e) => setValue("companyId", Number(e.target.value))}
              >
                <option value="" disabled>Select short name</option>
                {companies?.map((v, i) => (
                  <option key={i} value={v.id}>{v.shotName}</option>
                ))}
              </select>
              {errors.companyId && <p className="text-error text-xs">{errors.companyId?.message}</p>}
            </fieldset>
          </div>

          {/* E-Way Bill */}
          <div className="rounded-xl p-5 flex flex-col gap-3 border border-white/60 shadow-md" style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}>
            <h2 className="text-xs font-semibold text-green-600 uppercase tracking-widest">E-Way Bill</h2>
            <fieldset className="fieldset flex flex-col gap-1 p-0 border-none">
              <label className="text-sm font-medium text-gray-700">Upload PDF</label>
              <input
                disabled={loading}
                type="file"
                className="file-input w-full"
                accept=".pdf"
                name={"e_wayBill" as keyof formType}
                onChange={handleFileChange}
                onFocus={() => setError("e_wayBill", { message: "" })}
              />
              {errors.e_wayBill && <p className="text-error text-xs">{errors.e_wayBill.message}</p>}
            </fieldset>
            <fieldset className="fieldset flex flex-col gap-1 p-0 border-none">
              <label className="text-sm font-medium text-gray-700">
                Challan / Invoice No <span className="text-gray-400 font-normal">(Auto-filled, edit if needed)</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                disabled={loading}
                {...register("challanNo")}
                placeholder="e.g. INV/23-24/0198"
              />
              {errors.challanNo && <p className="text-error text-xs">{errors.challanNo.message}</p>}
            </fieldset>
          </div>

          {/* Weight Images */}
          <div className="rounded-xl p-5 flex flex-col gap-4 border border-white/60 shadow-md" style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}>
            <h2 className="text-xs font-semibold text-green-600 uppercase tracking-widest">Weight Images</h2>

            <div className="tabs tabs-lifted">
              <input
                disabled={loading}
                type="radio"
                name="upload_mode"
                role="tab"
                className="tab"
                aria-label="Multi Upload"
                defaultChecked
              />
              <div role="tabpanel" className="tab-content bg-base-100 border-base-300 p-5 flex flex-col gap-4">
                <fieldset className="fieldset flex flex-col gap-1 p-0 border-none">
                  <label className="text-sm font-medium text-gray-700">Tare Image</label>
                  <input
                    disabled={loading || getValues("e_wayBill") == undefined || getValues("e_wayBill_data") == undefined}
                    type="file"
                    className="file-input w-full"
                    accept="image/*"
                    name={"tar_file" as keyof formType}
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-gray-400">{watch("tar_data.vehicle_number")}</p>
                  {errors.tar_file && (
                    <p className="text-error text-xs">{errors.tar_file.message}</p>
                  )}
                  {errors.tar_data && !errors.tar_file && (
                    <p className="text-error text-xs">
                      {(errors.tar_data as any).message ||
                        (errors.tar_data as any).vehicle_number?.message ||
                        (errors.tar_data as any).weight?.message ||
                        "Tare image data is invalid — re-upload the image"}
                    </p>
                  )}
                </fieldset>

                <div className="grid grid-cols-2 gap-4">
                  <fieldset className="fieldset flex flex-col gap-1 p-0 border-none">
                    <label className="text-sm font-medium text-gray-700">Net Weight (A)</label>
                    <input
                      type="file"
                      disabled={loading || getValues("multi_file") !== undefined || getValues("e_wayBill") == undefined || getValues("tar_file") == undefined}
                      className="file-input w-full"
                      onChange={handleFileChange}
                      accept="image/*"
                      name={"net_file" as keyof formType}
                    />
                    <p className="text-xs text-gray-400">{watch("net_data.vehicle_number")}</p>
                    {errors.net_file && (
                      <p className="text-error text-xs">{errors.net_file.message}</p>
                    )}
                    {errors.net_data && !errors.net_file && (
                      <p className="text-error text-xs">
                        {(errors.net_data as any).message ||
                          (errors.net_data as any).vehicle_number?.message ||
                          (errors.net_data as any).weight?.message ||
                          "Net weight (A) image data is invalid — re-upload the image"}
                      </p>
                    )}
                  </fieldset>

                  <fieldset className="fieldset flex flex-col gap-1 p-0 border-none">
                    <label className="text-sm font-medium text-gray-700">Net Weight (B)</label>
                    <input
                      type="file"
                      className="file-input w-full"
                      onChange={handleFileChange}
                      accept="image/*"
                      disabled={loading || getValues("multi_file") !== undefined || getValues("e_wayBill") == undefined || getValues("tar_file") == undefined || getValues("net_file") == undefined}
                      name={"gross_file" as keyof formType}
                    />
                    <p className="text-xs text-gray-400">{watch("gross_data.vehicle_number")}</p>
                    {errors.gross_file && (
                      <p className="text-error text-xs">{errors.gross_file.message}</p>
                    )}
                    {errors.gross_data && !errors.gross_file && (
                      <p className="text-error text-xs">
                        {(errors.gross_data as any).message ||
                          (errors.gross_data as any).vehicle_number?.message ||
                          (errors.gross_data as any).weight?.message ||
                          "Net weight (B) image data is invalid — re-upload the image"}
                      </p>
                    )}
                  </fieldset>
                </div>
              </div>

              <input
                type="radio"
                name="upload_mode"
                role="tab"
                className="tab"
                disabled={loading}
                aria-label="Single Upload"
              />
              <div role="tabpanel" className="tab-content bg-base-100 border-base-300 p-5">
                <fieldset className="fieldset flex flex-col gap-1 p-0 border-none">
                  <label className="text-sm font-medium text-gray-700">All Weights in One Image</label>
                  <input
                    type="file"
                    className="file-input w-full"
                    disabled={loading || getValues("gross_file") !== undefined || getValues("net_file") !== undefined || getValues("tar_file") !== undefined}
                    accept="image/*"
                    name={"multi_file" as keyof formType}
                    onChange={async (e) => {
                      setLoading(true);
                      if (!e.target.files) {
                        setError("multi_file", { message: `File that file not get` });
                        resetField("multi_file");
                        return;
                      }
                      const part = await getFilePart(e.target.files[0]);
                      console.log(part);
                      setValue("multi_file", e.target.files[0]);
                      const result = await extractData_AllWight(part);
                      if (!vehicle_number) {
                        setError("e_wayBill", { message: "Fist upload E way bill" });
                        setLoading(false);
                        resetField("multi_file");
                        return;
                      }
                      if (normalizeVehicle(result.vehicle_number ?? "") !== normalizeVehicle(vehicle_number ?? "")) {
                        setError("multi_file", {
                          message: `Vehicle number mismatch: image has "${result.vehicle_number}", e-way bill has "${vehicle_number}"`,
                        });
                        setLoading(false);
                        return;
                      }
                      if ((result.tare_weight ?? 0) > (result.net_weight ?? 0)) {
                        setError("multi_file", { message: "A wight is not less than tar wight place check it and try again" });
                        setLoading(false);
                        return;
                      }
                      if ((result.net_weight ?? 0) > (result.gross_weight ?? 0)) {
                        setError("multi_file", { message: "A wight is not less than tar wight place check it and try again" });
                        setLoading(false);
                        return;
                      }
                      setValue("gross_data", { ...result, weight: result.gross_weight ?? 0, vehicle_number: result.vehicle_number ?? "", address: result.address ?? "", map_url: result.map_url ?? "", date: new Date(), latitude: result.latitude ?? 0, longitude: result.longitude ?? 0 });
                      setValue("gross_data.weight", result.gross_weight ?? 0);
                      setValue("net_data", { ...result, weight: result.net_weight ?? 0, vehicle_number: result.vehicle_number ?? "", address: result.address ?? "", map_url: result.map_url ?? "", date: new Date(), latitude: result.latitude ?? 0, longitude: result.longitude ?? 0 });
                      setValue("tar_data", { ...result, weight: result.tare_weight ?? 0, vehicle_number: result.vehicle_number ?? "", address: result.address ?? "", map_url: result.map_url ?? "", date: new Date(), latitude: result.latitude ?? 0, longitude: result.longitude ?? 0 });
                      setLoading(false);
                    }}
                  />
                  {errors.multi_file && (
                    <p className="text-error text-xs">
                      {typeof errors.multi_file?.message === "string" ? errors.multi_file.message : null}
                    </p>
                  )}
                </fieldset>
              </div>
            </div>
          </div>

          {/* Gross Weight + Actions */}
          <div className="rounded-xl p-5 flex flex-col gap-4 border border-white/60 shadow-md" style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}>
            <fieldset className="fieldset flex flex-col gap-1 p-0 border-none">
              <label className="text-sm font-medium text-gray-700">Gross Weight <span className="text-gray-400 font-normal">(Auto-filled)</span></label>
              <input
                type="text"
                disabled
                className="input input-bordered w-full"
                {...register("gross_data.weight")}
              />
            </fieldset>

            <div className="flex gap-3 pt-1">
              <button className="btn btn-green flex-1" type="submit" disabled={loading}>
                {loading ? "Processing..." : "Extract Data"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => reset()}>
                Reset
              </button>
            </div>
            {data && <EditButton {...data} />}
          </div>
        </form>

        {/* Right Column - Extracted Data */}
        <div className="rounded-xl p-5 flex flex-col gap-4 border border-white/60 shadow-md" style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}>
          <div>
            <h2 className="text-2xl font-semibold text-green-900 tracking-tight">Extracted Data</h2>
            <p className="text-xs text-gray-400 mt-0.5">Results from the uploaded weight images</p>
          </div>

          {data ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Date", value: new Date(data.date).toLocaleString() },
                  { label: "Vehicle Number", value: data.vehicle_number },
                  { label: "Gross Weight", value: data.gross_weight },
                  { label: "Tare Weight", value: data.tare_weight },
                  { label: "Net Weight", value: data.net_weight },
                  { label: "A Weight", value: data.A_weight },
                  { label: "B Weight", value: data.B_weight },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-green-50/80 rounded-lg px-4 py-3 ring-1 ring-green-100">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-900">{String(value)}</p>
                  </div>
                ))}
              </div>

              {companies?.find((v) => v.id == getValues("companyId"))?.shotName.toLowerCase() !== "dadri" && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={handlePrintData} className="btn btn-green btn-sm">Print Annexure</button>
                  <button onClick={handlePrintChallan} className="btn btn-green btn-sm">Print Challan</button>
                  <button onClick={handlePrintMarges} className="btn btn-green btn-sm">Merge PDF</button>
                  <button onClick={handlePrintMargesSign} className="btn btn-green btn-sm">Merge PDF (Signed)</button>
                </div>
              )}

              {companies?.find((v) => v.id == getValues("companyId"))?.shotName.toLowerCase() === "dadri" && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={handlePrintData2} className="btn btn-green btn-sm">Print Annexure 2</button>
                  <button onClick={handlePrintChallan2} className="btn btn-green btn-sm">Print Challan 2</button>
                  <button onClick={handlePrintMarges2} className="btn btn-green btn-sm">Merge PDF 2</button>
                  <button onClick={handlePrintMarges2sign} className="btn btn-green btn-sm">Merge PDF (Signed) 2</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-gray-400 text-sm font-medium">No data to display</p>
              <p className="text-gray-400 text-xs">Upload images and extract data to see results here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;

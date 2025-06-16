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
import { isValid, parse } from "date-fns";
import { toast } from "sonner";

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
const extractDataSchema = z.object({
  weight: z.number(),
  vehicle_number: z.string(),
  address: z.string(),
  map_url: z.string().url(),
  latitude: z.number(),
  longitude: z.number(),
  date: z.coerce.date(), // Handles string-to-Date conversion
});
const formSchema = z.object({
  vendorId: z
    .number({ required_error: "Vendor is required" })
    .min(1, "Select a valid vendor"),
  companyId: z
    .number({ required_error: "Company is required" })
    .min(1, "Select a valid company"),
  e_wayBill: z.instanceof(File, { message: "E-way Bill file is required" }),
  e_wayBill_data: z
    .number({ required_error: "E-way Bill value is required" })
    .min(1, "E-way Bill value must be greater than 0"),
  e_wayBill_date: z.coerce.date({
    required_error: "E-way Bill date is required",
  }),
  tar_file: z
    .instanceof(File, { message: "Tar file must be a file" })
    .optional(),
  gross_file: z
    .instanceof(File, { message: "Gross file must be a file" })
    .optional(),
  net_file: z
    .instanceof(File, { message: "Net file must be a file" })
    .optional(),
  challanNo: z
    .string({ required_error: "Challan number is required" })
    .min(1, "Challan number cannot be empty"),
  tar_data: extractDataSchema,
  gross_data: extractDataSchema,
  net_data: extractDataSchema,
  multi_file: z
    .instanceof(File, { message: "Multi-file must be a valid file" })
    .optional(),
});
type formType = z.infer<typeof formSchema>;
const page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    getValues,
    resetField,
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
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
  useEffect(() => {}, []);
  const onSubmit = async (data: formType) => {
    if (!data.net_file) {
      setError("net_file", { message: "Net image not uploaded" });
    }
    if (!data.gross_file) {
      setError("gross_file", { message: "Gross image not uploaded" });
    }
    if (!data.tar_file) {
      setError("tar_file", { message: "Tar image not uploaded" });
    }

    // Show a toast if *any* file is missing
    if (!data.net_file || !data.gross_file || !data.tar_file) {
      toast.error("Please upload all required files.");
    }
    try {
      /**
       *
       * tare weight is empty track
       * a weight = net_weight - tare weight
       * b weight =
       */
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

      // const ocrCountValue = (await ocrCount(company?.valueOf() ?? 0)) + 1;
      // const getPre = incrementString(
      //   selectCompany?.stringNumber!,
      //   ocrCountValue
      // );
      // console.log(getPre);

      const challanNumber = data.challanNo;
      const ocrPayload = {
        A_weight: b_weight == tare ? 0 : a_weight,
        B_weight: b_weight == tare ? 0 : b_weight,
        gross_weight: gross,
        tare_weight: tare,
        net_weight: net_weight,
        challan: `${challanNumber}`, // Prefix with 000
        address: data.gross_data.address,
        map_url: data.gross_data.map_url,
        latitude: data.gross_data.latitude,
        longitude: data.gross_data.longitude,
        delivery_date: new Date(),
        delivery_status: "",
        vehicle_number: data.gross_data.vehicle_number,
        created_at: new Date(),
        date: new Date(),
        e_way_bill: data.e_wayBill?.toString() ?? "",
        companyDetailId: data.companyId ?? undefined,
        vendorDetailId: data.vendorId ?? undefined,
        e_way_bill_date: data.e_wayBill_date,
      };

      const result = await addOCRData(ocrPayload as any);
      if (result instanceof Error || !result) {
        console.log(result);

        toast.error("Failed to save data!");
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
      setError(name, {
        message: `${name} that file not get`,
      });
      return;
    }
    let dataPart = await getFilePart(e.target.files[0]);
    switch (name) {
      case "e_wayBill":
        const e_way_bill_data = await extractEWayBill_withIn(dataPart);
        setValue("e_wayBill_data", Number(e_way_bill_data.EWayBillNumber));
        setValue(
          "e_wayBill_date",
          parseFlexibleDate(e_way_bill_data.generated_date) ?? new Date()
        );
        setValue("challanNo", e_way_bill_data.ChallanOrInvoiceNumber);
        setVehicle(e_way_bill_data.vehicle_number);
        setLoading(false);
        return;
      case "tar_file":
        const tar_data = await extractData(dataPart);
        if (!vehicle_number) {
          setError("e_wayBill", {
            message: "Fist upload E way bill",
          });
          setLoading(false);
          return;
        }
        if (tar_data.vehicle_number != vehicle_number) {
          setError("tar_file", {
            message: "vehicle number not mach to e way bill",
          });
          setLoading(false);

          return;
        }
        setValue("tar_data", tar_data);

        setLoading(false);
        return;
      case "net_file":
        const net_data = await extractData(dataPart);
        if (!vehicle_number) {
          setError("e_wayBill", {
            message: "Fist upload E way bill",
          });
          setLoading(false);
          return;
        }
        if (net_data.vehicle_number != vehicle_number) {
          setError("net_data", {
            message: "vehicle number not mach to e way bill",
          });
          setLoading(false);

          return;
        }
        console.log(getValues("tar_data"));

        if (!getValues("tar_data")) {
          setError("tar_file", {
            message: "Fist upload tar wight",
          });
          setLoading(false);
          return;
        }

        if (getValues("tar_data.weight") < net_data.weight) {
          setError("net_data", {
            message:
              "A wight is not less than tar wight place check it and try again",
          });
          setLoading(false);
          return;
        }
        setValue("net_data", net_data);
        return;
      case "gross_file":
        const gross_data = await extractData(dataPart);
        if (!vehicle_number) {
          setError("e_wayBill", {
            message: "Fist upload E way bill",
          });
          setLoading(false);
          return;
        }
        if (gross_data.vehicle_number != vehicle_number) {
          setError("gross_data", {
            message: "vehicle number not mach to e way bill",
          });
          setLoading(false);

          return;
        }
        console.log(getValues("net_data"));

        if (!getValues("net_data")) {
          setError("net_file", {
            message: "Fist upload tar wight",
          });
          setLoading(false);
          return;
        }

        if (getValues("net_data").weight < gross_data.weight) {
          setError("net_data", {
            message:
              "A wight is not less than tar wight place check it and try again",
          });
          setLoading(false);
          return;
        }
        setValue("gross_data", gross_data);
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
  const handlePrintChallan = () => {
    if (data) {
      window.open(`/challan/${data.id}`, "popupWindow");
    } else {
      toast.error("No data to print!");
    }
  };
  return (
    <div className="flex">
      {/* Left Column - File Upload */}
      <div className="flex p-6">
        <form className="flex-1 mr-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-between">
            <h2 className="text-2xl mb-4">Upload Images</h2>
            <div className="flex gap-2.5 ">
              <button type="button" className="btn  btn-active text-white">
                Save
              </button>
              <button
                type="button"
                className="btn btn-error text-white"
                onClick={() => reset()}
              >
                Reset
              </button>
            </div>
          </div>
          <fieldset className="flex flex-col">
            <label>Vendor Name</label>
            <select
              className="select select-bordered"
              defaultValue=""
              disabled={loading}
              // {...register("vendorId")}
              onChange={(v) => {
                setValue("vendorId", Number(v.target.value));
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
            {errors.vendorId && (
              <p className="text-error">{errors.vendorId?.message}</p>
            )}
          </fieldset>
          <fieldset className="fieldset mb-4">
            <legend className="fieldset-legend">Short name</legend>
            <select
              disabled={loading}
              className="select select-bordered"
              defaultValue=""
              onChange={(e) => {
                setValue("companyId", Number(e.target.value));
              }}
            >
              <option value="" disabled>
                Select short name
              </option>
              {companies?.map((v, i) => (
                <option key={i} value={v.id}>
                  {v.shotName}
                </option>
              ))}
            </select>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Eway Bill (PDF)</legend>
            <input
              disabled={loading}
              type="file"
              className="file-input"
              accept=".pdf"
              name={"e_wayBill" as keyof formType}
              onChange={handleFileChange}
              // {...register("e_wayBill")}
            />
            {errors.e_wayBill && (
              <p className="text-error">{errors.e_wayBill.message}</p>
            )}
          </fieldset>
          <div className="tabs tabs-lifted md-6 my-4">
            <input
              disabled={loading}
              type="radio"
              name="upload_mode"
              role="tab"
              className="tab"
              aria-label="Multi Upload"
              defaultChecked
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 p-6 "
            >
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Tare Image</legend>
                <input
                  disabled={loading}
                  type="file"
                  className="file-input"
                  accept=".pdf"
                  name={"tar_file" as keyof formType}
                  onChange={handleFileChange}
                  // {...register("e_wayBill")}
                />
                {(errors.tar_data || errors.tar_file) && (
                  <p className="text-error">
                    {(errors.tar_data ?? errors.tar_file)?.message}
                  </p>
                )}
              </fieldset>
              <div className="flex w-full gap-4">
                <fieldset className="flex-1 mb-4">
                  <legend className="fieldset-legend">Net Weight (A)</legend>
                  <input
                    type="file"
                    disabled={loading}
                    className="file-input"
                    onChange={handleFileChange}
                    accept="image/*"
                    name={"net_file" as keyof formType}
                  />
                  {(errors.net_data || errors.net_file) && (
                    <p className="text-error">
                      {(errors.net_data ?? errors.net_file)?.message}
                    </p>
                  )}
                  {/* {errors.net_data && (
                    <p className="text-error">{errors.net_data.message}</p>
                  )} */}
                </fieldset>
                <fieldset className="flex-1 mb-4">
                  <legend className="fieldset-legend">Net Weight (B)</legend>
                  <input
                    type="file"
                    className="file-input"
                    onChange={handleFileChange}
                    accept="image/*"
                    disabled={loading}
                    name={"gross_file" as keyof formType}
                  />
                  {(errors.gross_data || errors.gross_file) && (
                    <p className="text-error">
                      {(errors.gross_data ?? errors.gross_file)?.message}
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
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 p-6"
            >
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  All Weights in One Image
                </legend>
                <input
                  type="file"
                  className="file-input"
                  disabled={loading}
                  accept="image/*"
                  {...register("multi_file")}
                  onChange={async (e) => {
                    setLoading(true);
                    if (!e.target.files) {
                      setError("multi_file", {
                        message: `File that file not get`,
                      });
                      resetField("multi_file");
                      return;
                    }
                    // if (!e.target.files || !e.target.files[0]) {
                    //   toast("file not found!");
                    //   return;
                    // }
                    const part = await getFilePart(e.target.files[0]);
                    const result = await extractData_AllWight(part);
                    if (!vehicle_number) {
                      setError("e_wayBill", {
                        message: "Fist upload E way bill",
                      });
                      setLoading(false);
                      resetField("multi_file");

                      return;
                    }
                    if (result.vehicle_number != vehicle_number) {
                      setError("multi_file", {
                        message: "vehicle number not mach to e way bill",
                      });
                      setLoading(false);

                      return;
                    }
                    if (result.tare_weight! < result.net_weight!) {
                      setError("multi_file", {
                        message:
                          "A wight is not less than tar wight place check it and try again",
                      });
                      setLoading(false);
                      return;
                    }
                    if (result.net_weight! < result.gross_weight!) {
                      setError("multi_file", {
                        message:
                          "A wight is not less than tar wight place check it and try again",
                      });
                      setLoading(false);
                      return;
                    }
                    setValue("gross_data", {
                      ...result,
                      weight: result.gross_weight ?? 0,
                      vehicle_number: result.vehicle_number ?? "",
                      address: result.address ?? "",
                      map_url: result.map_url ?? "",
                      date: new Date(),
                      latitude: result.latitude ?? 0,
                      longitude: result.longitude ?? 0,
                    });
                    setValue("net_data", {
                      ...result,
                      weight: result.net_weight ?? 0,
                      vehicle_number: result.vehicle_number ?? "",
                      address: result.address ?? "",
                      map_url: result.map_url ?? "",
                      date: new Date(),
                      latitude: result.latitude ?? 0,
                      longitude: result.longitude ?? 0,
                    });
                    setValue("tar_data", {
                      ...result,
                      weight: result.tare_weight ?? 0,
                      vehicle_number: result.vehicle_number ?? "",
                      address: result.address ?? "",
                      map_url: result.map_url ?? "",
                      date: new Date(),
                      latitude: result.latitude ?? 0,
                      longitude: result.longitude ?? 0,
                    });
                    setLoading(false);
                  }}
                />
                {(errors.gross_data || errors.multi_file) && (
                  <p className="text-error">
                    {(errors.gross_data ?? errors.gross_file)?.message}
                  </p>
                )}
              </fieldset>
            </div>
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">
              Gross weight (Auto-filled)
            </legend>
            <input
              type="text"
              disabled
              className="input input-bordered w-full"
            />
          </fieldset>
          <br />

          <div className="flex flex-col gap-4">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Processing..." : "Extract Data"}
            </button>
            {data && <EditButton {...data} />}
          </div>
        </form>
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

export default page;

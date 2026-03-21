"use client";
import { useForm, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorChallanSchema } from "../_utils/schema";
import type { z } from "zod";
import { Field } from "./Field";
import { useEffect, useState } from "react";
import { companyDetail, ocr, Prisma } from "@/generated/prisma";
import { vendorDetail } from "@/generated/prisma";
import {
  extractData_msi,
  extractEWayBill_withIn,
  getAllOcr,
  getFilePart,
} from "@/action/ocr";
import { toast } from "sonner";
import { getAllVendor } from "@/action/vendores";
import { format } from "date-fns";
const convertToHtmlDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split("/");
  console.log(day);

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

interface Ocr extends ocr {
  company: companyDetail;
}

const FileUploadModal = ({
  open,
  onClose,
  ocrData,
  selectOcrData,
  setValue,
  getValue,
}: {
  open: boolean;
  onClose: () => void;
  ocrData: Awaited<ReturnType<typeof getAllOcr>> | undefined;
  selectOcrData: React.Dispatch<React.SetStateAction<Ocr | undefined>>;
  setValue: UseFormSetValue<z.infer<typeof vendorChallanSchema>>;
  getValue: UseFormGetValues<z.infer<typeof vendorChallanSchema>>;
}) => {
  if (!open) return null;
  if (!ocrData) return null;
  const [ewayBill, setEwayBill] = useState<null | File>(null);
  const [challan, setChallan] = useState<null | File>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const onsubmit = async () => {
    setLoading(true);
    if (!ewayBill) {
      setLoading(false);
      toast.error("Eway bill not get");
      return;
    }
    try {
      const ewayBillFile = await getFilePart(ewayBill);
      const challanFile = challan ? await getFilePart(challan) : null;
      let dat = await extractEWayBill_withIn(ewayBillFile);
      let dat1 = challan ? await extractEWayBill_withIn(challanFile) : null;
      console.log(dat, dat1);

      // let data = await extractData_msi([ewayBillFile, challanFile]);
      if (!dat) {
        throw new Error("Data not found!!");
      }
      if (
        isNaN(Number(getValue("netWeightVendor"))) ||
        Number(getValue("netWeightVendor")) == 0
      ) {
        setValue("netWeightVendor", dat.quantity.toString());
      }
      if (challan && dat1) {
        setValue("vendorChallanDate", convertToHtmlDate(dat1.generated_date));
        setValue("vendorChallanNo", dat1.ChallanOrInvoiceNumber);
      } else {
        setValue("vendorChallanDate", convertToHtmlDate(dat.generated_date));
        setValue("vendorChallanNo", dat.ChallanOrInvoiceNumber);
      }
      // setValue("vendorEwayBill", data.eway_bill_number);
      // setValue("vendorEwayBillDate", convertToHtmlDate(data.eway_bill_date));
    } catch (e: any) {
      console.log(e);

      toast.error(e.message);
    } finally {
      setLoading(false);

      onClose();
    }
  };
  return (
    open && (
      <dialog open className="modal">
        <div className="modal-box bg-base-200 border border-base-300 flex flex-col gap-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Upload Files</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select a challan and upload the relevant documents</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-300">Challan</label>
              <select
                className="select select-bordered w-full"
                defaultValue=""
                onChange={(v) => {
                  const selected = ocrData.find(
                    (xx) => xx.id === Number(v.target.value) && xx.company !== null
                  );
                  if (selected && selected.company) {
                    selectOcrData(selected as Ocr);
                  } else {
                    selectOcrData(undefined);
                  }
                }}
              >
                <option value="" disabled>Select challan</option>
                {ocrData?.map((ocr) => (
                  <option key={ocr.id} value={ocr.id}>
                    {ocr.challan || `OCR #${ocr.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-300">Vendor Challan (PDF)</label>
              <input
                onChange={(e) => { if (!e.target.files) return; setChallan(e.target.files[0]); }}
                type="file"
                className="file-input file-input-bordered w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-300">Vendor E-Way Bill (PDF)</label>
              <input
                onChange={(e) => { if (!e.target.files) return; setEwayBill(e.target.files[0]); }}
                type="file"
                className="file-input file-input-bordered w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button className="btn btn-ghost" disabled={loading} onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!ewayBill || loading} onClick={onsubmit}>
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={onClose}>close</button>
        </form>
      </dialog>
    )
  );
};
type VendorChallanFormValues = z.infer<typeof vendorChallanSchema>;

export default function VendorChallanForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
  } = useForm<VendorChallanFormValues>({
    resolver: zodResolver(vendorChallanSchema),
  });

  const [modalOpen, setModalOpen] = useState(true);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [ocr, setOcr] = useState<Awaited<ReturnType<typeof getAllOcr>>>();
  const [ocrData, setOcrData] = useState<Ocr>();
  useEffect(() => {
    (async () => {
      setOcr(await getAllOcr());
    })();
  }, []);

  useEffect(() => {
    if (!ocrData) {
      return;
    }
    if (ocrData?.company.sheetUrl == null) {
      toast.warning(`${ocrData?.company.name} does not have a sheet URL.`);
    }
    setSheetUrl(ocrData?.company.sheetUrl ?? null);
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(`data_for_mis_${ocrData?.id}`);

      if (!data) {
        setValue("biomeChallanNo", "");
      } else {
        let json = JSON.parse(data);
        setValue("biomeChallanNo", json.at(-1)["challan_number"]);
      }
    }
    setValue("challanDate", format(ocrData.date, "yyyy-MM-dd"));
    // console.log(format(ocrData.date, "dd-MM-yyyy"));

    setValue("grossWeight", ocrData?.gross_weight.toString() ?? "");
    setValue("netWeightNTPC", ocrData?.net_weight.toString() ?? "");
    setValue("tareWeight", ocrData?.tare_weight.toString() ?? "");
    setValue("vehicleNo", ocrData?.vehicle_number.toString() ?? "");
    setValue("netWeightVendor", ocrData?.A_weight.toString() ?? "");
    setValue("bteChallanNo", ocrData?.challan.toString() ?? "");
    setValue("ewayBillNo", ocrData?.e_way_bill.toString() ?? "");
    // setValue("hsnCode", "440110");
    // setValue("registrationState", "23-Madhya Pradesh");
    // setValue("gstCode", "23");
    // setValue("gstNumber", "23AAJCB9063A1ZZ");
    setValue(
      "ewayBillDate",
      ocrData?.e_way_bill_date.toISOString().slice(0, 10) ?? ""
    );
  }, [ocrData]);

  const onSubmit = async (data: VendorChallanFormValues) => {
    console.log("Form submitted:", data);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "text/plain;charset=utf-8");

      const raw = JSON.stringify({
        type: "V",
        data: { ...data, status: ocrData?.delivery_status },
        sheetURl: sheetUrl,
      });

      await fetch(process.env.NEXT_PUBLIC_GS_URL ?? "", {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      })
        .then((data) => data.json())
        .then((data) => {
          alert(data.massage ?? data.message);
        });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error);
    }
  };
  const [vendors, setVendors] = useState<vendorDetail[] | null>(null);
  useEffect(() => {
    (async () => {
      setVendors(await getAllVendor());
    })();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Form</p>
            <h2 className="text-base font-semibold text-slate-100">Vendor Challan Details</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(true)}>
            Change Bill
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Vendor & Challan Info */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Vendor Name</label>
            <select
              className="select select-bordered w-full"
              defaultValue=""
              onChange={(v) => setValue("vendorName", v.target.value)}
            >
              <option value="" disabled>Select vendor</option>
              {vendors?.map((ocr) => (
                <option key={ocr.id} value={ocr.name}>
                  {ocr.name || `Vendor #${ocr.id}`}
                </option>
              ))}
            </select>
            {errors.vendorName && <p className="text-error text-xs">{errors.vendorName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Vendor Challan Date" name="vendorChallanDate" type="date" register={register} error={errors.vendorChallanDate} inputClass="input" />
            <Field label="Vendor Challan No. / Bill No." name="vendorChallanNo" register={register} error={errors.vendorChallanNo} inputClass="input" />
            <Field label="Vendor Material Weight" name="netWeightVendor" register={register} error={errors.netWeightVendor} inputClass="input" />
            <Field label="Vehicle No." name="vehicleNo" register={register} error={errors.vehicleNo} inputClass="input" />
            <Field label="BTE Challan No." name="bteChallanNo" register={register} error={errors.bteChallanNo} inputClass="input" />
            <Field label="Challan Date" name="challanDate" type="date" register={register} error={errors.challanDate} inputClass="input" />
            <Field label="E-Way Bill No." name="ewayBillNo" register={register} error={errors.ewayBillNo} inputClass="input" />
            <Field label="Gross Weight" name="grossWeight" register={register} error={errors.grossWeight} inputClass="input" />
            <Field label="Tare Weight" name="tareWeight" register={register} error={errors.tareWeight} inputClass="input" />
            <Field label="Net Weight (For NTPC)" name="netWeightNTPC" register={register} error={errors.netWeightNTPC} inputClass="input" />
            <Field label="Party NTPC Challan No." name="biomeChallanNo" register={register} error={errors.biomeChallanNo} inputClass="input" />
          </div>

          <div className="pt-1">
            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full sm:w-auto">
              {isSubmitting ? "Processing..." : "Submit to Sheet"}
            </button>
          </div>
        </form>
      </div>

      <FileUploadModal
        selectOcrData={setOcrData}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ocrData={ocr}
        setValue={setValue}
        getValue={getValues}
      />
    </>
  );
}

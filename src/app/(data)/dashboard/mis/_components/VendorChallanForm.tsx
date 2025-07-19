"use client";
import { useForm, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorChallanSchema } from "../_utils/schema";
import type { z } from "zod";
import { Field } from "./Field";
import { useEffect, useState } from "react";
import { companyDetail, ocr, Prisma } from "@/generated/prisma";
import { vendorDetail } from "@/generated/prisma";
import { extractData_msi, getAllOcr, getFilePart } from "@/action/ocr";
import { toast } from "sonner";
import { getAllVendor } from "@/action/vendores";
import { format } from "date-fns";
const convertToHtmlDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split("-");
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
}: {
  open: boolean;
  onClose: () => void;
  ocrData: Awaited<ReturnType<typeof getAllOcr>> | undefined;
  selectOcrData: React.Dispatch<React.SetStateAction<Ocr | undefined>>;
  setValue: UseFormSetValue<z.infer<typeof vendorChallanSchema>>;
}) => {
  if (!open) return null;
  if (!ocrData) return null;
  const [ewayBill, setEwayBill] = useState<null | File>(null);
  const [challan, setChallan] = useState<null | File>(null);

  const onsubmit = async () => {
    if (!ewayBill) return;
    try {
      const ewayBillFile = await getFilePart(ewayBill);
      const challanFile = challan ? await getFilePart(challan) : null;
      let data = await extractData_msi([ewayBillFile, challanFile]);
      if (!data) {
        throw new Error("Data not found!!");
      }

      setValue("vendorChallanDate", convertToHtmlDate(data.challan_date));
      setValue("vendorChallanNo", data.challan_number);
      // setValue("vendorEwayBill", data.eway_bill_number);
      // setValue("vendorEwayBillDate", convertToHtmlDate(data.eway_bill_date));
    } catch (e: any) {
      console.log(e);

      toast.error(e.message);
    } finally {
      onClose();
    }
  };
  return (
    open && (
      <dialog open className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Upload Files</h3>
          <div className="flex flex-col gap-4">
            <label>challan</label>
            <select
              className="select select-bordered"
              defaultValue=""
              onChange={(v) => {
                const selected = ocrData.find(
                  (xx) =>
                    xx.id === Number(v.target.value) && xx.company !== null
                );
                if (selected && selected.company) {
                  // Type assertion is safe here because of the check above
                  selectOcrData(selected as Ocr);
                } else {
                  selectOcrData(undefined);
                }
              }}
            >
              <option value="" disabled>
                Select Challan
              </option>
              {ocrData?.map((ocr) => (
                <option key={ocr.id} value={ocr.id}>
                  {ocr.challan || `OCR #${ocr.id}`}
                </option>
              ))}
            </select>
            <label>Vendor challan</label>
            <input
              onChange={(e) => {
                if (!e.target.files) return;
                setChallan(e.target.files[0]);
              }}
              type="file"
              className="file-input file-input-bordered"
            />
            <label>Vendor E-way bill</label>
            <input
              onChange={(e) => {
                if (!e.target.files) return;
                setEwayBill(e.target.files[0]);
              }}
              type="file"
              className="file-input file-input-bordered"
            />
          </div>
          <div className="modal-action">
            <button className="btn" onClick={onClose}>
              Close
            </button>
            <button className="btn" disabled={!ewayBill} onClick={onsubmit}>
              Submit
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
    setValue("challanDate", format(ocrData.date, "dd-MMM-yyyy"));
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
      <button className="btn btn-accent" onClick={() => setModalOpen(true)}>
        Change bill
      </button>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      >
        <div className="flex flex-col">
          <label>Vendor Name</label>
          <select
            className="select select-bordered"
            defaultValue=""
            onChange={(v) => {
              setValue("vendorName", v.target.value);
            }}
          >
            <option value="" disabled>
              Select vendor
            </option>
            {vendors?.map((ocr) => (
              <option key={ocr.id} value={ocr.name}>
                {ocr.name || `OCR #${ocr.id}`}
              </option>
            ))}
          </select>
          {errors.vendorName && (
            <p className="text-error">{errors.vendorName.message}</p>
          )}
        </div>
        <Field
          label="Vendor Challan Date"
          name="vendorChallanDate"
          type="date"
          register={register}
          error={errors.vendorChallanDate}
          inputClass="input"
        />
        <Field
          label="Vendor Challan No./Bill No."
          name="vendorChallanNo"
          register={register}
          error={errors.vendorChallanNo}
          inputClass="input"
        />
        {/* <Field
          label="Vendor E-Way Bill Date"
          name="vendorEwayBillDate"
          type="date"
          register={register}
          error={errors.vendorEwayBillDate}
          inputClass="input"
        /> */}
        {/* <Field
          label="Vendor Eway-Bill"
          name="vendorEwayBill"
          register={register}
          error={errors.vendorEwayBill}
          inputClass="input"
        /> */}
        <Field
          label="Vender material Weight "
          name="netWeightVendor"
          register={register}
          error={errors.netWeightVendor}
          inputClass="input"
        />

        <Field
          label="Vehicle No."
          name="vehicleNo"
          register={register}
          error={errors.vehicleNo}
          inputClass="input"
        />
        <Field
          label="BTE Challan No."
          name="bteChallanNo"
          register={register}
          error={errors.bteChallanNo}
          inputClass="input"
        />
        <Field
          label="Challan Date"
          name="challanDate"
          type="date"
          register={register}
          error={errors.challanDate}
          inputClass="input"
        />
        {/* <Field
          label="HSN Code"
          name="hsnCode"
          register={register}
          error={errors.hsnCode}
          inputClass="input"
        /> */}
        {/* <Field
          label="Registration State"
          name="registrationState"
          register={register}
          error={errors.registrationState}
          inputClass="input"
        /> */}
        {/* <Field
          label="GST Code"
          name="gstCode"
          register={register}
          error={errors.gstCode}
          inputClass="input"
        /> */}
        {/* <Field
          label="GST Number"
          name="gstNumber"
          register={register}
          error={errors.gstNumber}
          inputClass="input"
        /> */}
        <Field
          label="E-Way Bill Date"
          name="ewayBillDate"
          type="date"
          register={register}
          error={errors.ewayBillDate}
          inputClass="input"
        />
        <Field
          label="E-Way Bill No."
          name="ewayBillNo"
          register={register}
          error={errors.ewayBillNo}
          inputClass="input"
        />
        <Field
          label="Gross Weight"
          name="grossWeight"
          register={register}
          error={errors.grossWeight}
          inputClass="input"
        />
        <Field
          label="Tare Weight"
          name="tareWeight"
          register={register}
          error={errors.tareWeight}
          inputClass="input"
        />
        <Field
          label="Net Weight (For NTPC)"
          name="netWeightNTPC"
          register={register}
          error={errors.netWeightNTPC}
          inputClass="input"
        />
        <Field
          label="Party NTPC Challan No."
          name="biomeChallanNo"
          register={register}
          error={errors.biomeChallanNo}
          inputClass="input"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary col-span-full mt-4"
        >
          {isSubmitting ? "Possessing..." : "Submit"}
        </button>
      </form>

      <FileUploadModal
        selectOcrData={setOcrData}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ocrData={ocr}
        setValue={setValue}
      />
    </>
  );
}

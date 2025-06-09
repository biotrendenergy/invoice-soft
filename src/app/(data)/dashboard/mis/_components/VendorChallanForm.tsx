import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorChallanSchema } from "../_utils/schema";
import type { z } from "zod";
import { Field } from "./Field";
import { useEffect, useState } from "react";
import { ocr } from "@/generated/prisma";
import { getAllOcr } from "@/action/ocr";

const FileUploadModal = ({
  open,
  onClose,
  ocrData,
  selectOcrData,
}: {
  open: boolean;
  onClose: () => void;
  ocrData: ocr[] | undefined;
  selectOcrData: React.Dispatch<React.SetStateAction<ocr | undefined>>;
}) => {
  if (!open) return null;
  if (!ocrData) return null;
  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Upload Files</h3>
        <div className="flex flex-col gap-4">
          <label>challan</label>
          <select
            className="select select-bordered"
            defaultValue=""
            onChange={(v) =>
              selectOcrData(
                ocrData.filter((xx) => xx.id == Number(v.target.value))[0]
              )
            }
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
          <input type="file" className="file-input file-input-bordered" />
          <label>Vendor E-way bill</label>
          <input type="file" className="file-input file-input-bordered" />
          {/*  <label>NTPC challan</label>

          <input type="file" className="file-input file-input-bordered" />
          <label>NTPC E-way bill</label>

          <input type="file" className="file-input file-input-bordered" /> */}
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};
type VendorChallanFormValues = z.infer<typeof vendorChallanSchema>;

export default function VendorChallanForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VendorChallanFormValues>({
    resolver: zodResolver(vendorChallanSchema),
  });

  const [modalOpen, setModalOpen] = useState(true);
  const [ocr, setOcr] = useState<ocr[]>();
  const [ocrData, setOcrData] = useState<ocr>();
  useEffect(() => {
    (async () => {
      setOcr(await getAllOcr());
    })();
  }, []);
  useEffect(() => {
    const data = localStorage.getItem("data_for_mis");
    if (!data) {
      setValue("biomeChallanNo", "");
    } else {
      let json = JSON.parse(data);
      setValue("biomeChallanNo", json.at(-1)["challan_number"]);
    }
    setValue("grossWeight", ocrData?.gross_weight.toString() ?? "");
    setValue("netWeightNTPC", ocrData?.net_weight.toString() ?? "");
    setValue("tareWeight", ocrData?.tare_weight.toString() ?? "");
    setValue("vehicleNo", ocrData?.vehicle_number.toString() ?? "");
    // setValue('',ocrData?.gross_weight.toString() ?? "");
    // setValue("grossWeight", ocrData?.gross_weight.toString() ?? "");
    // setValue("grossWeight", ocrData?.gross_weight.toString() ?? "");
    setValue("bteChallanNo", ocrData?.challan.toString() ?? "");
    setValue("ewayBillNo", ocrData?.e_way_bill.toString() ?? "");
    setValue("hsnCode", "440110");
    setValue("registrationState", "23-Madhya Pradesh");
    setValue("gstCode", "23");
    setValue("gstNumber", "23AAJCB9063A1ZZ");
  }, [ocrData]);

  const onSubmit = async (data: VendorChallanFormValues) => {
    console.log("Form submitted:", data);
    try {
      const url =
        "https://script.google.com/macros/s/AKfycbytf3rPFnhfBqDH-HvL6Xhduo0UmdA5zW7ySUCR1ZyU4MlJ1VQXKbn48z7pDBAwK7w3Lg/exec";
      const response = await fetch(url, {
        method: "POST",
        mode: "no-cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(data),
      });

      console.log("Response data:", response.json());
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  return (
    <>
      <button className="btn btn-accent" onClick={() => setModalOpen(true)}>
        Change bill
      </button>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      >
        <Field
          label="Vendor Name"
          name="vendorName"
          register={register}
          error={errors.vendorName}
          inputClass="input"
        />
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
        <Field
          label="Vendor E-Way Bill Date"
          name="vendorEwayBillDate"
          type="date"
          register={register}
          error={errors.vendorEwayBillDate}
          inputClass="input"
        />
        <Field
          label="Vendor Eway-Bill"
          name="vendorEwayBill"
          register={register}
          error={errors.vendorEwayBill}
          inputClass="input"
        />
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
        <Field
          label="HSN Code"
          name="hsnCode"
          register={register}
          error={errors.hsnCode}
          inputClass="input"
        />
        <Field
          label="Registration State"
          name="registrationState"
          register={register}
          error={errors.registrationState}
          inputClass="input"
        />
        <Field
          label="GST Code"
          name="gstCode"
          register={register}
          error={errors.gstCode}
          inputClass="input"
        />
        <Field
          label="GST Number"
          name="gstNumber"
          register={register}
          error={errors.gstNumber}
          inputClass="input"
        />
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
        <button type="submit" className="btn btn-primary col-span-full mt-4">
          Submit
        </button>
      </form>
      <FileUploadModal
        selectOcrData={setOcrData}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ocrData={ocr}
      />
    </>
  );
}

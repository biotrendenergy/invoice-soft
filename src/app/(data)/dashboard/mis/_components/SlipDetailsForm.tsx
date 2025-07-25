"use client";
import { useForm, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DebitNoteFormValues, slipDetailsSchema } from "../_utils/schema";
import type { z } from "zod";
import { Field } from "./Field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  extractData_slipData,
  extractEWayBill_withIn,
  getAllOcr,
  getFilePart,
} from "@/action/ocr";
import Link from "next/link";
import { companyDetail, ocr } from "@/generated/prisma";
import { toast } from "sonner";
import { CreateDebitNoteModal } from "./CreateDebitNoteModal";
import { createDebitNote } from "@/action/note";
function getDurationInWords(
  date_in: string,
  date_out: string,
  time_in: string,
  time_out: string
): string {
  // Helper to convert dd/mm/yyyy to yyyy-mm-dd
  const formatDate = (dateStr: string): string => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  const start = new Date(`${formatDate(date_in)}T${time_in}`);
  const end = new Date(`${formatDate(date_out)}T${time_out}`);
  console.log(start, end);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "Invalid date or time input.";
  }

  let durationMs = end.getTime() - start.getTime();

  if (durationMs < 0) {
    return "Invalid input: end time is before start time.";
  }

  const msInDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.ceil(durationMs / msInDay); // Always round up

  return `${totalDays} day${totalDays !== 1 ? "s" : ""}`;
}

const convertToHtmlDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};
type SlipDetailsFormValues = z.infer<typeof slipDetailsSchema>;

const FileUploadModal = ({
  open,
  onClose,
  setValue,
  selectOcrData,
  ocrData,
  setVendorChallan,
}: {
  open: boolean;
  onClose: () => void;
  ocrData: Awaited<ReturnType<typeof getAllOcr>> | undefined;
  selectOcrData: React.Dispatch<React.SetStateAction<Ocr | undefined>>;
  setValue: UseFormSetValue<z.infer<typeof slipDetailsSchema>>;
  setVendorChallan: Dispatch<
    SetStateAction<{
      EWayBillNumber: string;
      ChallanOrInvoiceNumber: string;
      generated_date: string;
      vehicle_number: string;
      gst_no: string;
      shipping_address: string;
      quantity: string | number;
    } | null>
  >;
}) => {
  const [slipFile, setSlipFile] = useState<null | File>(null);
  const [challan, setChallan] = useState<null | File>(null);
  const [ocr, setOcr] = useState<null | ocr>(null);
  const [loading, setLoading] = useState(false);

  if (!ocrData) return null;

  return (
    open && (
      <dialog open className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Upload Files</h3>
          <div className="flex flex-col gap-4">
            <label>Challan</label>
            <select
              className="select select-bordered"
              defaultValue=""
              onChange={(v) => {
                const selected = ocrData.find(
                  (xx) =>
                    xx.id === Number(v.target.value) && xx.company !== null
                );
                if (selected && selected.company) {
                  selectOcrData(selected as Ocr);
                  setOcr(selected);
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

            <label>Upload Slip</label>
            <input
              onChange={(e) => {
                if (!e.target.files) return;
                setSlipFile(e.target.files[0]);
              }}
              type="file"
              className="file-input file-input-bordered"
            />

            <label>Upload Vendor Challan</label>
            <input
              onChange={(e) => {
                if (!e.target.files) return;
                setChallan(e.target.files[0]);
              }}
              type="file"
              className="file-input file-input-bordered"
            />
          </div>

          <div className="modal-action flex justify-between items-center">
            <button className="btn" onClick={onClose} disabled={loading}>
              Close
            </button>
            <button
              className={`btn ${loading ? "btn-disabled opacity-50" : ""}`}
              onClick={async () => {
                try {
                  if (!slipFile || !challan) return;
                  setLoading(true);

                  const file = await getFilePart(slipFile);
                  const data = await extractData_slipData(file);

                  const challanFile = await getFilePart(challan); // <-- might be a mistake, should this be `challan`?
                  const ChallanData = await extractEWayBill_withIn(challanFile);

                  setValue("grossWeight", data.gross_weight);
                  setValue("netWeight", data.net_weight);
                  setValue("slipInDate", convertToHtmlDate(data.date_in));
                  setValue("slipOut", convertToHtmlDate(data.date_out));
                  setValue("tareWeight", data.tare_weight);
                  setValue(
                    "stayDuration",
                    getDurationInWords(
                      data.date_in,
                      data.date_out,
                      data.time_in,
                      data.time_out
                    )
                  );

                  setVendorChallan(ChallanData);

                  setValue(
                    "weightDiff",
                    Math.abs(
                      parseInt(data.net_weight) - (ocr?.net_weight ?? 0)
                    ).toString() + " kgs"
                  );
                } catch (e) {
                  console.error("Submission error", e);
                } finally {
                  setLoading(false);
                  onClose();
                }
              }}
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={onClose} disabled={loading}>
            close
          </button>
        </form>
      </dialog>
    )
  );
};

interface Ocr extends ocr {
  company: companyDetail;
}
export default function SlipDetailsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    getValues,
  } = useForm<SlipDetailsFormValues>({
    resolver: zodResolver(slipDetailsSchema),
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [vendorChallan, setVendorChallan] = useState<{
    EWayBillNumber: string;
    ChallanOrInvoiceNumber: string;
    generated_date: string;
    vehicle_number: string;
    gst_no: string;
    shipping_address: string;
    quantity: string | number;
  } | null>(null);
  const onSubmit = async (data: SlipDetailsFormValues) => {
    console.log("Form submitted:", data);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "text/plain;charset=utf-8");

      const raw = JSON.stringify({
        type: "S",
        data: {
          ...data,
          grossWeight: parseInt(data.grossWeight).toString(),
          tareWeight: parseInt(data.tareWeight).toString(),
          netWeight: parseInt(data.netWeight).toString(),
          weightDiff: parseInt(data.weightDiff).toString(),
        },
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
    }
  };
  const [ocr, setOcr] = useState<Awaited<ReturnType<typeof getAllOcr>>>();
  const [ocrData, setOcrData] = useState<Ocr>();
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setOcr(await getAllOcr());
    })();
  }, []);
  useEffect(() => {
    setValue("bteChallanNo", ocrData?.challan ?? "");
  }, [ocrData]);

  useEffect(() => {
    if (!ocrData) {
      return;
    }
    if (ocrData?.company.sheetUrl == null) {
      toast.warning(`${ocrData?.company.name} does not have a sheet URL.`);
    }
    setSheetUrl(ocrData?.company.sheetUrl ?? null);
  }, [ocrData]);

  const handleDebitNoteSubmit = (noteData: DebitNoteFormValues) => {
    console.log("Debit note data:", noteData);
    createDebitNote({
      e_way_bill_ship_to: noteData.e_way_bill_ship_to,
      party_challan: noteData.partyChallan ?? "",
      bte_challan: noteData.bteChallan,
      venderChallan: noteData.vendorChallan ?? "",
      rate: noteData.rate,
      quntity: noteData.quantity,
      amount: noteData.amount,
      sgst: noteData.sgst ?? 0,
      cgst: noteData.cgst ?? 0,
      isIgst: noteData.isIgst ?? false,
      igst: noteData.igst ?? 0,
      billTo: {
        connect: {
          id: noteData.vendorDetailId,
        },
      },
      shipTo: {
        connect: {
          id: noteData.companyDetailId,
        },
      },
    }).then((data) => {
      console.log(data);
      window.open(`/debit-note/${data.id}`, "popupWindow");

      // window.location.href = "/debit-note/" + data.id;

      // handle success
    });
    // You can post this to an API or store it as needed
  };
  const [showDebitModal, setShowDebitModal] = useState(false);
  return (
    <>
      <button className="btn btn-accent" onClick={() => setModalOpen(true)}>
        upload receiving slip
      </button>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      >
        <Field
          label="Slip In Date (DD-MM-YYYY)"
          name="slipInDate"
          type="date"
          register={register}
          error={errors.slipInDate}
          inputClass="input"
        />
        <Field
          label="Slip Out"
          name="slipOut"
          type="date"
          register={register}
          error={errors.slipOut}
          inputClass="input"
        />
        <Field
          label="Vehicle Stay Duration"
          name="stayDuration"
          register={register}
          error={errors.stayDuration}
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
          label="Net Weight"
          name="netWeight"
          register={register}
          error={errors.netWeight}
          inputClass="input"
        />
        <Field
          label="Weight Difference B/W BTE and NTPC"
          name="weightDiff"
          register={register}
          error={errors.weightDiff}
          inputClass="input"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary col-span-full mt-4"
        >
          {isSubmitting ? "Processing" : "Submit"}
        </button>

        {watch("weightDiff") &&
          parseInt(getValues("weightDiff")) !== 0 &&
          !isNaN(parseInt(getValues("weightDiff"))) && (
            <button
              type="button"
              className="btn btn-active"
              onClick={() => setShowDebitModal(true)}
            >
              Create Debit Note
            </button>
          )}
      </form>
      <CreateDebitNoteModal
        open={showDebitModal}
        onClose={() => setShowDebitModal(false)}
        onSubmit={handleDebitNoteSubmit}
        ocrData={ocrData}
        defaultValues={{
          bteChallan: getValues("bteChallanNo"),
          quantity: parseInt(getValues("weightDiff")),
          companyDetailId: ocrData?.company.id,
          vendorChallan: vendorChallan?.ChallanOrInvoiceNumber ?? undefined,
          e_way_bill_ship_to: ocrData?.e_way_bill_ship_to ?? undefined,

          // rate: 1, // set default or calculate
        }}
        // you can add vendor info if available
      />
      <FileUploadModal
        setVendorChallan={setVendorChallan}
        selectOcrData={setOcrData}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        setValue={setValue}
        ocrData={ocr}
      />
    </>
  );
}

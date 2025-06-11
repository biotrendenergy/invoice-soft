import { useForm, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { slipDetailsSchema } from "../_utils/schema";
import type { z } from "zod";
import { Field } from "./Field";
import { useEffect, useState } from "react";
import { extractData_slipData, getAllOcr, getFilePart } from "@/action/ocr";
import Link from "next/link";
import { ocr } from "@/generated/prisma";
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

  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  const hours = Math.floor((durationMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);

  return parts.length ? parts.join(" ") : "0 seconds";
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
}: {
  open: boolean;
  onClose: () => void;
  ocrData: ocr[] | undefined;
  selectOcrData: React.Dispatch<React.SetStateAction<ocr | undefined>>;
  setValue: UseFormSetValue<z.infer<typeof slipDetailsSchema>>;
}) => {
  if (!open) return null;
  if (!ocrData) return null;
  const [slipFile, setSlipFile] = useState<null | File>(null);
  const [ocr, setOcr] = useState<null | ocr>(null);
  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Upload Files</h3>
        <div className="flex flex-col gap-4">
          <label>challan</label>
          <select
            className="select select-bordered"
            defaultValue=""
            onChange={(v) => {
              selectOcrData(
                ocrData.filter((xx) => xx.id == Number(v.target.value))[0]
              );
              setOcr(
                ocrData.filter((xx) => xx.id == Number(v.target.value))[0]
              );
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
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
          <button
            className="btn"
            onClick={async () => {
              try {
                if (!slipFile) return;
                const file = await getFilePart(slipFile);
                const data = await extractData_slipData(file);
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
                setValue(
                  "weightDiff",
                  Math.abs(
                    parseInt(data.net_weight) - (ocr?.net_weight ?? 0)
                  ).toString() + " kgs"
                );
              } catch (e) {
              } finally {
                onClose();
              }
            }}
          >
            Submit
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};
export default function SlipDetailsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SlipDetailsFormValues>({
    resolver: zodResolver(slipDetailsSchema),
  });
  const [modalOpen, setModalOpen] = useState(true);
  const onSubmit = (data: SlipDetailsFormValues) =>
    console.log("Slip data", data);
  const [ocr, setOcr] = useState<ocr[]>();
  const [ocrData, setOcrData] = useState<ocr>();
  useEffect(() => {
    (async () => {
      setOcr(await getAllOcr());
    })();
  }, []);

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

        <button type="submit" className="btn btn-primary col-span-full mt-4">
          Submit
        </button>
        <Link href={"/debit-note/id"} target="__black">
          <button type="button" className="btn btn-active">
            create Debit note
          </button>
        </Link>
      </form>
      <FileUploadModal
        selectOcrData={setOcrData}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        setValue={setValue}
        ocrData={ocr}
      />
    </>
  );
}

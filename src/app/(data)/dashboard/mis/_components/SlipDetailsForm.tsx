import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { slipDetailsSchema } from "../_utils/schema";
import type { z } from "zod";
import { Field } from "./Field";
import { useState } from "react";

type SlipDetailsFormValues = z.infer<typeof slipDetailsSchema>;
const FileUploadModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  if (!open) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Upload Files</h3>
        <div className="flex flex-col gap-4">
          <label>Upload Slip</label>
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
export default function SlipDetailsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SlipDetailsFormValues>({
    resolver: zodResolver(slipDetailsSchema),
  });
  const [modalOpen, setModalOpen] = useState(true);
  const onSubmit = (data: SlipDetailsFormValues) =>
    console.log("Slip data", data);

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
      </form>
      <FileUploadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

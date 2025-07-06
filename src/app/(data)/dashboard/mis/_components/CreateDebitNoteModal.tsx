import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getAllVendor } from "@/action/vendores";
import { getAllCompany } from "@/action/company";
import { companyDetail, vendorDetail } from "@/generated/prisma";
import { DebitNoteFormValues, debitNoteSchema } from "../_utils/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DebitNoteFormValues) => void;
  defaultValues?: Partial<DebitNoteFormValues>;
}

export const CreateDebitNoteModal = ({
  open,
  onClose,
  onSubmit,
  defaultValues,
}: Props) => {
  if (!open) return null;
  console.log(defaultValues);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
    getValues,
  } = useForm<DebitNoteFormValues>({
    resolver: zodResolver(debitNoteSchema),
    defaultValues,
  });

  console.log(watch("companyDetailId"));

  const [vendors, setVendors] = useState<vendorDetail[]>([]);
  const [companies, setCompanies] = useState<companyDetail[]>([]);

  const rate = watch("rate");
  const quantity = watch("quantity");

  useEffect(() => {
    const r = Number(rate);
    const q = Number(quantity);
    if (!isNaN(r) && !isNaN(q)) {
      setValue("amount", parseFloat((r * q).toFixed(2)));
    }
  }, [rate, quantity, setValue]);

  useEffect(() => {
    (async () => {
      const [vendorData, companyData] = await Promise.all([
        getAllVendor(),
        getAllCompany(),
      ]);
      setVendors(vendorData);
      setCompanies(companyData);
    })();
  }, []);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    setValue("amount", getValues("quantity") * getValues("rate"));
  }, [setValue, watch("rate")]);

  return (
    open && (
      <dialog open className="modal">
        <div className="modal-box max-w-xl">
          <h3 className="font-bold text-lg mb-4">Create Debit Note</h3>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Company */}
            <div>
              <label className="label font-semibold">Select Company</label>
              <select
                {...register("companyDetailId")}
                className="select select-bordered w-full"
              >
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option
                    key={c.id}
                    selected={c.id == defaultValues?.companyDetailId}
                    value={c.id}
                  >
                    {c.shotName}
                  </option>
                ))}
              </select>
              {errors.companyDetailId && (
                <p className="text-red-500 text-sm">
                  {errors.companyDetailId.message}
                </p>
              )}
            </div>

            {/* Vendor */}
            <div>
              <label className="label font-semibold">Select Vendor</label>
              <select
                {...register("vendorDetailId")}
                className="select select-bordered w-full"
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              {errors.vendorDetailId && (
                <p className="text-red-500 text-sm">
                  {errors.vendorDetailId.message}
                </p>
              )}
            </div>

            {/* Reference Challan */}
            {/* <div>
              <label className="label font-semibold">Reference Challan</label>
              <input
                type="text"
                {...register("referenceChallan")}
                className="input input-bordered w-full"
                placeholder="Reference Challan"
              />
              {errors.referenceChallan && (
                <p className="text-red-500 text-sm">
                  {errors.referenceChallan.message}
                </p>
              )}
            </div> */}
            <div>
              <label className="label font-semibold">Party Challan</label>
              <input
                type="text"
                {...register("partyChallan")}
                className="input input-bordered w-full"
                placeholder="Reference Challan"
              />
              {errors.partyChallan && (
                <p className="text-red-500 text-sm">
                  {errors.partyChallan.message}
                </p>
              )}
            </div>
            {/* BTE Challan */}
            <div>
              <label className="label font-semibold">
                Reference BTE Challan
              </label>
              <input
                type="text"
                {...register("bteChallan")}
                className="input input-bordered w-full"
                placeholder="BTE Challan"
              />
              {errors.bteChallan && (
                <p className="text-red-500 text-sm">
                  {errors.bteChallan.message}
                </p>
              )}
            </div>
            <div>
              <label className="label font-semibold">vendor Challan</label>
              <input
                type="text"
                {...register("vendorChallan")}
                className="input input-bordered w-full"
                placeholder="vendor Challan"
              />
              {errors.vendorChallan && (
                <p className="text-red-500 text-sm">
                  {errors.vendorChallan.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="label font-semibold">Quantity</label>
              <input
                type="number"
                {...register("quantity")}
                className="input input-bordered w-full"
                placeholder="Quantity"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            {/* Rate */}
            <div>
              <label className="label font-semibold">Rate</label>
              <input
                type="number"
                {...register("rate")}
                className="input input-bordered w-full"
                placeholder="Rate"
              />
              {errors.rate && (
                <p className="text-red-500 text-sm">{errors.rate.message}</p>
              )}
            </div>

            {/* Amount (auto-calculated) */}
            <div>
              <label className="label font-semibold">
                Amount (without tex)
              </label>
              <input
                type="number"
                {...register("amount")}
                className="input input-bordered w-full"
                placeholder="Amount"
                readOnly
              />
            </div>

            {/* SGST */}
            <div>
              <label className="label font-semibold">SGST %</label>
              <input
                type="number"
                step="0.01"
                {...register("sgst")}
                className="input input-bordered w-full"
                placeholder="SGST %"
              />
              {errors.sgst && (
                <p className="text-red-500 text-sm">{errors.sgst.message}</p>
              )}
            </div>

            {/* CGST */}
            <div>
              <label className="label font-semibold">CGST %</label>
              <input
                type="number"
                step="0.01"
                {...register("cgst")}
                className="input input-bordered w-full"
                placeholder="CGST %"
              />
              {errors.cgst && (
                <p className="text-red-500 text-sm">{errors.cgst.message}</p>
              )}
            </div>
            {/* {watch("isIgst")?.valueOf()} */}
            {watch("isIgst") && getValues("isIgst") == true && (
              <div>
                <label className="label font-semibold">IGST %</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("igst")}
                  className="input input-bordered w-full"
                  placeholder="IGST %"
                />
                {errors.igst && (
                  <p className="text-red-500 text-sm">{errors.igst.message}</p>
                )}
              </div>
            )}
            {/* IGST checkbox */}
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                {...register("isIgst")}
                className="checkbox"
              />
              <span className="font-semibold">IGST?</span>
            </label>

            {/* Actions */}
            <div className="modal-action">
              <button type="button" className="btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Note
              </button>
            </div>
          </form>
        </div>
      </dialog>
    )
  );
};

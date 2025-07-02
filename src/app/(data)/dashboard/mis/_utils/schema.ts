import { z } from "zod";

export const vendorChallanSchema = z.object({
  vendorName: z.string().min(1, "Required"),
  vendorChallanDate: z.string(),
  vendorChallanNo: z.string().optional(),
  vendorEwayBillDate: z.string(),
  vendorEwayBill: z.string(),
  biomeChallanNo: z.string(),
  vehicleNo: z.string().min(1, "Required"),
  bteChallanNo: z.string(),
  challanDate: z.string(),
  hsnCode: z.string(),
  registrationState: z.string(),
  gstCode: z.string(),
  gstNumber: z.string(),
  ewayBillDate: z.string(),
  ewayBillNo: z.string(),
  grossWeight: z.string(),
  tareWeight: z.string(),
  netWeightNTPC: z.string(),
  netWeightVendor: z.string(),
});

export const slipDetailsSchema = z.object({
  slipInDate: z.string().min(1, "Required"),
  slipOut: z.string().min(1, "Required"),
  stayDuration: z.string(),
  grossWeight: z.string(),
  tareWeight: z.string(),
  netWeight: z.string(),
  weightDiff: z.string(),
  bteChallanNo: z.string()


});

export const debitNoteSchema = z.object({
  bteChallan: z.string().min(1),
  referenceChallan: z.string().min(1),
  partyChallan: z.string().optional(),
  vendorChallan: z.string().optional(),
  rate: z.coerce.number().min(0.01),
  quantity: z.coerce.number().min(1),
  amount: z.coerce.number(),
  sgst: z.coerce.number().min(0).optional(),
  cgst: z.coerce.number().min(0).optional(),
  isIgst: z.boolean().optional(),
  igst: z.coerce.number().optional(),
  companyDetailId: z.coerce.number().min(1),
  vendorDetailId: z.coerce.number().min(1),
});

export type DebitNoteFormValues = z.infer<typeof debitNoteSchema>;

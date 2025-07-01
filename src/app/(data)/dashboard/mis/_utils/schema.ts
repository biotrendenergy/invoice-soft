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

import { z } from "zod";
import { parse, isValid } from "date-fns";

const formats = [
  "dd/MM/yyyy",
  "MM-dd-yyyy",
  "yyyy/MM/dd",
  "yyyy-MM-dd",
  "dd-MM-yyyy",
  "MM/dd/yyyy",
];

export function parseFlexibleDate(dateStr: string) {
  for (const format of formats) {
    const parsedDate = parse(dateStr, format, new Date());
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  }
  return null;
}

export const extractDataSchema = z.object({
  weight: z.number(),
  vehicle_number: z.string(),
  address: z.string(),
  map_url: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  date: z.coerce.date(),
});

export const formSchema = z.object({
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
  tar_file: z.instanceof(File).optional(),
  gross_file: z.instanceof(File).optional(),
  net_file: z.instanceof(File).optional(),
  challanNo: z
    .string({ required_error: "Challan number is required" })
    .min(1, "Challan number cannot be empty"),
  tar_data: extractDataSchema,
  gross_data: extractDataSchema,
  net_data: extractDataSchema,
  multi_file: z.any().optional(),
});

export type formType = z.infer<typeof formSchema>;

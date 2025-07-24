"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/db";
import { ocr } from "@/generated/prisma";
import { headers } from "next/headers";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export async function deleteMultipleOCR(ids: number[]) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      console.log("Invalid input: ids must be a non-empty array.");
      return {
        error: "Invalid input: ids must be a non-empty array."
      };
    }
    // await prisma.audit.create({
    //   data: {
    //     ip: (await headers()).get("x-forwarded-for") ?? "0.0.0.0",
    //     message: `delete ocr with ids: ${ids.join(", ")} - ${ids.length} records`,
    //   },
    // });
    let s = await prisma.ocr.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    console.log(s);

    return s;
  } catch (error) {
    // throw error;
    await prisma.audit.create({
      data: {
        ip: (await headers()).get("x-forwarded-for") ?? "0.0.0.0",
        message: `Error deleting ocr with ids: ${ids.join(", ")} - ${ids.length} records`,
      },
    });
    return new Error(`Error deleting records: ${error instanceof Error ? error.message : String(error)}`);
  }
}
const PROMPT = `
**🖼️ Image Data Extraction Prompt (GPS Camera Format)**

You are provided with an image that contains logistics or shipment data, including a **weighing machine display** and a **GPS Camera overlay**.

---

### **🔍 Your task is to extract the following fields:**

---

#### **1. weight**

* A large numeric value displayed on the **scaling (weighing) machine screen**.
* Typically **5 to 6 digits**, **no units** displayed.
* Extract only the **numeric part**, as an **integer**.

---

#### **2. vehicle\_number**

* An Indian vehicle registration number.
* Common formats include:

  * \`CG10BV0674\`, \`MH - 12AB - 1234 \`,\`MH09X2545\`, \`MH 09X 2545\`
* Look for text near:

  * \`Note:\`, \`Vehicle No:\`, \`Truck No: \`, or free text near the GPS section.
* **Accept variations with or without spaces or dashes.**
* **Example:** If the image contains \`MH 09X 2545\`, extract \`"MH09X2545"\`.

---

#### **3. address**

* A complete textual address from the **GPS overlay section**.
* May include: street/road name, locality, city, state, pin code, country.
* Typically found near the top of the GPS overlay.

---

#### **4. map\_url**

* Construct a valid **Google Maps URL** using extracted latitude and longitude.
* Format:

  * \`https://maps.google.com/?q=<latitude>,<longitude>\`

---

#### ** 5. latitude ** & ** 6. longitude **

* Extract these from the ** GPS overlay **.
* Format: float numbers.
* Appear as:

  * \`Latitude: 22.936331\`
  * \`Longitude: 78.846788\`

---

#### ** 7. date **

* Appears in the ** GPS overlay ** under \`Date\`.
* Convert the date and time(GMT) to ** ISO 8601 UTC format **.
* Format: \`"YYYY-MM-DDTHH:MM:SSZ"\`

  * Example: \`07-05-2025 GMT 10:18:15 AM\` →\ \`"2025-07-05T10:18:15Z"\`

---

### ⚠️ Special Notes:

* Ignore values near terms like ** "AI Dietact" ** (e.g.,\`0\` or\`O\` beside it); they are not relevant.
* Clean and normalize any OCR quirks(e.g., letter "O" misread as zero \`0\`, or vice versa).

---

### ✅ Return Format

Return the ** first valid occurrence ** of each value in the following ** pure JSON ** structure:

\`\`\`json
{
  "weight": 59500,
  "vehicle_number": "MH09X2545",
  "address": "Kaudiya Road Chirah Kurdh, Madhya Pradesh 487555, India",
  "map_url": "https://maps.google.com/?q=22.936331,78.846788",
  "latitude": 22.936331,
  "longitude": 78.846788,
  "date": "2025-07-05T10:18:15Z"
}
\`\`\`

  > ✅ Return ** only the JSON output **, no explanation or extra text.

`;
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export type ExtractDataJsonType = {
  weight: number;
  vehicle_number: string;
  address: string;
  map_url: string;
  latitude: number;
  longitude: number;
  date: Date;
};
export const getFilePart = async (file: File) => {
  const headerList = await headers();
  await prisma.audit.create({
    data: {
      ip: headerList.get("x-forwarded-for") ?? "0.0.0.0",
      message: "File upload",
    },
  });

  return {
    inlineData: {
      mimeType: file.type,
      data: Buffer.from(await file.arrayBuffer()).toString("base64"),
    },
  };
};
export const extractData = async (
  filePart: any,
  maxRetries = 3
): Promise<ExtractDataJsonType> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: PROMPT }, filePart],
          },
        ],
      });

      const jsonText = await result.response.text();
      const jsonString = jsonText.replace(/^```json\s*|\s*```$/g, "");
      console.log(`Extracted JSON (attempt ${attempt + 1}):`, jsonString);
      await prisma.audit.create({
        data: {
          ip: (await headers()).get("x-forwarded-for") ?? "0.0.0.0",
          message: `Extracted data from image: ${jsonString}`,
        },
      });
      return JSON.parse(jsonString);
    } catch (error) {
      await prisma.audit.create({
        data: {
          ip: (await headers()).get("x-forwarded-for") ?? "0.0.0.0",
          message: `Error extracting data from image: ${error instanceof Error ? error.message : String(error)
            }`,
        },
      });
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;

      // Optional: wait before retrying
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
  throw new Error("Failed to extract data from image after multiple attempts.");
};

export async function extractFromImages(formData: FormData) {
  const netFile = formData.get("net_weight") as File;
  const grossFile = formData.get("gross_weight") as File;
  const bufferFile = formData.get("buffer") as File;

  if (!netFile || !grossFile || !bufferFile) {
    throw new Error("All three files are required.");
  }

  const netPart = await getFilePart(netFile);
  const grossPart = await getFilePart(grossFile);
  const bufferPart = await getFilePart(bufferFile);

  const netData = await extractData(netPart);
  const grossData = await extractData(grossPart);
  const bufferData = await extractData(bufferPart);

  // Compare vehicle numbers from each image
  const netVehicleNumber = netData.vehicle_number;
  const grossVehicleNumber = grossData.vehicle_number;
  const bufferVehicleNumber = bufferData.vehicle_number;

  if (
    netVehicleNumber === grossVehicleNumber &&
    grossVehicleNumber === bufferVehicleNumber
  ) {
    // Vehicle numbers match, insert data into Prisma
    // const createdData = addOCRData()
    // // Return the data inserted
    // return createdData;
  } else {
    // Vehicle numbers do not match
    throw new Error("Vehicle numbers do not match between the three images.");
  }
}

export async function addOCRData(data: ocr) {
  try {
    const headerList = await headers();

    await prisma.audit.create({
      data: {
        ip: headerList.get("x-forwarded-for") ?? "0.0.0.0",
        message: "create bill",
      },
    });
    return await prisma.ocr.create({
      data: { ...data, id: undefined },
    });
  } catch (error) {
    return Error("error");
  }
}

const E_WAYBILL_PROMPT = `
**E-Way Bill Number and Date Extraction Prompt (For PDF)**

You are provided with a PDF document that contains logistics or shipment information.

**Your task is:**

* Extract the **E-Way Bill Number** and its corresponding **Generated Date** from the document.

* The E-Way Bill Number is a **12-digit numeric value**.

* The **Generated Date** is usually in the format **DD/MM/YYYY** or **DD-MM-YYYY** and appears near the E-Way Bill Number.

* E-Way Bill Number is often labeled as:

  * \`eWay Bill No:\`
  * \`E-Way Bill No:\`
* or appears near the phrase "Generated Date" or "Generated By".

* Return the result as a list of objects in the following format:

\`\`\`

  {
    "eway_bill_no": "691863991440",
    "generated_date": "05/06/2024"
  }

\`\`\`

* If multiple E-Way Bill Numbers and dates are present, return all of them in the same format.

Do not include any explanation, headers, or extra formatting—only return the JSON or not in array form only in json object..

`;

export const extractEWayBill = async (
  filePart: any,
  maxRetries = 3
): Promise<{
  eway_bill_no: string;
  generated_date: string;
}> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: E_WAYBILL_PROMPT }, filePart],
          },
        ],
      });

      const jsonText = await result.response.text();
      const jsonString = jsonText.replace(/^```json\s*|\s*```$/g, "");
      console.log(`Extracted JSON (attempt ${attempt + 1}):`, jsonString);
      await prisma.audit.create({
        data: {
          ip: (await headers()).get("x-forwarded-for") ?? "0.0.0.0",
          message: `Extracted E-Way Bill data: ${jsonString}`,
        },
      });
      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      await prisma.audit.create({
        data: {
          ip: (await headers()).get("x-forwarded-for") ?? "0.0.0.0",
          message: `Error extracting E-Way Bill data: ${error instanceof Error ? error.message : String(error)
            }`,
        },
      });
      attempt++;

      // Optional: wait before retrying
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
  throw new Error("Failed to extract data from image after multiple attempts.");
};

const E_WAYBILL_PROMPT_in = `



### 📄 **E-Way Bill Extraction Prompt (with Shipping Address) – WITH EXAMPLE**

You are provided with a PDF or image document that contains logistics, shipping, or invoice information.

---

### 🔍 **Your task is to extract the following fields:**

---

#### **1. E-Way Bill Number**

* A **12-digit numeric** value.
* Commonly labeled as:

  * \`eWay Bill No: \`
  * \`E-Way Bill No: \`
  * May also appear near **"Generated Date"** or **"Generated By"**.

#### **2. Challan No or Invoice No**

* Can be **alphanumeric**.
* Possible labels include:

  * \`Challan No: \`, \`Challan Number: \`
  * \`Invoice No: \`, \`Invoice Number: \`
  * \`Document No.\`, \`Document Number\`

#### **3. Generated Date**

* Date format: \`DD / MM / YYYY\` or \`DD - MM - YYYY\`
* Often found near the **E-Way Bill Number** or **"Generated By"** label.

#### **4. Vehicle Number**

* Must follow Indian vehicle format:

  * Examples: \`MH12AB1234\`, \`RJ - 20 - GC - 4556\`, \`UP45AT9123\`
* May appear near:

  * \`Vehicle No: \`, \`Vehicle Number: \`, \`Trans Vehicle: \`
  * Or under \`Vehicle / Trans Doc No & Dt.\`

#### **5. Entered By GST Number**

* A 15-character alphanumeric GSTIN (e.g., \`23AAJCB9063A1ZZ\`)
* Often found near:

  * \`Entered By: \`, \`Generated By: \`, \`Supplier GSTIN: \`
  * Look for labels like \`GSTIN\`, \`GST No\`, \`GST Number\`

#### **6. Shipping Address**

* Found under label: \`:: Ship To:: \`
* Capture all lines after \`:: Ship To:: \` until:

  * An empty line, or
  * Another section begins.
* Return as a single-line formatted address.

---

### ✅ **Return Format**

Return the **first occurrence** of each value in the following JSON format:

\`\`\`json
{
  "EWayBillNumber": "691863991440",
    "ChallanOrInvoiceNumber": "INV/23-24/0198",
      "generated_date": "05/06/2024",
        "vehicle_number": "UP45AT9123",
          "gst_no": "06AAJCB1927H1ZS",
            "shipping_address": "1054 KHARGONE STPP DIST KHARGONE, VILLAGE SELDA POST KHEDI BUJURG, KHARGONE, MADHYA PRADESH, MADHYA PRADESH - 486885"
}
\`\`\`



`;

export const extractEWayBill_withIn = async (
  filePart: any,
  maxRetries = 3
): Promise<{
  EWayBillNumber: string;
  ChallanOrInvoiceNumber: string;
  generated_date: string;
  vehicle_number: string;
  gst_no: string;
  shipping_address: string
}> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: E_WAYBILL_PROMPT_in }, filePart],
          },
        ],
      });

      const jsonText = await result.response.text();
      const jsonString = jsonText.replace(/^```json\s*|\s*```$/g, "");
      console.log(`Extracted JSON (attempt ${attempt + 1}):`, jsonString);

      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;

      // Optional: wait before retrying
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
  throw new Error("Failed to extract data from image after multiple attempts.");
};

const Compare_PROMPT = `
Extract the following information from each uploaded PDF file **strictly following the format and rules below**.

### **Required Fields (return in JSON):**
\`\`\`json
{
  "vehicle_number": "UP45AT9123",
  "date": "14-05-2025",
  "net_weight": "1240.5 kg"
}
\`\`\`

---

### **Field Rules:**

* **\`vehicle_number\`**: Extract the full vehicle number exactly as it appears (e.g., \`"UP45AT9123"\`). If missing, return \`null\`.

* **\`date\`**: Extract the date in **DD-MM-YYYY** format (e.g., \`"14-05-2025"\`). If in another format, convert it. If unrecognizable, return \`null\`.

* **\`net_weight\`**:

  * Extract the weight value as a **number followed by its unit** (e.g., \`"1240.5 kg"\`).
  * **Remove any trailing \`.00\`** from the number (e.g., convert \`"39330.00"\` → \`"39330"\`).
  * Preserve the original **unit** use only "kg".
  * If the weight is not found, return \`null\`.
  * it alice name is Material Weight


### **Output Requirements:**

* Return a **JSON object**.
* The keys \`vehicle_number\`, \`date\`, and \`net_weight\` **must always be present**.
* Use \`null\` if any value is missing.
* Do not include any additional fields.

### **Example Outputs:**

\`\`\`json
{
  "vehicle_number": "UP45AT9123",
  "date": "14-05-2025",
  "net_weight": "39330 KGS"
}
\`\`\`

\`\`\`json
{
  "vehicle_number": null,
  "date": "12-04-2025",
  "net_weight": "5.2 MT"
}
\`\`\`
**Important:** The number must not contain any commas, spaces, or extra characters (e.g., use \`"1240.5"\` not \`"1,240.5"\` or \`"1240.5 kg."\`).
`;

type ExtractDataFORComparJsonType = {
  vehicle_number: string;
  date: string;
  net_weight: string;
};
export const ExtractDataFORCompar = async (
  filePart: any,
  maxRetries = 3
): Promise<ExtractDataFORComparJsonType> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: Compare_PROMPT }, filePart],
          },
        ],
      });

      const jsonText = await result.response.text();
      const jsonString = jsonText.replace(/^```json\s*|\s*```$/g, "");
      console.log(`Extracted JSON (attempt ${attempt + 1}):`, jsonString);

      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;

      // Optional: wait before retrying
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
  throw new Error("Failed to extract data from image after multiple attempts.");
};

export async function UpdateOCRData(id: number, data: Partial<ocr>) {
  try {
    return await prisma.ocr.update({
      where: { id },
      data,
    });
  } catch (error) {
    return Error("error");
  }
}

export async function getAllOcr() {
  return await prisma.ocr.findMany({
    take: 10,
    orderBy: {
      created_at: "desc",
    },
    include: {
      company: true
    }
  });
}

export async function getAllOcr_all() {
  return await prisma.ocr.findMany({

    orderBy: {
      created_at: "desc",
    },
    include: {
      company: true
    }
  });
}
export async function getOcr(id: number) {
  return await prisma.ocr.findUnique({
    where: {
      id,
    },
    include: {
      company: true,

    },
  });
}

export async function getOcrWithImage(id: number) {
  return await prisma.ocr.findUnique({
    where: {
      id,
    },
    include: {
      medias: true

    },
  });
}
export async function ocrCount(companyID: number) {
  return await prisma.ocr.count({
    where: {
      company: {
        id: companyID,
      },
    },
  });
}

const EXtractPrompt = `
I have multiple PDF files. Each one contains a Delivery Challan.

Please extract only the Challan Number from each PDF. The challan number may appear as:

"Challan No"

"Challan Number"

"Delivery Challan No"

"DC No"

or similar variations.

Return the result in this JSON format:


[
  {
    "file_name": "example1.pdf",
    "challan_number": "DC-00123"
  },
  {
    "file_name": "example2.pdf",
    "challan_number": "CH-45678"
  }
]
If a challan number is not found in a file, set "challan_number" to null.

`;

export async function getChallanNumber(filePart: any[], maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: EXtractPrompt }, ...filePart],
          },
        ],
      });

      const jsonText = await result.response.text();
      const jsonString = jsonText.replace(/^```json\s*|\s*```$/g, "");
      console.log(`Extracted JSON (attempt ${attempt + 1}):`, jsonString);

      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;

      // Optional: wait before retrying
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
  throw new Error("Failed to extract data from image after multiple attempts.");
}

const sPrompt = `
You are given **two separate PDFs**:

* One containing **Challan/Invoice details**
* One containing **E-Way Bill details**

Your task is to extract the following:

* From the **Challan PDF**:

  * \`challan_number\`
  * \`challan_date\`
* From the **E-Way Bill PDF**:
>
  * \`eway_bill_number\`
  * \`eway_bill_date\`
>

**Instructions:**
>
* Return a **single merged JSON object** with these fields.
* If a field is not found, return \`"Not Found"\`.
* Format all dates as \`DD-MM-YYYY\`.
* 
* 
* # E-Way Bill Number**

* A **12-digit numeric** value.
* Commonly labeled as:

  * \`eWay Bill No: \`
  * \`E-Way Bill No: \`
  * May also appear near **"Generated Date"** or **"Generated By"**.

* # Challan No or Invoice No**

* Can be **alphanumeric**.
* Possible labels include:

  * \`Challan No: \`, \`Challan Number: \`
  * \`Invoice No: \`, \`Invoice Number: \`
  * \`Document No.\`, \`Document Number\`

# **Generated Date**

* Date format: \`DD / MM / YYYY\` or \`DD - MM - YYYY\`
* Often found near the **E-Way Bill Number** or **"Generated By"** label.

>
**Output Example:**
>
\`\`\`json
{
  "challan_number": "INV-00123",
  "challan_date": "03-05-2025",
  "eway_bill_number": "EW123456789",
  "eway_bill_date": "04-05-2025"
}
  \`\`\`
`;
type MsiData = {
  challan_number: string;
  challan_date: string;
  eway_bill_number: string;
  eway_bill_date: string;
};
export async function extractData_msi(
  filePart: any[],
  maxRetries = 3
): Promise<MsiData> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: sPrompt }, ...filePart],
          },
        ],
      });

      const jsonText = await result.response.text();
      const jsonString = jsonText.replace(/^```json\s*|\s*```$/g, "");
      console.log(`Extracted JSON (attempt ${attempt + 1}):`, jsonString);

      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;

      // Optional: wait before retrying
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
  throw new Error("Failed to extract data from image after multiple attempts.");
}

const slipPrompt = `
Extract the following data from this image of a logistics or delivery document. If a field is not present, return "Not found". Use OCR and return results in structured JSON format.

Fields to extract:

* Truck Number (\`truck_no\`)
* CHL Delivery Order Number (\`chl_del_ord_no\`)
* Supplier Name (\`supplier_name\`)
* Date In (\`date_in\`)
* Date Out (\`date_out\`)
* Time In (\`time_in\`)
* Time Out (\`time_out\`)
* Gross Weight (\`gross_weight\`)
* Tare Weight (\`tare_weight\`)
* Net Weight (\`net_weight\`)

**Return format (JSON):**

\`\`\`json
{
  "truck_no": "",
  "chl_del_ord_no": "",
  "supplier_name": "",
  "date_in": "",
  "date_out": "",
  "time_in": "",
  "time_out": "",
  "gross_weight": "",
  "tare_weight": "",
  "net_weight": ""
}
\`\`\`


`;
export type slipType = {
  truck_no: string;
  chl_del_ord_no: string;
  supplier_name: string;
  date_in: string;
  date_out: string;
  time_in: string;
  time_out: string;
  gross_weight: string;
  tare_weight: string;
  net_weight: string;
};
export async function extractData_slipData(
  filePart: any,
  maxRetries = 3
): Promise<slipType> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: slipPrompt }, filePart],
          },
        ],
      });

      const jsonText = await result.response.text();
      const jsonString = jsonText.replace(/^```json\s*|\s*```$/g, "");
      console.log(`Extracted JSON (attempt ${attempt + 1}):`, jsonString);

      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;

      // Optional: wait before retrying
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
  throw new Error("Failed to extract data from image after multiple attempts.");
}

export async function deleteOcr(id: number | undefined) {
  if (typeof id !== "number" || isNaN(id)) {
    throw new Error("A valid id must be provided.");
  }

  const existing = await prisma.ocr.findUnique({ where: { id } });

  if (!existing) {
    throw new Error(`Record with id ${id} does not exist.`);
  }

  return await prisma.ocr.delete({ where: { id } });
}

const PROMPT_All_WIGHT = `



**Image Data Extraction Prompt**

You are given three images.

Extract the following properties:

* **gross_weight** (Int)
* **tare_weight** (Int)
* **net_weight** (Int)
* **vehicle_number** (String)
* **address** (String)
* **map_url** (Google Maps URL)
* **latitude** (float)
* **longitude** (float)
* **date** (DateTime)

If a field is not found in the image, set its value to \`null\`.

**Return only JSON in the following format:**

\`\`\`json
{
  "gross_weight": 1500,
  "tare_weight": 500,
  "net_weight": 1000,
  "vehicle_number": "RJ-20GC-4556",
  "address": "1234 Main St, Cityville, Country",
  "map_url": "https://maps.google.com/?q=12.345678,-98.765432",
  "latitude": 12.34567,
  "longitude": -98.76543,
  "date": "2025-04-25T15:30:00Z"
}
\`\`\`

Example when some fields are missing:

\`\`\`json
{
  "gross_weight": null,
  "tare_weight": null,
  "net_weight": null,
  "vehicle_number": null,
  "address": null,
  "map_url": null,
  "latitude": null,
  "longitude": null,
  "date": null
}
\`\`\`

Return only JSON.
`;

export async function extractData_AllWight(
  filePart: any,
  maxRetries = 3
): Promise<{
  gross_weight: null | number;
  tare_weight: null | number;
  net_weight: null | number;
  vehicle_number: null | string;
  address: null | string;
  map_url: null | string;
  latitude: null | number;
  longitude: null | number;
  date: null | string;
}> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: PROMPT_All_WIGHT }, filePart],
          },
        ],
      });

      const jsonText = await result.response.text();
      const jsonString = jsonText.replace(/^```json\s*|\s*```$/g, "");
      console.log(`Extracted JSON (attempt ${attempt + 1}):`, jsonString);

      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;

      // Optional: wait before retrying
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
  throw new Error("Failed to extract data from image after multiple attempts.");
}

export async function addMedia(title: string, content: File, ocrId: number) {
  const headerList = await headers();

  await prisma.audit.create({
    data: {
      ip: headerList.get("x-forwarded-for") ?? "0.0.0.0",
      message: `${title} - File upload`,
    },
  });
  const b = Buffer.from(await content.arrayBuffer()).toString("base64");
  return prisma.media.create({
    data: {
      title,
      content: b,
      type: content.type,
      ocr: {
        connect: {
          id: ocrId,
        },
      },
    },
  });
}

export async function getOcrByCompany(companyId?: number) {
  const where = companyId ? { companyDetailId: companyId } : {};

  return await prisma.ocr.findMany({
    where,
    include: {
      company: true,
      vendor: true,
      medias: true,
    },
    orderBy: { created_at: "desc" },
  });
}
export async function getCompanies() {
  return await prisma.companyDetail.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

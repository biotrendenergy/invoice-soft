import { getDebitNote } from "@/action/note";
import "./style.css";
import { format } from "date-fns";
import { ToWords } from "to-words";
import { getStateCode } from "@/utility/getStateCode";
import EditButton from "../../_components/editButton";
import PrintButton from "../../_components/printButton";
interface pageProps {
  params: Promise<{
    id: string;
  }>;
}
const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      name: "Rupee",
      plural: "Rupees",
      symbol: "₹",
      fractionalUnit: {
        name: "Paisa",
        plural: "Paise",
        symbol: "",
      },
    },
  },
});
const page = async ({ params }: pageProps) => {
  const { id } = await params;
  const data = await getDebitNote(Number(id));
  if (!data) {
    return "Null";
  }
  const amount_with_out_tex =
    data.amount - (data.amount / data.sgst + data.amount / data.cgst);
  return (
    <div>
      <div className="bts">
        <EditButton />
        <PrintButton />
      </div>
      <div className="ritz grid-container" dir="ltr">
        <table className="waffle" cellSpacing={0} cellPadding={0}>
          <thead>
            <tr>
              <th className="row-header freezebar-origin-ltr" />
              <th
                id="0C0"
                style={{ width: 100 }}
                className="column-headers-background"
              />
              <th
                id="0C1"
                style={{ width: 100 }}
                className="column-headers-background"
              />
              <th
                id="0C2"
                style={{ width: 100 }}
                className="column-headers-background"
              />
              <th
                id="0C3"
                style={{ width: 100 }}
                className="column-headers-background"
              />
              <th
                id="0C4"
                style={{ width: 100 }}
                className="column-headers-background"
              />
              <th
                id="0C5"
                style={{ width: 100 }}
                className="column-headers-background"
              />
              <th
                id="0C6"
                style={{ width: 100 }}
                className="column-headers-background"
              />
              <th
                id="0C7"
                style={{ width: 100 }}
                className="column-headers-background"
              />
              <th
                id="0C8"
                style={{ width: 100 }}
                className="column-headers-background"
              />
              <th
                id="0C9"
                style={{ width: 100 }}
                className="column-headers-background"
              />
              <th
                id="0C10"
                style={{ width: 100 }}
                className="column-headers-background"
              />
              <th
                id="0C11"
                style={{ width: 100 }}
                className="column-headers-background"
              />
              <th
                id="0C12"
                style={{ width: 100 }}
                className="column-headers-background"
              />
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: 20 }}>
              <th
                id="0R0"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td />
              <td />
              <td />
              <td />
              <td />
              <td />
              <td />
              <td />
              <td />
              <td />
              <td />
              <td />
              <td />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R1"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td />
              <td className="s0" dir="ltr" colSpan={12} rowSpan={2}>
                Debit Note
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R2"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R3"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" dir="ltr" colSpan={6}>
                Bio Trend Energy (Opc) Pvt Ltd
              </td>
              <td className="s3" dir="ltr" colSpan={3}>
                Debit Note No.
              </td>
              <td className="s2" dir="ltr" colSpan={3}>
                Dated
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R4"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" dir="ltr" colSpan={6}>
                C-55/4 Okhla Phase-II
              </td>
              <td className="s4" dir="ltr" colSpan={3}>
                {data.id}
              </td>
              <td className="s5" dir="ltr" colSpan={3}>
                {format(data?.createAt, "d-MMM-yy")}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R5"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" dir="ltr" colSpan={6}>
                Okhla Industriaol Area
              </td>
              <td className="s6" colSpan={3} />
              <td className="s2" colSpan={3} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R6"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" dir="ltr" colSpan={6}>
                New Delhi
              </td>
              <td className="s7" colSpan={3} />
              <td className="s5" colSpan={3} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R7"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s8" dir="ltr" colSpan={3}>
                GSTIN/UIN
              </td>
              <td className="s2" dir="ltr" colSpan={3}>
                07AAJCB9063A1ZT
              </td>
              <td className="s9" dir="ltr" colSpan={3} rowSpan={2}>
                Reference of challan No.
              </td>
              <td className="s9 s5" dir="ltr" colSpan={3} rowSpan={2}>
                {data.reference_challan}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R8"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s10" dir="ltr" colSpan={3}>
                State Name
              </td>
              <td className="s5" dir="ltr" colSpan={3}>
                Delhi, Code 07
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R9"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" dir="ltr" colSpan={6}>
                Consignee (Ship to)
              </td>
              <td className="s9" dir="ltr" colSpan={3} rowSpan={2}>
                Party challan No
              </td>
              <td className="s9 s5" colSpan={3} rowSpan={2}>
                {data.party_challan}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R10"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" dir="ltr" colSpan={6}>
                {data.shipTo.name}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R11"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" colSpan={6} />
              <td className="s9" dir="ltr" colSpan={3} rowSpan={2}>
                BTE Challan No
              </td>
              <td className="s9 s5" colSpan={3} rowSpan={2}>
                {data.bte_challan}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R12"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s8" dir="ltr" colSpan={3}>
                GSTIN/UIN
              </td>
              <td className="s2" dir="ltr" colSpan={3}>
                {data.shipTo.billing_gstNo}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R13"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s8" dir="ltr" colSpan={3}>
                State Name
              </td>
              <td className="s2" dir="ltr" colSpan={3}>
                {data.shipTo.billingState}, Code{" "}
                {getStateCode(data.shipTo.billingState as any)}
              </td>
              <td className="s9" dir="ltr" colSpan={3} rowSpan={2}>
                Vendar challan No
              </td>
              <td className="s5" colSpan={3} rowSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R14"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s5" colSpan={6} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R15"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" dir="ltr" colSpan={6}>
                Buyer (Bill to)
              </td>
              <td />
              <td />
              <td />
              <td />
              <td />
              <td className="s2" />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R16"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" dir="ltr" colSpan={6}>
                {data.billTo.name}
              </td>
              <td />
              <td />
              <td />
              <td />
              <td />
              <td className="s2" />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R17"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" colSpan={6} />
              <td />
              <td />
              <td />
              <td />
              <td />
              <td className="s2" />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R18"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s8" dir="ltr" colSpan={3}>
                GSTIN/UIN
              </td>
              <td className="s2" dir="ltr" colSpan={3}>
                07AAJCB9063A1ZT
              </td>
              <td />
              <td />
              <td />
              <td />
              <td />
              <td className="s2" />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R19"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s8" dir="ltr" colSpan={3}>
                State Name
              </td>
              <td className="s2" dir="ltr" colSpan={3}>
                Delhi, Code 07
              </td>
              <td />
              <td />
              <td />
              <td />
              <td />
              <td className="s2" />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R20"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s5" colSpan={6} />
              <td className="s7" />
              <td className="s7" />
              <td className="s7" />
              <td className="s7" />
              <td className="s7" />
              <td className="s5" />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R21"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s11" dir="ltr" rowSpan={2}>
                Sl No.
              </td>
              <td className="s11" dir="ltr" colSpan={5} rowSpan={2}>
                Description of Goods
              </td>
              <td className="s11" dir="ltr" rowSpan={2}>
                HSN
              </td>
              <td className="s11" dir="ltr" rowSpan={2}>
                Quantity
              </td>
              <td className="s11" dir="ltr" rowSpan={2}>
                Rate
              </td>
              <td className="s11" dir="ltr" rowSpan={2}>
                per
              </td>
              <td className="s11" dir="ltr" colSpan={2} rowSpan={2}>
                Amount
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R22"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R23"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s12" dir="ltr">
                1
              </td>
              <td className="s2" dir="ltr" colSpan={5}>
                BIOMASS PELLETS (in KGS)
              </td>
              <td className="s13" dir="ltr">
                440110
              </td>
              <td className="s13" dir="ltr">
                {data.quntity} KGS
              </td>
              <td className="s13" dir="ltr">
                {data.rate}
              </td>
              <td className="s13" dir="ltr">
                KG
              </td>
              <td className="s12" dir="ltr" colSpan={2}>
                {data.amount}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R24"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R25"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s12" dir="ltr" colSpan={5}>
                SGST @{data.sgst}%
              </td>
              <td className="s2" />
              <td className="s1" />
              <td className="s12" dir="ltr">
                {data.sgst}
              </td>
              <td className="s2" dir="ltr">
                %
              </td>
              <td className="s12" dir="ltr" colSpan={2}>
                {data.amount * (data.sgst / 100)}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R26"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s12" dir="ltr" colSpan={5}>
                CGST @{data.cgst}%
              </td>
              <td className="s2" />
              <td className="s1" />
              <td className="s12" dir="ltr">
                {data.cgst}
              </td>
              <td className="s2" dir="ltr">
                %
              </td>
              <td className="s12" dir="ltr" colSpan={2}>
                {data.amount * (data.cgst / 100)}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R27"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s12" dir="ltr" colSpan={5}>
                {data.isIgst == true && `IGST @${data.igst}%`}
              </td>
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s12" dir="ltr" colSpan={2}>
                {data.amount * (data.igst / 100)}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R28"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s12" dir="ltr" colSpan={5}>
                Round Off
              </td>
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s12" colSpan={2}>
                {data.amount * (data.cgst / 100) +
                  data.amount * (data.igst / 100) +
                  data.amount * (data.sgst / 100) -
                  Math.floor(
                    data.amount * (data.sgst / 100) +
                      data.amount * (data.igst / 100) +
                      data.amount * (data.cgst / 100)
                  )}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R29"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R30"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R31"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R32"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R33"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R34"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R35"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R36"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R37"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R38"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R39"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R40"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R41"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" />
              <td className="s2" colSpan={5} />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" />
              <td className="s2" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R42"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s5" />
              <td className="s5" colSpan={5} />
              <td className="s5" />
              <td className="s5" />
              <td className="s5" />
              <td className="s5" />
              <td className="s5" colSpan={2} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R43"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s5" />
              <td className="s14" dir="ltr" colSpan={5}>
                Total
              </td>
              <td className="s5" />
              <td className="s5" dir="ltr">
                {data.quntity} KGS
              </td>
              <td className="s5" />
              <td className="s5" />
              <td className="s14" dir="ltr" colSpan={2}>
                {Math.floor(
                  data.isIgst
                    ? data.amount * (data.igst / 100) +
                        data.amount +
                        data.amount * (data.sgst / 100) +
                        data.amount * (data.cgst / 100)
                    : data.amount +
                        data.amount * (data.sgst / 100) +
                        data.amount * (data.cgst / 100)
                )}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R44"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s8" dir="ltr" colSpan={5}>
                Amount Chargeable (in words)
              </td>
              <td className="s15" dir="ltr" colSpan={7} rowSpan={3}>
                E &amp; O E
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R45"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s8" dir="ltr" colSpan={5}>
                {toWords.convert(
                  Math.floor(
                    data.isIgst
                      ? data.amount * (data.igst / 100) +
                          data.amount +
                          data.amount * (data.sgst / 100) +
                          data.amount * (data.cgst / 100)
                      : data.amount +
                          data.amount * (data.sgst / 100) +
                          data.amount * (data.cgst / 100)
                  )
                )}
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R46"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s8" colSpan={5} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R47"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" colSpan={5} />
              <td className="s12" dir="ltr" colSpan={7}>
                for Bio Trend Energy (Opc) Pvt Ltd
              </td>
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R48"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s2" colSpan={5} />
              <td className="s12" colSpan={7} />
            </tr>
            <tr style={{ height: 20 }}>
              <th
                id="0R49"
                style={{ height: 20 }}
                className="row-headers-background"
              >
                <div
                  className="row-header-wrapper"
                  style={{ lineHeight: 20 }}
                />
              </th>
              <td className="s1" />
              <td className="s5" colSpan={5} />
              <td className="s14" dir="ltr" colSpan={7}>
                Authorised Signatory
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default page;

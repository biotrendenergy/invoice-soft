import { getOcr } from "@/action/ocr";
import "./style.css";
import { getStateCode } from "@/utility/getStateCode";
import EditButton from "../../../_components/editButton";
import PrintButton from "../../../_components/printButton";
import { format } from "date-fns";
interface pageProps {
  params: Promise<{
    id: string;
  }>;
}
const page = async ({ params }: pageProps) => {
  const { id } = await params;
  const data = await getOcr(Number(id));
  if (!data) return "challan not found";
  // console.log(data);

  return (
    <div>
      <div className="bts">
        <EditButton />
        <PrintButton />
      </div>
      <>
        <div className="ritz grid-container" dir="ltr">
          <table className="waffle" cellSpacing={0} cellPadding={0}>
            <thead>
              <tr>
                <th className="row-header freezebar-origin-ltr" />
                <th
                  id="0C0"
                  style={{ width: 36 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C1"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C2"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C3"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C4"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C5"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C6"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C7"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C8"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C9"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C10"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C11"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C12"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
                <th
                  id="0C13"
                  style={{ width: 100 }}
                  className="column-headers-background"
                ></th>
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
                  ></div>
                </th>
                <td className="s0" dir="ltr" colSpan={12} rowSpan={3}>
                  DELIVERY CHALLAN
                </td>
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
                  ></div>
                </th>
                <td />
                <td />
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
                  ></div>
                </th>
                <td />
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
                  ></div>
                </th>
                <td className="s1 lef" dir="ltr" colSpan={6}>
                  <strong> Bio Trend Energy (OPC) Pvt Ltd,</strong> <br />
                  <br />
                  Ground Floor C-55/4, Okhla Industrial Area,
                  <br /> Phase-2, Delhi South Delhi, Delhi, 110020
                  <br /> Gst No. -07AAJCB9063A1ZT
                  <br />
                  <br />
                  <br />
                  <br />
                  <br />
                  <br />
                  <br />
                  <strong>
                    BILL TO
                    <br />
                    NTPC LTD <br />
                    {data.company?.shippingAddress
                      .split(" ")
                      .slice(0, 5)
                      .join(" ")}
                  </strong>
                  <br />
                  {data.company?.shippingAddress.split(" ").slice(5).join(" ")}
                  <br />
                  GST No. – {data.company?.shipping_gstNo}
                </td>
                <td
                  className="s2"
                  colSpan={6}
                  rowSpan={5}
                  style={{
                    position: "relative",
                  }}
                >
                  <div
                    id="embed_527324326"
                    className="waffle-embedded-object-overlay"
                    style={{
                      width: 443,
                      height: 223,
                      display: "block",
                      position: "absolute",
                      right: -91,
                      top: 0,
                    }}
                  >
                    <img
                      src="https://lh7-rt.googleusercontent.com/sheetsz/AHOq17GPjAOcPivMSuiSoQ0F_5QCCUw6l0IO6oERWwPaVl5YiQFGZfYa3rUlsEhA6AsCGDjc9_5612J3IhsbQWEYzO1N_-hUJ1LfNuHEc1R6Bp-llvEq8pBGaGGDdBbmcG_ij1EyyIOy?key=QJ0OJmX1keXQCLOUEnnY7g"
                      style={{ display: "block" }}
                      height={223}
                      width={443}
                    />
                  </div>
                </td>
                <td />
                <td />
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
                  ></div>
                </th>
                <td className="s3 lef" colSpan={6}>
                  <br />
                  <br />
                  <strong>
                    SHIPPED TO
                    <br />
                    NTPC LTD <br />
                    {data.company?.shippingAddress
                      .split(" ")
                      .slice(0, 5)
                      .join(" ")}
                  </strong>
                  <br />
                  {data.company?.shippingAddress.split(" ").slice(5).join(" ")}
                  <br />
                  GST No. – {data.company?.shipping_gstNo}
                </td>
                <td />
                <td />
              </tr>
              {/* <tr style={{ height: 20 }}>
                <th
                  id="0R5"
                  style={{ height: 20 }}
                  className="row-headers-background"
                >
                  <div
                    className="row-header-wrapper"
                    style={{ lineHeight: 20 }}
                  ></div>
                </th>
                <td className="s3 lef" dir="ltr" colSpan={6}></td>
                <td />
                <td />
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
                  ></div>
                </th>
                <td className="s3 lef" dir="ltr" colSpan={6}></td>
                <td />
                <td />
              </tr> */}
              {/* <tr style={{ height: 20 }}>
                <th
                  id="0R7"
                  style={{ height: 20 }}
                  className="row-headers-background"
                >
                  <div
                    className="row-header-wrapper"
                    style={{ lineHeight: 20 }}
                  ></div>
                </th>
                <td className="s3 lef" dir="ltr" colSpan={6}></td>
                <td />
                <td />
              </tr> */}
              {/* <tr style={{ height: 20 }}>
                <th
                  id="0R8"
                  style={{ height: 20 }}
                  className="row-headers-background"
                >
                  <div
                    className="row-header-wrapper"
                    style={{ lineHeight: 20 }}
                  ></div>
                </th>
                <td className="s3 lef" colSpan={6} />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td className="s2" />
                <td />
                <td />
              </tr> */}
              {/* <tr style={{ height: 20 }}>
                <th
                  id="0R9"
                  style={{ height: 20 }}
                  className="row-headers-background"
                >
                  <div
                    className="row-header-wrapper"
                    style={{ lineHeight: 20 }}
                  ></div>
                </th>
                <td className="s1 lef" dir="ltr" colSpan={6}></td>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td className="s2" />
                <td />
                <td />
              </tr> */}
              {/* <tr style={{ height: 20 }}>
                <th
                  id="0R10"
                  style={{ height: 20 }}
                  className="row-headers-background"
                >
                  <div
                    className="row-header-wrapper"
                    style={{ lineHeight: 20 }}
                  ></div>
                </th>
                <td className="s1 lef" dir="ltr" colSpan={6}></td>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td className="s2" />
                <td />
                <td />
              </tr> */}
              {/* <tr style={{ height: 20 }}>
                <th
                  id="0R11"
                  style={{ height: 20 }}
                  className="row-headers-background"
                >
                  <div
                    className="row-header-wrapper"
                    style={{ lineHeight: 20 }}
                  ></div>
                </th>
                <td className="s1 lef" dir="ltr" colSpan={6}></td>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td className="s2" />
                <td />
                <td />
              </tr> */}
              {/* <tr style={{ height: 20 }}>
                <th
                  id="0R12"
                  style={{ height: 20 }}
                  className="row-headers-background"
                >
                  <div
                    className="row-header-wrapper"
                    style={{ lineHeight: 20 }}
                  ></div>
                </th>
                <td className="s3 lef" dir="ltr" colSpan={6}></td>
                <td />
                <td />
                <td />
                <td className="s4" dir="ltr" colSpan={3}></td>
                <td />
                <td />
              </tr> */}
              <tr style={{ height: 20 }}>
                <th
                  id="0R13"
                  style={{ height: 20 }}
                  className="row-headers-background"
                >
                  <div
                    className="row-header-wrapper"
                    style={{ lineHeight: 20 }}
                  ></div>
                </th>
                <td className="s3 lef" dir="ltr" colSpan={6}></td>
                <td />
                <td />
                <td />
                {/* <td className="s4" dir="ltr" colSpan={3}></td> */}
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s3 lef" />
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
                {/* <td className="s2" /> */}
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s3 lef" dir="ltr" colSpan={3}></td>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                {/* <td className="s2" /> */}
                {/* <td />
                <td /> */}
              </tr>
              <tr style={{ height: 20 }}>
                <th
                  id="0R16"
                  style={{ height: 20 }}
                  className="row-headers-background"
                ></th>
                <td
                  className="s3 lef"
                  style={{
                    verticalAlign: "top",
                  }}
                >
                  PO NO: {data.company?.PONumber}{" "}
                </td>
                <td className="s3" />
                <td className="s3" />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td className="s5" dir="ltr" colSpan={3}>
                  CHALLAN NO-{data.challan}
                  <br />
                  <br />
                  DATE {format(data.date, "dd/MM/yyyy")}
                  <br />
                  <br />
                  EWAY BILL NO. - {data.e_way_bill}
                </td>
                <td className="s2" />
                {/* <td />
                <td /> */}
              </tr>
              <tr style={{ height: 20 }}>
                <th
                  id="0R17"
                  // style={{ height: 20 }}
                  className="row-headers-background"
                ></th>
                <td className="s3 lef" dir="ltr" colSpan={3}></td>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td className="s2" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s3 lef" />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td className="s5" dir="ltr" colSpan={3}>
                  EWAY BILL DATE {format(data.e_way_bill_date, "dd/MM/yyyy")}
                </td>
                <td className="s2" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s3 lef" />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td className="s5" dir="ltr" colSpan={3}>
                  {" "}
                  Motor Vehicle No. {data.vehicle_number}
                </td>
                <td className="s2" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s6 lef" dir="ltr" />
                <td className="s7" />
                <td className="s7" />
                <td className="s7" />
                <td className="s7" />
                <td className="s7" />
                <td className="s7" />
                <td className="s7" />
                <td className="s7" />
                <td className="s7" />
                <td className="s7" />
                <td className="s8" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s9 lef" dir="ltr" rowSpan={3}>
                  Sl No
                </td>
                <td className="s10" dir="ltr" colSpan={5} rowSpan={3}>
                  DESCRIPTION
                </td>
                <td className="s10" dir="ltr" colSpan={2} rowSpan={3}>
                  HSN/SAC
                </td>
                <td className="s10" dir="ltr" colSpan={2} rowSpan={3}>
                  UOM
                </td>
                <td className="s10" dir="ltr" colSpan={2} rowSpan={3}>
                  QUANTITY
                </td>
                {/* <td className="s5" />
                <td className="s5" /> */}
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
                  ></div>
                </th>
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s4 lef" dir="ltr">
                  1
                </td>
                <td className="s4" dir="ltr" colSpan={5}>
                  BIOMASS PELLET{" "}
                </td>
                <td className="s4" dir="ltr" colSpan={2}>
                  440110
                </td>
                <td className="s4" dir="ltr" colSpan={2}>
                  KGS
                </td>
                <td className="s4" dir="ltr" colSpan={2}>
                  {data.net_weight.toLocaleString()}
                </td>
                <td className="s5" />
                <td className="s5" />
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
                  ></div>
                </th>
                <td className="s2 lef" />
                <td className="s5" />
                <td className="s5" />
                <td className="s5" />
                <td className="s5" />
                <td className="s4" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s2 lef" />
                <td className="s3" />
                <td />
                <td />
                <td />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s2 lef" />
                <td className="s3" />
                <td />
                <td />
                <td />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s2 lef" />
                <td className="s3" />
                <td />
                <td />
                <td />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s2 lef" />
                <td className="s3" />
                <td />
                <td />
                <td />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s2 lef" />
                <td className="s3" />
                <td />
                <td />
                <td />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s2 lef" />
                <td className="s3" />
                <td />
                <td />
                <td />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s2 lef" />
                <td className="s3" />
                <td />
                <td />
                <td />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s2 lef" />
                <td className="s3" />
                <td />
                <td />
                <td />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                <td className="s3" />
                <td className="s2" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s8 lef" />
                <td className="s7" />
                <td className="s7" />
                <td className="s7" />
                <td className="s7" />
                <td className="s8" />
                <td className="s7" />
                <td className="s8" />
                <td className="s7" />
                <td className="s8" />
                <td className="s7" />
                <td className="s8" />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td className="s11" dir="ltr" colSpan={2}>
                  Total
                </td>
                <td className="s11" dir="ltr" colSpan={2}>
                  {data.net_weight.toLocaleString()}
                </td>
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td className="s12" />
                <td className="s12" />
                <td className="s12" />
                <td className="s12" />
                {/* <td />
                <td /> */}
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
                  ></div>
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
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s3" colSpan={3}>
                  Thank you for your business!
                </td>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                {/* <td />
                <td /> */}
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
                  ></div>
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
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s3" dir="ltr" colSpan={4}>
                  Company's PAN : AAJCB9063A
                </td>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td className="s3" dir="ltr" colSpan={4}>
                  Goods once sold will not be taken back
                </td>
                <td />
                <td />
                <td />
                <td />
                <td className="s5" dir="ltr" colSpan={4}>
                  For BIO TREND ENERGY (OPC) PRIVATE LIMITED
                </td>
                <td />
                <td />
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
                  ></div>
                </th>
                <td className="s3" dir="ltr" colSpan={4}>
                  Subject to Delhi Jurisdiction
                </td>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                {/* <td />
                <td /> */}
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
                  ></div>
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
                {/* <td />
                <td /> */}
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
                  ></div>
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
                {/* <td />
                <td /> */}
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
                  ></div>
                </th>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td
                  style={{
                    position: "relative",
                  }}
                  className="s5"
                  dir="ltr"
                  colSpan={4}
                >
                  {/* <img
                    src="/sign.png"
                    height={100}
                    style={{
                      position: "absolute",
                      top: -69,
                    }}
                  /> */}
                  Authorized Signatory
                </td>
                {/* <td />
                <td /> */}
              </tr>
            </tbody>
          </table>
        </div>
      </>
    </div>
  );
};

export default page;

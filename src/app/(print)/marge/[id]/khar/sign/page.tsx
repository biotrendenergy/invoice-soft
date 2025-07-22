import Data from "@/app/(print)/data/[id]/khar/sign/page";
import Challan from "@/app/(print)/challan/[id]/khar/sign/page";
import { getOcrWithImage } from "@/action/ocr";

import PdfViewer from "../../_components/pdf";
interface pageProps {
  params: Promise<{
    id: string;
  }>;
}
const page = async ({ params }: pageProps) => {
  const { id } = await params;
  const data = await getOcrWithImage(Number(id));

  return (
    <>
      <style>{`
    @page {
  size: A4; /* or size: 8.5in 11in; for US Letter */
  /* margin: 0.1in; */
  border: solid 1px #000;
}

    
    `}</style>
      <div
        style={{
          height: "100vh",
        }}
      >
        <Data params={params} />
      </div>
      <div
      // style={{
      //   display: "flex",
      //   justifyContent: "center",
      //   height: "max-content",
      // }}
      >
        <Challan params={params} />
      </div>
      <div
        style={{
          height: "100vh",
        }}
      >
        {data?.medias.map((v) => {
          if (v.title.toLowerCase().includes("e-way bill")) {
            return (
              <PdfViewer
                base64Pdf={`data:application/pdf;base64,${v.content}`}
                key={v.id}
              />
            );
          }
          return null;
        })}
      </div>
    </>
  );
};

export default page;

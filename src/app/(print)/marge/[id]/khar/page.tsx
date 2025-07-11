import Data from "@/app/(print)/data/[id]/khar/page";
import Challan from "@/app/(print)/challan/[id]/khar/page";
import { getOcrWithImage } from "@/action/ocr";

import PdfViewer from "../_components/pdf";
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
      <div
        style={{
          height: "100vh",
        }}
      >
        <Data params={params} />
      </div>
      <div>
        <Challan params={params} />
      </div>
      <div>
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

import Data from "@/app/(print)/data/[id]/page";
import Challan from "@/app/(print)/challan/[id]/page";
import { getOcrWithImage } from "@/action/ocr";

import PdfViewer from "./_components/pdf";
interface pageProps {
  params: Promise<{
    id: string;
  }>;
}
const page = async ({ params }: pageProps) => {
  const { id } = await params;
  const data = await getOcrWithImage(Number(id));
  console.log(data);

  return (
    <>
      <div
        style={{
          height: "100vh",
        }}
      >
        <Data params={params} />
      </div>
      <div
        style={{
          height: "100vh",
        }}
      >
        <Challan params={params} />
      </div>
      <div
        style={{
          height: "100vh",
        }}
      >
        {data?.medias.map((v) => {
          console.log(v.title);

          if (v.title.toLowerCase().includes("e-way bill")) {
            console.log("s");

            return <PdfViewer base64Pdf={v.content} key={v.id} />;
          }
        })}
      </div>
    </>
  );
};

export default page;

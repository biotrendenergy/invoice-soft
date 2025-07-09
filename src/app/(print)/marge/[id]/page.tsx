import Data from "@/app/(print)/data/[id]/page";
import Challan from "@/app/(print)/challan/[id]/page";
interface pageProps {
  params: Promise<{
    id: string;
  }>;
}
const page = ({ params }: pageProps) => {
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
    </>
  );
};

export default page;

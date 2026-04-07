import { PropsWithChildren } from "react";
import Header from "./_components/header";
import Sidebar from "./_components/sidebar";

const Layout = (props: PropsWithChildren) => {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #f0f9ff 60%, #f0fdf4 100%)" }}
    >
      {/* Floating background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #4ade80, #16a34a)", filter: "blur(80px)" }}
        />
        <div
          className="absolute -top-16 right-24 w-72 h-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #2dd4bf, #0891b2)", filter: "blur(60px)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #86efac, #4ade80)", filter: "blur(90px)" }}
        />
        <div
          className="absolute bottom-16 -left-16 w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #34d399, #059669)", filter: "blur(50px)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #bbf7d0, transparent)", filter: "blur(40px)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, #16a34a 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <Sidebar>
          <Header />
          <main className="p-4">{props.children}</main>
        </Sidebar>
      </div>
    </div>
  );
};

export default Layout;

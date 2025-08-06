import Link from "next/link";
import { PropsWithChildren } from "react";

const Sidebar = (props: PropsWithChildren) => {
  return (
    <div className="drawer lg:drawer-open">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content ">
        {/* Page content here */}

        {props.children}
      </div>
      <div className="drawer-side">
        <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-56 min-h-full text-black gap-3 uppercase text-lg bg-white">
          <li className="hover:bg-black/15">
            <Link href={"/dashboard"}>Home</Link>
          </li>
          <li className="hover:bg-black/15">
            <Link href={"/dashboard/image"}>Image</Link>
          </li>
          <li className="hover:bg-black/15">
            <Link href={"/dashboard/text"}>Text</Link>
          </li>

          <li className="hover:bg-black/15">
            <Link href={"/dashboard/compare"}>PDF Compare</Link>
          </li>
          <li className="hover:bg-black/15">
            <Link href={"/dashboard/mis"}>MIS</Link>
          </li>
          <li className="hover:bg-black/15">
            <Link href={"/dashboard/companys"}>companies</Link>
          </li>
          <li className="hover:bg-black/15">
            <Link href={"/dashboard/vendors"}>vendor</Link>
          </li>
          <li className="hover:bg-black/15">
            <Link href={"/dashboard/audit"}>audit</Link>
          </li>
          <li className="hover:bg-black/15">
            <Link href={"/dashboard/db"}>Data base</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

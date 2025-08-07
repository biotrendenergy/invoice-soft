"use client"; // Needed for usePathname to work in Next.js App Router

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

const Sidebar = (props: PropsWithChildren) => {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/image", label: "Image" },
    { href: "/dashboard/text", label: "Text" },
    { href: "/dashboard/compare", label: "PDF Compare" },
    { href: "/dashboard/mis", label: "MIS" },
    { href: "/dashboard/companys", label: "Companies" },
    { href: "/dashboard/vendors", label: "Vendor" },
    { href: "/dashboard/audit", label: "Audit" },
    { href: "/dashboard/db", label: "Data base" },
  ];

  return (
    <div className="drawer lg:drawer-open">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Page content here */}
        {props.children}
      </div>
      <div className="drawer-side">
        <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-56 min-h-full text-black gap-3 uppercase text-lg bg-white">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li
                key={item.href}
                className={`hover:bg-black/15 ${
                  isActive ? "bg-blue-100 text-blue-800 font-semibold" : ""
                }`}
              >
                <Link href={item.href}>{item.label}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

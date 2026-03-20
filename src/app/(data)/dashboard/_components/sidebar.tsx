"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useState } from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/dashboard/image",
    label: "Image",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/text",
    label: "Text",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/compare",
    label: "PDF Compare",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/mis",
    label: "MIS",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/companys",
    label: "Companies",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/vendors",
    label: "Vendor",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/audit",
    label: "Audit",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/db",
    label: "Database",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
];

const Sidebar = (props: PropsWithChildren) => {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingHref, setLoadingHref] = useState<string | null>(null);

  const handleNav = (href: string) => {
    if (href === pathname) return; // already on this page
    setLoadingHref(href);
    router.push(href);
    // Clear loader after navigation settles
    setTimeout(() => setLoadingHref(null), 800);
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main content + top loader bar */}
      <div className="drawer-content relative">
        {/* Top progress bar */}
        {loadingHref && (
          <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-green-100 overflow-hidden">
            <div className="h-full bg-green-500 animate-progress-bar" />
          </div>
        )}
        {props.children}
      </div>

      <div className="drawer-side z-40">
        <label htmlFor="dashboard-drawer" className="drawer-overlay" />

        {/* Sidebar container */}
        <div className="flex flex-col w-60 min-h-full bg-white border-r border-gray-200 shadow-sm">

          {/* Logo area */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 ring-1 ring-green-100">
              <Image
                src="/logo.jpeg"
                alt="BioTrend Energy"
                width={44}
                height={44}
                className="rounded-lg object-contain ring-1 ring-green-200 bg-white p-0.5"
              />
              <div>
                <p className="text-sm font-bold text-green-900 leading-tight">BioTrend Energy</p>
                <p className="text-[10px] text-green-600 font-medium">Management Portal</p>
              </div>
            </div>
          </div>

          {/* Nav label */}
          <div className="px-5 pt-5 pb-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Navigation
            </p>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 pb-4 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isLoading = loadingHref === item.href;

              return (
                <button
                  key={item.href}
                  onClick={() => handleNav(item.href)}
                  className="w-full text-left"
                >
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group cursor-pointer
                    ${isActive
                      ? "bg-green-500/10 text-green-700 ring-1 ring-green-200"
                      : isLoading
                        ? "bg-green-50 text-green-600"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    }`}
                  >
                    {/* Icon or spinner */}
                    <span className={`flex-shrink-0 transition-colors
                      ${isActive ? "text-green-600" : isLoading ? "text-green-500" : "text-gray-400 group-hover:text-gray-600"}`}>
                      {isLoading ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : item.icon}
                    </span>

                    {/* Label */}
                    <span className={`font-medium ${isActive ? "text-green-700" : isLoading ? "text-green-600" : ""}`}>
                      {item.label}
                    </span>

                    {/* Active dot OR loading pulse */}
                    {isActive && !isLoading && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                    {isLoading && (
                      <span className="ml-auto flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1 h-1 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-1 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-5 py-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">© 2026 BioTrend Energy Pvt Ltd.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

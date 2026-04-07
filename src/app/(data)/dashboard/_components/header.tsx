"use client";
import { logout } from "@/action/login";

const Header = () => {
  return (
    <div
      className="navbar border-b border-white/60 shadow-sm sticky top-0 z-30"
      style={{ background: "rgba(255,255,255,0.70)", backdropFilter: "blur(16px)" }}
    >
      <div className="navbar-start">
        <label htmlFor="dashboard-drawer" className="drawer-button lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>
        <a className="btn btn-ghost text-xl text-green-900 font-bold hover:bg-green-50/60">
          <h1>Bio Trend Energy</h1>
        </a>
      </div>
      <div className="navbar-end">
        <button
          className="btn btn-green"
          onClick={async () => {
            await logout();
            window.location.href = "/auth/login";
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default Header;

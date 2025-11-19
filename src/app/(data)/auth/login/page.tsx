"use client";

import React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "@/action/login";
import { toast } from "sonner";
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormInputs = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur", // Validate on blur
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormInputs) => {
    loginUser(data.username, data.password).then((result) => {
      if (result instanceof Error) {
        // Handle error
        console.error(result.message);
        if (result.message === "User not found") {
          setError("username", {
            type: "manual",
            message: "User not found",
          });
        } else if (result.message === "Invalid password") {
          setError("password", {
            type: "manual",
            message: "Invalid password",
          });
        }
      } else {
        // Handle successful login
        console.log("Login successful", result);
        toast.success("Login successful");
        // Redirect or perform other actions as needed
        window.location.href = "/dashboard"; // Example redirect
      }
    });
  };

  return (
    <div className="relative min-h-screen bg-[#0d1117] flex items-center justify-center px-4 py-8">

      {/* ✅ TOP-LEFT FIXED LOGO */}
      <div className="absolute top-4 left-6 flex items-center gap-4 py-3 px-4 bg-[#161b22] border border-[#30363d] rounded-xl shadow-xl">
  <Image
    src="/logo.jpeg"
    alt="Company Logo"
    width={100}
    height={100}
    className="object-contain"
  />

        <div>
          <p className="text-lg font-semibold text-slate-100 tracking-tight">
            BioTrend Energy Pvt Ltd.
          </p>
          <p className="text-xs text-slate-400 -mt-1">
            Creating Sustainable Energy of tomorrow.
          </p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="w-full max-w-5xl bg-[#161b22] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-[#30363d]">

        {/* LEFT COMPANY INFO PANEL */}
        <div className="hidden md:flex md:flex-col md:w-2/5 bg-[#0d1117] border-r border-[#30363d] text-slate-200 p-8">

          <div className="space-y-6 text-sm mt-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                Registered Address
              </p>
              <p className="leading-snug text-slate-300">
                No. 244, First Floor, DLF South Court,
                <br />
                District Centre, Sector 6, Saket,
                <br />
                New Delhi, Delhi 110017
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                Contact
              </p>
              <p className="leading-snug text-slate-300">
                info@biotrendenergy.com
                <br />
                +91-7678578185
              </p>
            </div>
          </div>

          <div className="mt-auto pt-6 text-xs text-slate-600 border-t border-[#30363d]">
            <p>Authorized personnel access only.</p>
            <p className="mt-1">© {new Date().getFullYear()} BioTrend Energy Pvt Ltd.</p>
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="w-full md:w-3/5 px-8 py-12 md:px-10 bg-[#161b22]">
          <h1 className="text-2xl font-semibold text-slate-100 mb-3">Sign in</h1>
          <p className="text-sm text-slate-400 mb-8">
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Username
              </label>
              <input
                {...register("username")}
                className={`w-full rounded-lg bg-[#0d1117] border px-3 py-2.5 text-sm text-slate-100 outline-none 
                  ${
                    errors.username
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-[#30363d] focus:border-slate-300 focus:ring-slate-300"
                  }`}
                placeholder="username"
              />
              {errors.username && (
                <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className={`w-full rounded-lg bg-[#0d1117] border px-3 py-2.5 text-sm text-slate-100 outline-none 
                  ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-[#30363d] focus:border-slate-300 focus:ring-slate-300"
                  }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-slate-100 text-black font-semibold py-2.5 text-sm transition hover:bg-[#E86DB4] hover:text-white cursor-pointer"
            >
              Sign in
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

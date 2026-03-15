"use client";

import React, { useEffect, useRef } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { username: "", password: "" },
  });

  // Animated gradient blobs on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const blobs = [
      { x: 0.3, y: 0.3, r: 0.45, color: "rgba(134,239,172,0.45)" },  // green-300
      { x: 0.7, y: 0.6, r: 0.38, color: "rgba(74,222,128,0.3)" },    // green-400
      { x: 0.2, y: 0.75, r: 0.32, color: "rgba(187,247,208,0.35)" }, // green-200
      { x: 0.8, y: 0.2, r: 0.28, color: "rgba(34,197,94,0.2)" },     // green-500
    ];

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Base white background
      ctx.fillStyle = "#f0fdf4";
      ctx.fillRect(0, 0, w, h);

      // Draw animated blobs
      blobs.forEach((blob, i) => {
        const ox = Math.sin(t * 0.4 + i * 1.3) * 0.06;
        const oy = Math.cos(t * 0.3 + i * 0.9) * 0.05;
        const cx = (blob.x + ox) * w;
        const cy = (blob.y + oy) * h;
        const radius = blob.r * Math.min(w, h);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, "rgba(255,255,255,0)");

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Subtle grid pattern overlay
      ctx.strokeStyle = "rgba(134,239,172,0.15)";
      ctx.lineWidth = 0.5;
      const gap = 32;
      for (let x = 0; x < w; x += gap) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += gap) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      t += 0.012;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const onSubmit = (data: LoginFormInputs) => {
    loginUser(data.username, data.password).then((result) => {
      if (result instanceof Error) {
        if (result.message === "User not found") {
          setError("username", { type: "manual", message: "User not found" });
        } else if (result.message === "Invalid password") {
          setError("password", { type: "manual", message: "Invalid password" });
        }
      } else {
        toast.success("Login successful");
        window.location.href = "/dashboard";
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #f0f9ff 60%, #f0fdf4 100%)" }}
    >
      {/* Floating background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large green blob top-left */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #4ade80, #16a34a)", filter: "blur(80px)" }} />
        
        {/* Medium teal blob top-right */}
        <div className="absolute -top-16 right-24 w-72 h-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #2dd4bf, #0891b2)", filter: "blur(60px)" }} />

        {/* Large lime blob bottom-right */}
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #86efac, #4ade80)", filter: "blur(90px)" }} />

        {/* Small emerald blob bottom-left */}
        <div className="absolute bottom-16 -left-16 w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #34d399, #059669)", filter: "blur(50px)" }} />

        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #bbf7d0, transparent)", filter: "blur(40px)" }} />

        {/* Subtle dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(circle, #16a34a 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }} />
      </div>

      {/* MAIN CARD — add backdrop blur for glass effect */}
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/60 relative z-10"
        style={{ backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.85)" }}
      >
        {/* ── LEFT PANEL ── */}
        <div className="relative md:w-1/2 min-h-[340px] md:min-h-0 overflow-hidden flex flex-col justify-between p-10">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10 bg-white/60 rounded-2xl p-3 backdrop-blur-sm border border-green-100">
  <Image
  src="/logo.jpeg"
  alt="BioTrend Energy"
  width={110}
  height={110}
  className="rounded-2xl object-contain shadow-lg ring-2 ring-green-100 p-2 bg-white"
/>
  <div>
  <p className="text-xl font-bold text-green-900 leading-tight">BioTrend Energy Pvt. Ltd.</p>
  <p className="text-xs text-green-600 mt-0.5">Creating Sustainable Energy of Tomorrow.</p>
</div>
</div>

            <h2 className="text-2xl font-bold text-green-900 leading-snug mb-2">
              Creating Sustainable<br />Energy of Tomorrow.
            </h2>
            <p className="text-xs text-green-700 mb-8">Internal Management Portal</p>
            <div className="h-px w-12 bg-green-400 mb-6" />

            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest text-green-600 font-semibold mb-1">Registered Address</p>
              <p className="text-xs text-green-900 leading-relaxed">
                No. 244, First Floor, DLF South Court,<br />
                District Centre, Sector 6, Saket,<br />
                New Delhi, Delhi 110017
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-green-600 font-semibold mb-1">Contact</p>
              <p className="text-xs text-green-900 leading-relaxed">
                info@biotrendenergy.com<br />
                +91-7678578185
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-6">
            <p className="text-[10px] text-green-700">
              © {new Date().getFullYear()} BioTrend Energy Pvt Ltd. · Authorized access only.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="md:w-1/2 px-10 py-12 flex flex-col justify-center"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)" }}
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
            <p className="text-sm text-gray-500">Enter your credentials to access the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                {...register("username")}
                placeholder="Enter your username"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400
                  ${errors.username
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/50"
                    : "border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-white/80"
                  }`}
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">⚠ {errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400
                  ${errors.password
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/50"
                    : "border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-white/80"
                  }`}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">⚠ {errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-2 rounded-xl bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-semibold py-3 text-sm transition-all duration-150 shadow-md shadow-green-200 cursor-pointer"
            >
              Log in
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-8">Authorized personnel access only</p>
        </div>
      </div>
    </div>
  );
}

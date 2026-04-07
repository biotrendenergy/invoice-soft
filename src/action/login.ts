"use server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { verifyPassword } from "@/lib/passwrd";
import { cookies } from "next/headers";

export async function loginUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return new Error("User not found");
  }

  if (!(await verifyPassword(password, user.password))) {
    return new Error("Invalid password");
  }

  const cookie = await cookies();

  cookie.set("token", await signToken({ userId: user.id.toString(), role: user.role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return {
    message: "Login successful",
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
}

export async function logout() {
  const cookie = await cookies();
  cookie.delete("token");
  return { message: "Logout successful" };
}

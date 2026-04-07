"use server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/passwrd";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const verified = await verifyToken(token);
  if (!verified) return null;

  const user = await prisma.user.findUnique({
    where: { id: Number(verified.payload.userId) },
    select: { id: true, username: true, role: true },
  });

  return user;
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: { id: true, username: true, role: true },
    orderBy: { id: "asc" },
  });
}

export async function createUser(username: string, password: string, role: string) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error("Username already exists");

  const hashed = await hashPassword(password);
  return prisma.user.create({
    data: { username, password: hashed, role },
    select: { id: true, username: true, role: true },
  });
}

export async function updateUserRole(id: number, role: string) {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, username: true, role: true },
  });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}

export async function updateUserPassword(id: number, newPassword: string) {
  const hashed = await hashPassword(newPassword);
  return prisma.user.update({
    where: { id },
    data: { password: hashed },
    select: { id: true, username: true, role: true },
  });
}

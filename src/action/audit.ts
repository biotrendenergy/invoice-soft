"use server";
import { prisma } from "@/lib/db";
export async function getAuditLogs({
  search = "",
  from,
  to,
}: {
  search?: string;
  from?: string;
  to?: string;
}) {
  const audits = await prisma.audit.findMany({
    where: {
      AND: [
        {
          OR: [
            { message: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
          ],
        },
        from ? { createAt: { gte: new Date(from) } } : {},
        to ? { createAt: { lte: new Date(to) } } : {},
      ],
    },
    orderBy: { createAt: "desc" },
  });

  return audits;
}

"use server";
import { companyDetail, Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db";

export const AddCompany = async (data: Prisma.companyDetailCreateInput) => {
  try {
    const _data = await prisma.companyDetail.create({
      data,
    });
    return _data;
  } catch (e) {
    throw new Error("error when add company");
  }
};

export const updateCompany = async (
  id: number,
  data: Partial<companyDetail>
) => {
  try {
    const _data = await prisma.companyDetail.update({
      data,
      where: {
        id,
      },
    });
    return _data;
  } catch (e) {
    throw new Error("error when add company");
  }
};

export const deleteCompany = async (id: number) => {
  try {
    const _data = await prisma.companyDetail.delete({
      where: {
        id,
      },
    });
    return _data;
  } catch (e) {
    throw new Error("error when add company");
  }
};

export const getAllCompany = async () => {
  try {
    return await prisma.companyDetail.findMany({
      orderBy: {
        id: "asc",
      },
    });
  } catch (e) {
    throw new Error("error when add company");
  }
};

"use server";
import { vendorDetail, Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db";

export const AddVendor = async (data: Prisma.vendorDetailCreateInput) => {
  try {
    const _data = await prisma.vendorDetail.create({
      data,
    });
    return _data;
  } catch (e) {
    throw new Error("error when add Vendor");
  }
};

export const updateVendor = async (id: number, data: Partial<vendorDetail>) => {
  try {
    const _data = await prisma.vendorDetail.update({
      data,
      where: {
        id,
      },
    });
    return _data;
  } catch (e) {
    throw new Error("error when add Vendor");
  }
};

export const deleteVendor = async (id: number) => {
  try {
    const _data = await prisma.vendorDetail.delete({
      where: {
        id,
      },
    });
    return _data;
  } catch (e) {
    throw new Error("error when add Vendor");
  }
};

export const getAllVendor = async () => {
  try {
    return await prisma.vendorDetail.findMany({
      orderBy: {
        id: "asc",
      },
    });
  } catch (e) {
    throw new Error("error when add Vendor");
  }
};

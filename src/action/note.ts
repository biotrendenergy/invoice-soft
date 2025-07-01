"use server"
import { prisma } from "@/lib/db"
import { Prisma } from "@/generated/prisma"
export async function createDebitNote(data: Prisma.debitNoteCreateInput) {
    return prisma.debitNote.create({
        data,
        include: {
            shipTo: true,
            billTo: true,
        },
    });
}
export async function getDebitNote(id: number) {
    return prisma.debitNote.findUnique({
        where: {
            id
        },
        include: {
            shipTo: true,
            billTo: true
        }
    })
}
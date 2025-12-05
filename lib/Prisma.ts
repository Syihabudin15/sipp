import { PrismaClient } from "@prisma/client";
import moment from "moment";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

export async function generateRoleId() {
  const prefix = "RL-";
  const padLength = 2; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.role.count({});

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(lastRecord + 1).padStart(padLength, "0")}`;

  return newId;
}

export async function generateAreaId() {
  const prefix = "A-";
  const padLength = 2; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.area.count({});

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(lastRecord + 1).padStart(padLength, "0")}`;

  return newId;
}

export async function generateCabangId() {
  const prefix = "AC-";
  const padLength = 3; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.cabang.count({});

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(lastRecord + 1).padStart(padLength, "0")}`;

  return newId;
}

export async function generateUserId() {
  const prefix = "USR-";
  const padLength = 3; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.user.count({});

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(lastRecord + 1).padStart(padLength, "0")}`;

  return newId;
}

export async function generateUserNIP(cabangId: string) {
  const prefix = `${moment().year()}${moment().month()}`;
  const padLength = 3; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.user.count({});

  const cabang = await prisma.cabang.findFirst({ where: { id: cabangId } });
  // Format ulang dengan leading zero
  const newId = `${prefix}${
    cabang ? cabang.id.replace("-", "") : "AC01"
  }${String(lastRecord).padStart(padLength, "0")}`;

  return newId;
}

export async function generateSumdanId() {
  const prefix = "SMDN-";
  const padLength = 2; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.sumdan.count({});

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(lastRecord + 1).padStart(padLength, "0")}`;

  return newId;
}

export async function generateJenisId() {
  const prefix = "JPM-";
  const padLength = 2; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.jenisPembiayaan.count({});

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(lastRecord + 1).padStart(padLength, "0")}`;

  return newId;
}

export async function generateProdukId(sumdanId: string) {
  const find = await prisma.sumdan.findFirst({ where: { id: sumdanId } });
  const prefix = `${find ? find.code : "BPR"}-`;
  const padLength = 2; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.produkPembiayaan.count({
    where: { sumdanId: sumdanId },
  });

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(lastRecord + 1).padStart(padLength, "0")}`;

  return newId;
}

export async function generateDapemId() {
  const prefix = `SIPP-`;
  const padLength = 5; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.dapem.count({});

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(lastRecord + 1).padStart(padLength, "0")}`;

  return newId;
}

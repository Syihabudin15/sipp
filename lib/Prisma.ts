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
  const lastRecord = await prisma.role.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  let newNumber = 1;

  if (lastRecord && lastRecord.id) {
    // Ekstrak angka dari ID terakhir, contoh "PNM-000123" → 123
    const lastNumber = parseInt(lastRecord.id.replace(prefix, "")) || 0;
    newNumber = lastNumber + 1;
  }

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(newNumber).padStart(padLength, "0")}`;

  return newId;
}

export async function generateAreaId() {
  const prefix = "A-";
  const padLength = 2; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.area.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  let newNumber = 1;

  if (lastRecord && lastRecord.id) {
    // Ekstrak angka dari ID terakhir, contoh "PNM-000123" → 123
    const lastNumber = parseInt(lastRecord.id.replace(prefix, "")) || 0;
    newNumber = lastNumber + 1;
  }

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(newNumber).padStart(padLength, "0")}`;

  return newId;
}

export async function generateCabangId() {
  const prefix = "AC-";
  const padLength = 3; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.cabang.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  let newNumber = 1;

  if (lastRecord && lastRecord.id) {
    // Ekstrak angka dari ID terakhir, contoh "PNM-000123" → 123
    const lastNumber = parseInt(lastRecord.id.replace(prefix, "")) || 0;
    newNumber = lastNumber + 1;
  }

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(newNumber).padStart(padLength, "0")}`;

  return newId;
}

export async function generateUserId() {
  const prefix = "USR-";
  const padLength = 3; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.user.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  let newNumber = 1;

  if (lastRecord && lastRecord.id) {
    // Ekstrak angka dari ID terakhir, contoh "PNM-000123" → 123
    const lastNumber = parseInt(lastRecord.id.replace(prefix, "")) || 0;
    newNumber = lastNumber + 1;
  }

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(newNumber).padStart(padLength, "0")}`;

  return newId;
}

export async function generateUserNIP(cabangId: string) {
  const prefix = `${moment().year()}${moment().month()}`;
  const padLength = 3; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.user.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  let newNumber = 1;

  if (lastRecord && lastRecord.id) {
    // Ekstrak angka dari ID terakhir, contoh "PNM-000123" → 123
    const lastNumber = parseInt(lastRecord.id.replace(prefix, "")) || 0;
    newNumber = lastNumber + 1;
  }

  const cabang = await prisma.cabang.findFirst({ where: { id: cabangId } });
  // Format ulang dengan leading zero
  const newId = `${prefix}${
    cabang ? cabang.id.replace("-", "") : "AC01"
  }${String(newNumber).padStart(padLength, "0")}`;

  return newId;
}

export async function generateSumdanId() {
  const prefix = "SMDN-";
  const padLength = 2; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.sumdan.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  let newNumber = 1;

  if (lastRecord && lastRecord.id) {
    // Ekstrak angka dari ID terakhir, contoh "PNM-000123" → 123
    const lastNumber = parseInt(lastRecord.id.replace(prefix, "")) || 0;
    newNumber = lastNumber + 1;
  }

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(newNumber).padStart(padLength, "0")}`;

  return newId;
}

export async function generateJenisId() {
  const prefix = "JPM-";
  const padLength = 2; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.jenisPembiayaan.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  let newNumber = 1;

  if (lastRecord && lastRecord.id) {
    // Ekstrak angka dari ID terakhir, contoh "PNM-000123" → 123
    const lastNumber = parseInt(lastRecord.id.replace(prefix, "")) || 0;
    newNumber = lastNumber + 1;
  }

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(newNumber).padStart(padLength, "0")}`;

  return newId;
}

export async function generateProdukId(sumdanId: string) {
  const find = await prisma.sumdan.findFirst({ where: { id: sumdanId } });
  const prefix = `${find ? find.code : "BPR"}-`;
  const padLength = 2; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.produkPembiayaan.findFirst({
    where: { sumdanId: sumdanId },
    orderBy: { id: "desc" },
    select: { id: true },
  });

  let newNumber = 1;

  if (lastRecord && lastRecord.id) {
    // Ekstrak angka dari ID terakhir, contoh "PNM-000123" → 123
    const lastNumber = parseInt(lastRecord.id.replace(prefix, "")) || 0;
    newNumber = lastNumber + 1;
  }

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(newNumber).padStart(padLength, "0")}`;

  return newId;
}

export async function generateDapemId() {
  const prefix = `SIPP-`;
  const padLength = 5; // jumlah digit angka

  // Ambil record terakhir berdasarkan ID (urut desc)
  const lastRecord = await prisma.dapem.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  let newNumber = 1;

  if (lastRecord && lastRecord.id) {
    // Ekstrak angka dari ID terakhir, contoh "PNM-000123" → 123
    const lastNumber = parseInt(lastRecord.id.replace(prefix, "")) || 0;
    newNumber = lastNumber + 1;
  }

  // Format ulang dengan leading zero
  const newId = `${prefix}${String(newNumber).padStart(padLength, "0")}`;

  return newId;
}

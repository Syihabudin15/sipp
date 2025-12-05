import { IPenyerahanJaminan } from "@/components/IInterfaces";
import prisma from "@/lib/Prisma";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "50";
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const find = await prisma.sumdan.findMany({
    where: { status: true },
    include: {
      ProdukPembiayaan: {
        include: {
          Dapem: {
            where: {
              penyerahanJaminanId: null,
              status: true,
              status_final: "TRANSFER",
            },
            include: {
              ProdukPembiayaan: { include: { Sumdan: true } },
              JenisPembiayaan: true,
              Debitur: true,
              AO: true,
              CreatedBy: true,
            },
          },
        },
      },
    },
    skip: skip,
    take: parseInt(limit),
    orderBy: {
      created_at: "desc",
    },
  });
  const data = find.map((s) => ({
    ...s,
    Dapem: s.ProdukPembiayaan.flatMap((p) => p.Dapem),
  }));
  const total = await prisma.sumdan.count({
    where: { status: true },
  });

  return NextResponse.json({ data, total, status: 200 }, { status: 200 });
};

export const POST = async (req: NextRequest) => {
  const data: IPenyerahanJaminan = await req.json();
  try {
    const { Sumdan, Dapem, ...saved } = data;
    await prisma.$transaction(async (tx) => {
      const penyerahanJaminan = await tx.penyerahanJaminan.create({
        data: saved,
      });
      for (const dpm of Dapem) {
        await tx.dapem.update({
          where: { id: dpm.id },
          data: { penyerahanJaminanId: penyerahanJaminan.id },
        });
      }
    });

    return NextResponse.json(
      {
        msg: "Data SI Pencairan berhasil dicetak. mohon cek di menu List Pencairan",
        status: 201,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { msg: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
};

export const PATCH = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id") || "id";
  const count = await prisma.penyerahanJaminan.count({});
  const sumdan = await prisma.sumdan.findFirst({ where: { id } });
  if (!sumdan)
    return NextResponse.json(
      { msg: "Id tidak ditemukan!", status: 400 },
      { status: 400 }
    );

  const nomor = `TBO${String(count + 1).padStart(4, "0")}/${
    process.env.NEXT_PUBLIC_APP_SHORTNAME
  }-${sumdan.code.replace("BPR", "").replace(" ", "")}/${moment().format(
    "MMYYYY"
  )}`;

  return NextResponse.json({ nomor, status: 200 }, { status: 200 });
};

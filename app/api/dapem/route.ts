import prisma from "@/lib/Prisma";
import { EStatusFinal } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "50";
  const search = request.nextUrl.searchParams.get("search") || "";
  const status_final = request.nextUrl.searchParams.get("status_final") || "";
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const find = await prisma.dapem.findMany({
    where: {
      ...(search && {
        Debitur: {
          OR: [
            { nama_penerima: { contains: search } },
            { nopen: { contains: search } },
            { no_skep: { contains: search } },
          ],
        },
      }),
      ...(status_final && { status_final: status_final as EStatusFinal }),
      status: true,
    },
    skip: skip,
    take: parseInt(limit),
    orderBy: {
      created_at: "desc",
    },
    include: {
      Debitur: true,
      ProdukPembiayaan: true,
      JenisPembiayaan: true,
      CreatedBy: true,
      AO: {
        include: {
          Cabang: {
            include: {
              Area: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.dapem.count({
    where: {
      ...(search && {
        Debitur: {
          OR: [
            { nama_penerima: { contains: search } },
            { nopen: { contains: search } },
            { no_skep: { contains: search } },
          ],
        },
      }),
      ...(status_final && { status_final: status_final as EStatusFinal }),
      status: true,
    },
  });

  return NextResponse.json({ data: find, total, status: 200 }, { status: 200 });
};

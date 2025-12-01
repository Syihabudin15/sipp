import prisma from "@/lib/Prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "50";
  const search = request.nextUrl.searchParams.get("search") || "";
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const find = await prisma.debitur.findMany({
    where: {
      ...(search && {
        OR: [
          { nopen: { contains: search } },
          { nama_penerima: { contains: search } },
        ],
      }),
    },
    skip: skip,
    take: parseInt(limit),
  });

  const total = await prisma.debitur.count({
    where: {
      ...(search && {
        OR: [
          { nopen: { contains: search } },
          { nama_penerima: { contains: search } },
        ],
      }),
    },
  });

  return NextResponse.json({
    status: 200,
    data: find,
    total: total,
  });
};

export const PATCH = async (request: NextRequest) => {
  const nopen = request.nextUrl.searchParams.get("nopen");
  if (!nopen) {
    return NextResponse.json(
      { status: 400, msg: "Tidak ada nopen dalam parameter!" },
      { status: 400 }
    );
  }

  const find = await prisma.debitur.findFirst({ where: { nopen: nopen } });
  if (!find) {
    return NextResponse.json(
      { status: 404, msg: "Debitur dengan nopen tersebut tidak ditemukan!" },
      { status: 404 }
    );
  }
  return NextResponse.json(
    { status: 200, msg: "OK", data: find },
    { status: 200 }
  );
};

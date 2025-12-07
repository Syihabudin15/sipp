import { getSession } from "@/lib/Auth";
import prisma from "@/lib/Prisma";
import { create } from "domain";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "50";
  const search = request.nextUrl.searchParams.get("search") || "";
  const kelompok = request.nextUrl.searchParams.get("kelompok");
  const kantor_bayar = request.nextUrl.searchParams.get("kantor_bayar");
  const aktif = request.nextUrl.searchParams.get("aktif");
  const alamat = request.nextUrl.searchParams.get("alamat");
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const session = await getSession();
  if (!session)
    return NextResponse.json({ data: [], status: 200 }, { status: 200 });
  const user = await prisma.user.findFirst({ where: { id: session.user.id } });
  if (!user)
    return NextResponse.json({ data: [], status: 200 }, { status: 200 });

  const find = await prisma.debitur.findMany({
    where: {
      ...(search && {
        OR: [
          { nopen: { contains: search } },
          { nama_penerima: { contains: search } },
        ],
      }),
      ...(alamat && {
        OR: [
          { alm_peserta: { contains: alamat } },
          { kelurahan: { contains: alamat } },
          { kecamatan: { contains: alamat } },
          { kota: { contains: alamat } },
          { provinsi: { contains: alamat } },
        ],
      }),
      ...(kelompok && { kelompok_pensiun: kelompok }),
      ...(kantor_bayar && { kantor_bayar: { contains: kantor_bayar } }),
      ...(user.sumdanId && {
        Dapem: { some: { ProdukPembiayaan: { sumdanId: user.sumdanId } } },
      }),
      ...(aktif && { Dapem: { some: { status_final: { not: "GAGAL" } } } }),
    },
    skip: skip,
    take: parseInt(limit),
    include: {
      Dapem: {
        include: {
          ProdukPembiayaan: { include: { Sumdan: true } },
          JenisPembiayaan: true,
          AO: { include: { Cabang: { include: { Area: true } } } },
        },
      },
      Keluarga: true,
    },
    orderBy: {
      Dapem: {
        _count: "desc",
      },
    },
  });

  const total = await prisma.debitur.count({
    where: {
      ...(search && {
        OR: [
          { nopen: { contains: search } },
          { nama_penerima: { contains: search } },
        ],
      }),
      ...(alamat && {
        OR: [
          { alm_peserta: { contains: alamat } },
          { kelurahan: { contains: alamat } },
          { kecamatan: { contains: alamat } },
          { kota: { contains: alamat } },
          { provinsi: { contains: alamat } },
        ],
      }),
      ...(kelompok && { kelompok_pensiun: kelompok }),
      ...(kantor_bayar && { kantor_bayar: { contains: kantor_bayar } }),
      ...(user.sumdanId && {
        Dapem: { some: { ProdukPembiayaan: { sumdanId: user.sumdanId } } },
      }),
      ...(aktif && { Dapem: { some: { status_final: { not: "GAGAL" } } } }),
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

  const find = await prisma.debitur.findFirst({
    where: { nopen: nopen },
    include: { Keluarga: true },
  });
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

import { getSession } from "@/lib/Auth";
import prisma from "@/lib/Prisma";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "50";
  const search = request.nextUrl.searchParams.get("search");
  const sumdanId = request.nextUrl.searchParams.get("sumdanId");
  const status = request.nextUrl.searchParams.get("status");
  const backdate = request.nextUrl.searchParams.get("backdate");
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const session = await getSession();
  if (!session)
    return NextResponse.json({ data: [], status: 200 }, { status: 200 });
  const user = await prisma.user.findFirst({ where: { id: session.user.id } });
  if (!user)
    return NextResponse.json({ data: [], status: 200 }, { status: 200 });

  const find = await prisma.angsuran.findMany({
    where: {
      ...(search && {
        Dapem: {
          Debitur: {
            OR: [
              { nama_penerima: { contains: search } },
              { nopen: { contains: search } },
              { no_skep: { contains: search } },
              { nama_skep: { contains: search } },
            ],
          },
        },
      }),
      ...(status && status === "PAID" && { tgl_bayar: { not: null } }),
      ...(status && status === "UNPAID" && { tgl_bayar: null }),
      ...(sumdanId && { Dapem: { ProdukPembiayaan: { sumdanId: sumdanId } } }),
      ...(user.sumdanId && {
        Dapem: { ProdukPembiayaan: { sumdanId: user.sumdanId } },
      }),
      ...(backdate
        ? {
            jadwal_bayar: {
              gte: moment(backdate).startOf("month").toDate(),
              lte: moment(backdate).endOf("month").toDate(),
            },
          }
        : {
            jadwal_bayar: {
              gte: moment().startOf("month").toDate(),
              lte: moment().endOf("month").toDate(),
            },
          }),
    },
    skip: skip,
    take: parseInt(limit),
    orderBy: {
      jadwal_bayar: "asc",
    },
    include: {
      Dapem: {
        include: {
          Debitur: { include: { Keluarga: true } },
          ProdukPembiayaan: { include: { Sumdan: true } },
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
          PenyerahanBerkas: true,
          PenyerahanJaminan: true,
          Pelunasan: true,
          Angsuran: true,
        },
      },
    },
  });

  const total = await prisma.angsuran.count({
    where: {
      ...(search && {
        Dapem: {
          Debitur: {
            OR: [
              { nama_penerima: { contains: search } },
              { nopen: { contains: search } },
              { no_skep: { contains: search } },
              { nama_skep: { contains: search } },
            ],
          },
        },
      }),
      ...(status && status === "PAID" && { tgl_bayar: { not: null } }),
      ...(status && status === "UNPAID" && { tgl_bayar: null }),
      ...(sumdanId && { Dapem: { ProdukPembiayaan: { sumdanId: sumdanId } } }),
      ...(user.sumdanId && {
        Dapem: { ProdukPembiayaan: { sumdanId: user.sumdanId } },
      }),
      ...(backdate
        ? {
            jadwal_bayar: {
              gte: moment(backdate).startOf("month").toDate(),
              lte: moment(backdate).endOf("month").toDate(),
            },
          }
        : {
            jadwal_bayar: {
              gte: moment().startOf("month").toDate(),
              lte: moment().endOf("month").toDate(),
            },
          }),
    },
  });

  return NextResponse.json({ data: find, total, status: 200 }, { status: 200 });
};

export const POST = async (req: NextRequest) => {
  const month = req.nextUrl.searchParams.get("month");
  if (!month)
    return NextResponse.json(
      {
        msg: "Gagal update semua tagihan. Mohon pilih periode bulan!",
        status: 400,
      },
      { status: 400 }
    );

  try {
    await prisma.angsuran.updateMany({
      where: {
        jadwal_bayar: {
          gte: moment(month).startOf("month").toDate(),
          lte: moment(month).endOf("month").toDate(),
        },
      },
      data: {
        tgl_bayar: moment(month).set("date", 25).toDate(),
      },
    });

    return NextResponse.json(
      {
        msg: `Semua tagihan pada periode ${moment(month).format(
          "MMMM YYYY"
        )} berhasil di update`,
        status: 201,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        msg: `Gagal update semua tagihan. Internal Server Error`,
        status: 500,
      },
      { status: 500 }
    );
  }
};

export const PUT = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json(
      {
        msg: "Gagal update tagihan. Data tidak ditemukan!",
        status: 400,
      },
      { status: 400 }
    );

  try {
    const find = await prisma.angsuran.findFirst({ where: { id } });
    if (!find)
      return NextResponse.json(
        {
          msg: "Gagal update tagihan. Data tidak ditemukan!",
          status: 400,
        },
        { status: 400 }
      );

    await prisma.angsuran.update({
      where: { id },
      data: {
        tgl_bayar: find && find.tgl_bayar ? null : new Date(),
      },
    });

    return NextResponse.json(
      {
        msg: `Data tagihan berhasil di update`,
        status: 201,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        msg: `Gagal update tagihan. Internal Server Error`,
        status: 500,
      },
      { status: 500 }
    );
  }
};

export const PATCH = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("dapemId");
  if (!id)
    return NextResponse.json(
      {
        msg: "Gagal update tagihan. Data tidak ditemukan!",
        data: [],
        status: 400,
      },
      { status: 400 }
    );

  try {
    const find = await prisma.angsuran.findMany({
      where: { dapemId: id },
      orderBy: { jadwal_bayar: "asc" },
    });
    if (!find)
      return NextResponse.json(
        {
          msg: "Gagal update tagihan. Data tidak ditemukan!",
          status: 400,
          data: [],
        },
        { status: 400 }
      );

    return NextResponse.json(
      {
        msg: `Data tagihan berhasil di update`,
        status: 201,
        data: find,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        msg: `Gagal update tagihan. Internal Server Error`,
        status: 500,
        data: [],
      },
      { status: 500 }
    );
  }
};

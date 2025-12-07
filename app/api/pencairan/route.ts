import { IPencairan } from "@/components/IInterfaces";
import { getSession } from "@/lib/Auth";
import prisma from "@/lib/Prisma";
import { EStatusFinal } from "@prisma/client";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "50";
  const search = request.nextUrl.searchParams.get("search") || "";
  const sumdanId = request.nextUrl.searchParams.get("sumdanId") || "";
  const pencairan_status =
    request.nextUrl.searchParams.get("pencairan_status") || "";
  const backdate = request.nextUrl.searchParams.get("backdate");
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { data: [], total: 0, status: 200 },
      { status: 200 }
    );
  const user = await prisma.user.findFirst({ where: { id: session.user.id } });
  if (!user)
    return NextResponse.json(
      { data: [], total: 0, status: 200 },
      { status: 200 }
    );

  const find = await prisma.pencairan.findMany({
    where: {
      ...(search && {
        OR: [
          { id: { contains: search } },
          {
            Dapem: {
              some: { Debitur: { nama_penerima: { contains: search } } },
            },
          },
          { Dapem: { some: { Debitur: { nama_skep: { contains: search } } } } },
          { Dapem: { some: { Debitur: { nopen: { contains: search } } } } },
        ],
      }),
      ...(sumdanId && { sumdanId: sumdanId }),
      ...(pencairan_status && {
        pencairan_status: pencairan_status as EStatusFinal,
      }),
      ...(backdate && {
        created_at: {
          gte: moment(backdate.split(",")[0]).toDate(),
          lte: moment(backdate.split(",")[1]).toDate(),
        },
      }),
      ...(user.sumdanId && { sumdanId: user.sumdanId }),
      status: true,
    },
    skip: skip,
    take: parseInt(limit),
    orderBy: {
      created_at: "desc",
    },
    include: {
      Sumdan: true,
      Dapem: {
        include: {
          Debitur: true,
          ProdukPembiayaan: true,
          JenisPembiayaan: true,
        },
      },
    },
  });

  const total = await prisma.pencairan.count({
    where: {
      ...(search && {
        OR: [
          { id: { contains: search } },
          {
            Dapem: {
              some: { Debitur: { nama_penerima: { contains: search } } },
            },
          },
          { Dapem: { some: { Debitur: { nama_skep: { contains: search } } } } },
          { Dapem: { some: { Debitur: { nopen: { contains: search } } } } },
        ],
      }),
      ...(sumdanId && { sumdanId: sumdanId }),
      ...(pencairan_status && {
        pencairan_status: pencairan_status as EStatusFinal,
      }),
      ...(backdate && {
        created_at: {
          gte: moment(backdate.split(",")[0]).toDate(),
          lte: moment(backdate.split(",")[1]).toDate(),
        },
      }),
      ...(user.sumdanId && { sumdanId: user.sumdanId }),
      status: true,
    },
  });

  return NextResponse.json({
    status: 200,
    data: find,
    total: total,
  });
};

export const PUT = async (req: NextRequest) => {
  const data: IPencairan = await req.json();

  try {
    const { Dapem, Sumdan, ...saved } = data;
    await prisma.$transaction(async (tx) => {
      await tx.pencairan.update({ where: { id: data.id }, data: saved });
      for (const dpm of Dapem) {
        const {
          ProdukPembiayaan,
          JenisPembiayaan,
          AO,
          CreatedBy,
          Debitur,
          Angsuran,
          PenyerahanBerkas,
          PenyerahanJaminan,
          Pelunasan,
          ...dpmData
        } = dpm;
        await prisma.dapem.update({ where: { id: dpm.id }, data: dpmData });
      }
    });
    return NextResponse.json(
      {
        msg: "Data Pencairan berhasil diperbarui.",
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

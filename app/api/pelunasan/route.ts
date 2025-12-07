import { IPelunasan } from "@/components/IInterfaces";
import { getSession } from "@/lib/Auth";
import prisma, { generatePelunasanId } from "@/lib/Prisma";
import { EStatusBerkas, EStatusFinal } from "@prisma/client";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const page = req.nextUrl.searchParams.get("page") || "1";
  const limit = req.nextUrl.searchParams.get("limit") || "50";
  const search = req.nextUrl.searchParams.get("search");
  const status_final = req.nextUrl.searchParams.get("status_final");
  const status_jaminan = req.nextUrl.searchParams.get("status_jaminan");
  const alasan = req.nextUrl.searchParams.get("alasan");
  const sumdanId = req.nextUrl.searchParams.get("sumdanId");
  const backdate = req.nextUrl.searchParams.get("backdate");
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const session = await getSession();
  if (!session)
    return NextResponse.json({ data: [], status: 200 }, { status: 200 });
  const user = await prisma.user.findFirst({ where: { id: session.user.id } });
  if (!user)
    return NextResponse.json({ data: [], status: 200 }, { status: 200 });

  const find = await prisma.pelunasan.findMany({
    where: {
      ...(search && {
        OR: [
          { id: { contains: search } },
          { Dapem: { nopen: { contains: search } } },
          { Dapem: { akad_nomor: { contains: search } } },
          {
            Dapem: {
              Debitur: {
                OR: [
                  { nama_penerima: { contains: search } },
                  { nama_skep: { contains: search } },
                ],
              },
            },
          },
        ],
      }),
      ...(status_final && { status_final: status_final as EStatusFinal }),
      ...(status_jaminan && {
        status_jaminan: status_jaminan as EStatusBerkas,
      }),
      ...(sumdanId && { Dapem: { ProdukPembiayaan: { sumdanId: sumdanId } } }),
      ...(alasan && { alasan: alasan }),
      ...(user.sumdanId && {
        Dapem: { ProdukPembiayaan: { sumdanId: user.sumdanId } },
      }),
      ...(backdate && {
        created_at: {
          gte: moment(backdate.split(",")[0]).toDate(),
          lte: moment(backdate.split(",")[1]).toDate(),
        },
      }),
      status: true,
    },
    skip: skip,
    take: parseInt(limit),
    include: {
      Dapem: {
        include: {
          Debitur: { include: { Keluarga: true } },
          ProdukPembiayaan: { include: { Sumdan: true } },
          JenisPembiayaan: true,
          CreatedBy: true,
          Angsuran: true,
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
        },
      },
    },
  });
  const total = await prisma.pelunasan.count({
    where: {
      ...(search && {
        OR: [
          { id: { contains: search } },
          { Dapem: { nopen: { contains: search } } },
          { Dapem: { akad_nomor: { contains: search } } },
          {
            Dapem: {
              Debitur: {
                OR: [
                  { nama_penerima: { contains: search } },
                  { nama_skep: { contains: search } },
                ],
              },
            },
          },
        ],
      }),
      ...(status_final && { status_final: status_final as EStatusFinal }),
      ...(status_jaminan && {
        status_jaminan: status_jaminan as EStatusBerkas,
      }),
      ...(sumdanId && { Dapem: { ProdukPembiayaan: { sumdanId: sumdanId } } }),
      ...(alasan && { alasan: alasan }),
      ...(user.sumdanId && {
        Dapem: { ProdukPembiayaan: { sumdanId: user.sumdanId } },
      }),
      ...(backdate && {
        created_at: {
          gte: moment(backdate.split(",")[0]).toDate(),
          lte: moment(backdate.split(",")[1]).toDate(),
        },
      }),
      status: true,
    },
  });

  return NextResponse.json({ data: find, total, status: 200 }, { status: 200 });
};

export const POST = async (req: NextRequest) => {
  const data: IPelunasan = await req.json();
  const { id, Dapem, ...saved } = data;
  try {
    const generateId = await generatePelunasanId();
    await prisma.pelunasan.create({
      data: { id: generateId, ...saved },
    });
    return NextResponse.json(
      { status: 201, msg: "Data pelunasan berhasil dibuat" },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 500, msg: "Internal Server Error" },
      { status: 500 }
    );
  }
};
export const PUT = async (req: NextRequest) => {
  const data: IPelunasan = await req.json();
  const { id, Dapem, ...saved } = data;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.pelunasan.update({
        where: { id },
        data: saved,
      });
      if (data.status_final === "LUNAS" && Dapem.status_final !== "LUNAS") {
        await tx.dapem.update({
          where: { id: Dapem.id },
          data: { status_final: "LUNAS" },
        });
        await tx.angsuran.updateMany({
          where: { dapemId: Dapem.id },
          data: { tgl_bayar: new Date() },
        });
      }
    });
    return NextResponse.json(
      { status: 201, msg: "Data pelunasan berhasil dibuat" },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 500, msg: "Internal Server Error" },
      { status: 500 }
    );
  }
};

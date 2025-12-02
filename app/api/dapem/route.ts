import { IDapem } from "@/components/IInterfaces";
import prisma, { generateDapemId } from "@/lib/Prisma";
import { EStatusDapem, EStatusFinal } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "50";
  const search = request.nextUrl.searchParams.get("search") || "";
  const status_final = request.nextUrl.searchParams.get("status_final") || "";
  const slik_status = request.nextUrl.searchParams.get("slik_status") || "";
  const verif_status = request.nextUrl.searchParams.get("verif_status") || "";
  const approv_status = request.nextUrl.searchParams.get("approv_status") || "";
  const jenisPembiayaanId =
    request.nextUrl.searchParams.get("jenisPembiayaanId") || "";
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
      ...(slik_status && { slik_status: slik_status as EStatusDapem }),
      ...(verif_status && { verif_status: verif_status as EStatusDapem }),
      ...(approv_status && { approv_status: approv_status as EStatusDapem }),
      ...(jenisPembiayaanId && { jenisPembiayaanId: jenisPembiayaanId }),
      status: true,
    },
    skip: skip,
    take: parseInt(limit),
    orderBy: {
      created_at: "desc",
    },
    include: {
      Debitur: true,
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
      ...(slik_status && { slik_status: slik_status as EStatusDapem }),
      ...(verif_status && { verif_status: verif_status as EStatusDapem }),
      ...(approv_status && { approv_status: approv_status as EStatusDapem }),
      ...(jenisPembiayaanId && { jenisPembiayaanId: jenisPembiayaanId }),
      status: true,
    },
  });

  return NextResponse.json({ data: find, total, status: 200 }, { status: 200 });
};

export const POST = async (request: NextRequest) => {
  const data: IDapem = await request.json();

  try {
    await prisma.$transaction(async (tx) => {
      const { Keluarga, ...deb } = data.Debitur;
      const {
        id,
        Debitur,
        AO,
        CreatedBy,
        ProdukPembiayaan,
        JenisPembiayaan,
        ...saveDapem
      } = data;
      const saveDeb = await tx.debitur.upsert({
        where: { nopen: data.nopen },
        update: deb,
        create: deb,
      });
      await tx.keluarga.deleteMany({ where: { nopen: saveDeb.nopen } });
      const fam = Keluarga.map((k) => ({ ...k, nopen: saveDeb.nopen }));
      await tx.keluarga.createMany({ data: fam });
      const genId = await generateDapemId();
      await tx.dapem.create({
        data: { ...saveDapem, id: genId },
      });
    });
    return NextResponse.json({ msg: "OK", status: 201 }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { msg: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
};

export const PUT = async (request: NextRequest) => {
  const data: IDapem = await request.json();

  try {
    await prisma.$transaction(async (tx) => {
      const { Keluarga, ...deb } = data.Debitur;
      const {
        id,
        Debitur,
        AO,
        CreatedBy,
        ProdukPembiayaan,
        JenisPembiayaan,
        ...saveDapem
      } = data;
      const saveDeb = await tx.debitur.upsert({
        where: { nopen: data.nopen },
        update: deb,
        create: deb,
      });
      await tx.keluarga.deleteMany({ where: { nopen: saveDeb.nopen } });
      const fam = Keluarga.map((k) => ({ ...k, nopen: saveDeb.nopen }));
      await tx.keluarga.createMany({ data: fam });
      await tx.dapem.update({
        where: { id: data.id },
        data: saveDapem,
      });
    });
    return NextResponse.json({ msg: "OK", status: 201 }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { msg: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json(
      {
        msg: "Dapem ID tidak ditemukan atau data tidak ditemukan!",
        status: 400,
      },
      { status: 400 }
    );

  await prisma.dapem.update({
    where: { id: id },
    data: { status: false },
  });

  return NextResponse.json(
    { msg: "Data berhasil dihapus", status: 201 },
    { status: 201 }
  );
};

export const PATCH = async (req: NextRequest) => {
  const id = await req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json(
      {
        msg: "Dapem ID tidak ditemukan atau data tidak ditemukan!",
        status: 400,
      },
      { status: 400 }
    );

  const find = await prisma.dapem.findFirst({
    where: { id: id },
    include: {
      Debitur: true,
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
    },
  });
  if (!find)
    return NextResponse.json(
      {
        msg: "Dapem ID tidak ditemukan atau data tidak ditemukan!",
        status: 404,
      },
      { status: 404 }
    );
  return NextResponse.json(
    {
      data: find,
      status: 200,
      msg: "OK",
    },
    { status: 200 }
  );
};

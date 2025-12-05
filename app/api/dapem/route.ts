import { IDapem } from "@/components/IInterfaces";
import { getSession } from "@/lib/Auth";
import prisma, { generateDapemId } from "@/lib/Prisma";
import { EStatusBerkas, EStatusDapem, EStatusFinal } from "@prisma/client";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "50";
  const search = request.nextUrl.searchParams.get("search");
  const status_final = request.nextUrl.searchParams.get("status_final");
  const slik_status = request.nextUrl.searchParams.get("slik_status");
  const verif_status = request.nextUrl.searchParams.get("verif_status");
  const approv_status = request.nextUrl.searchParams.get("approv_status");
  const jenisPembiayaanId =
    request.nextUrl.searchParams.get("jenisPembiayaanId");
  const sumdanId = request.nextUrl.searchParams.get("sumdanId");
  const berkas_status = request.nextUrl.searchParams.get("berkas_status");
  const jaminan_status = request.nextUrl.searchParams.get("jaminan_status");
  const pelunasan_status = request.nextUrl.searchParams.get("pelunasan_status");
  const mutasi_status = request.nextUrl.searchParams.get("mutasi_status");
  const backdate = request.nextUrl.searchParams.get("backdate");
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const session = await getSession();
  if (!session)
    return NextResponse.json({ data: [], status: 200 }, { status: 200 });
  const user = await prisma.user.findFirst({ where: { id: session.user.id } });
  if (!user)
    return NextResponse.json({ data: [], status: 200 }, { status: 200 });

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
      ...(slik_status
        ? slik_status === "all"
          ? { slik_status: { not: null } }
          : { slik_status: slik_status as EStatusDapem }
        : {}),

      ...(verif_status
        ? verif_status === "all"
          ? { verif_status: { not: null } }
          : { verif_status: verif_status as EStatusDapem }
        : {}),

      ...(approv_status
        ? approv_status === "all"
          ? { approv_status: { not: null } }
          : { approv_status: approv_status as EStatusDapem }
        : {}),
      ...(jenisPembiayaanId && { jenisPembiayaanId: jenisPembiayaanId }),
      ...(sumdanId && { ProdukPembiayaan: { sumdanId: sumdanId } }),
      ...(berkas_status && { berkas_status: berkas_status as EStatusBerkas }),
      ...(jaminan_status && {
        jaminan_status: jaminan_status as EStatusBerkas,
      }),
      ...(mutasi_status && { mutasi_status: mutasi_status as EStatusDapem }),
      ...(pelunasan_status && {
        pelunasan_status: pelunasan_status as EStatusDapem,
      }),
      ...(user.sumdanId && { ProdukPembiayaan: { sumdanId: user.sumdanId } }),
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
    orderBy: {
      created_at: "desc",
    },
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
      ...(slik_status
        ? slik_status === "all"
          ? { slik_status: { not: null } }
          : { slik_status: slik_status as EStatusDapem }
        : {}),

      ...(verif_status
        ? verif_status === "all"
          ? { verif_status: { not: null } }
          : { verif_status: verif_status as EStatusDapem }
        : {}),

      ...(approv_status
        ? approv_status === "all"
          ? { approv_status: { not: null } }
          : { approv_status: approv_status as EStatusDapem }
        : {}),
      ...(jenisPembiayaanId && { jenisPembiayaanId: jenisPembiayaanId }),
      ...(sumdanId && { ProdukPembiayaan: { sumdanId: sumdanId } }),
      ...(berkas_status && { berkas_status: berkas_status as EStatusBerkas }),
      ...(jaminan_status && {
        jaminan_status: jaminan_status as EStatusBerkas,
      }),
      ...(mutasi_status && { mutasi_status: mutasi_status as EStatusDapem }),
      ...(pelunasan_status && {
        pelunasan_status: pelunasan_status as EStatusDapem,
      }),
      ...(user.sumdanId && { ProdukPembiayaan: { sumdanId: user.sumdanId } }),
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

export const POST = async (request: NextRequest) => {
  const data: IDapem = await request.json();
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { msg: "Unauthorize", status: 401 },
      { status: 401 }
    );
  }
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
        data: { ...saveDapem, id: genId, createdById: session.user.id },
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
    const find = await prisma.dapem.findFirst({ where: { id: data.id } });
    if (!find)
      return NextResponse.json(
        { msg: "Data tidak ditemukan", status: 404 },
        { status: 404 }
      );
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
      await tx.keluarga.deleteMany({ where: { nopen: find.nopen } });
      const fam = Keluarga.map((k) => ({ ...k, nopen: saveDeb.nopen }));
      await tx.keluarga.createMany({ data: fam });
      await tx.dapem.update({
        where: { id: data.id },
        data: { ...saveDapem, nopen: saveDeb.nopen },
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

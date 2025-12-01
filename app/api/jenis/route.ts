import prisma, { generateJenisId } from "@/lib/Prisma";
import { JenisPembiayaan } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "50";
  const search = request.nextUrl.searchParams.get("search") || "";
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const find = await prisma.jenisPembiayaan.findMany({
    where: {
      ...(search && { name: { contains: search } }),
      status: true,
    },
    skip: skip,
    take: parseInt(limit),
    orderBy: {
      updated_at: "desc",
    },
  });

  const total = await prisma.jenisPembiayaan.count({
    where: {
      ...(search && { name: { contains: search } }),
      status: true,
    },
  });

  return NextResponse.json({
    status: 200,
    data: find,
    total: total,
  });
};

export const POST = async (request: NextRequest) => {
  const body: JenisPembiayaan = await request.json();
  const { id, ...saved } = body;
  try {
    const generateId = await generateJenisId();
    await prisma.jenisPembiayaan.create({
      data: { id: generateId, ...saved },
    });
    return NextResponse.json({
      status: 201,
      msg: "Berhasil menyimpan data jenis pembiayaan.",
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      status: 500,
      msg: "Gagal menyimpan data jenis pembiayaan. internal server error.",
    });
  }
};

export const PUT = async (request: NextRequest) => {
  const body: JenisPembiayaan = await request.json();
  const { id, ...updated } = body;
  try {
    await prisma.jenisPembiayaan.update({
      where: { id: id },
      data: { ...updated, updated_at: new Date() },
    });
    return NextResponse.json({
      status: 200,
      msg: "Berhasil memperbarui data jenis pembiayaan.",
    });
  } catch (err) {
    return NextResponse.json({
      status: 500,
      msg: "Gagal memperbarui data jenis pembiayaan. internal server error.",
    });
  }
};

export const DELETE = async (request: NextRequest) => {
  const id = request.nextUrl.searchParams.get("id") || "";
  try {
    await prisma.jenisPembiayaan.update({
      where: { id: id },
      data: { status: false, updated_at: new Date() },
    });
    return NextResponse.json({
      status: 200,
      msg: "Berhasil menghapus data jenis pembiayaan.",
    });
  } catch (err) {
    return NextResponse.json({
      status: 500,
      msg: "Gagal menghapus data jenis pembiayaan. internal server error.",
    });
  }
};

import prisma, { generateCabangId } from "@/lib/Prisma";
import { Cabang } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const find = await prisma.cabang.findMany({ where: { status: true } });

  return NextResponse.json({ data: find, status: 200 }, { status: 200 });
};

export const POST = async (request: NextRequest) => {
  const body: Cabang = await request.json();
  const { id, ...saved } = body;
  try {
    const generateId = await generateCabangId();
    await prisma.cabang.create({
      data: { id: generateId, ...saved },
    });
    return NextResponse.json({
      status: 201,
      msg: "Berhasil menyimpan data cabang.",
    });
  } catch (err) {
    return NextResponse.json({
      status: 500,
      msg: "Gagal menyimpan data cabang. internal server error.",
    });
  }
};

export const PUT = async (request: NextRequest) => {
  const body: Cabang = await request.json();
  const { id, ...updated } = body;
  try {
    await prisma.cabang.update({
      where: { id: id },
      data: { ...updated, updated_at: new Date() },
    });
    return NextResponse.json({
      status: 200,
      msg: "Berhasil memperbarui data cabang.",
    });
  } catch (err) {
    return NextResponse.json({
      status: 500,
      msg: "Gagal memperbarui data cabang. internal server error.",
    });
  }
};

export const DELETE = async (request: NextRequest) => {
  const id = request.nextUrl.searchParams.get("id") || "";
  try {
    await prisma.cabang.update({
      where: { id: id },
      data: { status: false, updated_at: new Date() },
    });
    return NextResponse.json({
      status: 200,
      msg: "Berhasil menghapus data cabang.",
    });
  } catch (err) {
    return NextResponse.json({
      status: 500,
      msg: "Gagal menghapus data cabang. internal server error.",
    });
  }
};

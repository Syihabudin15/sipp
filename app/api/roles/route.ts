import prisma, { generateRoleId } from "@/lib/Prisma";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "50";
  const search = request.nextUrl.searchParams.get("search") || "";
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const find = await prisma.role.findMany({
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

  const total = await prisma.role.count({
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
  const body: Role = await request.json();
  const { id, ...saved } = body;
  try {
    const generateId = await generateRoleId();
    await prisma.role.create({
      data: { id: generateId, ...saved },
    });
    return NextResponse.json({
      status: 201,
      message: "Berhasil menyimpan data role.",
    });
  } catch (err) {
    return NextResponse.json({
      status: 500,
      message: "Gagal menyimpan data role. internal server error.",
    });
  }
};

export const PUT = async (request: NextRequest) => {
  const body: Role = await request.json();
  const { id, ...updated } = body;
  try {
    await prisma.role.update({
      where: { id: id },
      data: { ...updated, updated_at: new Date() },
    });
    return NextResponse.json({
      status: 200,
      message: "Berhasil memperbarui data role.",
    });
  } catch (err) {
    return NextResponse.json({
      status: 500,
      message: "Gagal memperbarui data role. internal server error.",
    });
  }
};

export const DELETE = async (request: NextRequest) => {
  const id = request.nextUrl.searchParams.get("id") || "";
  try {
    await prisma.role.update({
      where: { id: id },
      data: { status: false, updated_at: new Date() },
    });
    return NextResponse.json({
      status: 200,
      message: "Berhasil menghapus data role.",
    });
  } catch (err) {
    return NextResponse.json({
      status: 500,
      message: "Gagal menghapus data role. internal server error.",
    });
  }
};

import prisma, { generateUserId, generateUserNIP } from "@/lib/Prisma";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export const GET = async (request: NextRequest) => {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "50";
  const search = request.nextUrl.searchParams.get("search") || "";
  const roleId = request.nextUrl.searchParams.get("roleId") || "";
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const find = await prisma.user.findMany({
    where: {
      ...(search && {
        OR: [
          { fullname: { contains: search } },
          { username: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      }),
      ...(roleId && { roleId: roleId }),
      status: true,
    },
    skip: skip,
    take: parseInt(limit),
    orderBy: {
      updated_at: "desc",
    },
    include: {
      Cabang: true,
      Sumdan: true,
      Role: true,
    },
  });

  const total = await prisma.user.count({
    where: {
      ...(search && {
        OR: [
          { fullname: { contains: search } },
          { username: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      }),
      ...(roleId && { roleId: roleId }),
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
  const body: User = await request.json();
  const { id, nip, password, ...saved } = body;
  try {
    const find = await prisma.user.findFirst({
      where: { username: saved.username },
    });
    if (find) {
      return NextResponse.json(
        { status: 400, msg: "Maaf username telah digunakan!" },
        { status: 400 }
      );
    }
    const generateId = await generateUserId();
    const generateNIP = await generateUserNIP(saved.cabangId);
    const pass = await bcrypt.hash(body.password, 10);
    await prisma.user.create({
      data: { id: generateId, nip: generateNIP, password: pass, ...saved },
    });
    return NextResponse.json({
      status: 201,
      msg: "Berhasil menyimpan data user.",
    });
  } catch (err) {
    return NextResponse.json({
      status: 500,
      msg: "Gagal menyimpan data user. internal server error.",
    });
  }
};

export const PUT = async (request: NextRequest) => {
  const body: User = await request.json();
  const { id, ...updated } = body;
  try {
    const find = await prisma.user.findFirst({ where: { id } });

    if (find) {
      if (body.password && body.password.length < 20) {
        updated.password = await bcrypt.hash(body.password, 10);
      } else {
        updated.password = find.password;
      }
    }

    await prisma.user.update({
      where: { id: id },
      data: { ...updated, updated_at: new Date() },
    });
    return NextResponse.json({
      status: 200,
      msg: "Berhasil memperbarui data user.",
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      status: 500,
      msg: "Gagal memperbarui data user. internal server error.",
    });
  }
};

export const DELETE = async (request: NextRequest) => {
  const id = request.nextUrl.searchParams.get("id") || "";
  try {
    await prisma.user.update({
      where: { id: id },
      data: { status: false, updated_at: new Date() },
    });
    return NextResponse.json({
      status: 200,
      msg: "Berhasil menghapus data user.",
    });
  } catch (err) {
    return NextResponse.json({
      status: 500,
      msg: "Gagal menghapus data user. internal server error.",
    });
  }
};

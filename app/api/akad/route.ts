import prisma from "@/lib/Prisma";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json(
      { msg: "Dapem ID tidak ditemukan!", status: 400 },
      { status: 400 }
    );

  const find = await prisma.dapem.findFirst({
    where: { id },
    include: {
      ProdukPembiayaan: {
        include: {
          Sumdan: true,
        },
      },
      AO: {
        include: { Cabang: true },
      },
    },
  });

  if (!find)
    return NextResponse.json(
      { msg: "Dapem ID tidak ditemukan!", status: 400 },
      { status: 400 }
    );

  const akad_nomor = `${find.id.replace(
    "SIPP-",
    ""
  )}-SIPP-PK/${find.AO.cabangId.replace("-", "")}/${moment().format("MMYYYY")}`;

  return NextResponse.json({ akad_nomor, status: 200 }, { status: 200 });
};

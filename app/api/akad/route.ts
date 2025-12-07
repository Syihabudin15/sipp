import prisma, { generateTableAngsuran } from "@/lib/Prisma";
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
        include: { Cabang: { include: { Area: true } } },
      },
    },
  });

  if (!find)
    return NextResponse.json(
      { msg: "Dapem ID tidak ditemukan!", status: 400 },
      { status: 400 }
    );

  const akad_nomor = `${find.id.replace("SIPP-", "SIPPPK")}/${
    process.env.NEXT_PUBLIC_APP_SHORTNAME
  }PK/${find.AO.Cabang.Area.id.replace("-", "")}${find.AO.Cabang.id.replace(
    "-",
    ""
  )}/${moment().format("MMYYYY")}`;

  return NextResponse.json({ akad_nomor, status: 200 }, { status: 200 });
};

export const POST = async (req: NextRequest) => {
  const data: { id: string; akad_date: Date; akad_nomor: string } =
    await req.json();
  const find = await prisma.dapem.findFirst({
    where: { id: data.id },
    include: { Angsuran: true },
  });

  if (!find)
    return NextResponse.json(
      { msg: "Dapem ID tidak ditemukan!", status: 400 },
      { status: 400 }
    );
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.dapem.update({
        where: { id: data.id },
        data: {
          akad_date: data.akad_date,
          akad_nomor: data.akad_nomor,
        },
      });
      const generateAngsurans = await generateTableAngsuran({
        ...find,
        akad_date: data.akad_date,
        akad_nomor: data.akad_nomor,
      });
      if (find.Angsuran.length === 0) {
        await tx.angsuran.createMany({
          data: generateAngsurans,
        });
        return generateAngsurans;
      } else {
        const newAngsurans = generateAngsurans.map((item) => ({
          ...item,
          tgl_bayar:
            find.Angsuran.find((a) => a.ke === item.ke)?.tgl_bayar || null,
        }));
        await tx.angsuran.deleteMany({ where: { dapemId: data.id } });
        await tx.angsuran.createMany({
          data: newAngsurans,
        });
        return newAngsurans;
      }
    });
    return NextResponse.json(
      { msg: "Berhasil memperbarui data akad!", status: 200, data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { msg: "Terjadi kesalahan pada server!", status: 500 },
      { status: 500 }
    );
  }
};

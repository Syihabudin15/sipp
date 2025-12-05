import { getSession } from "@/lib/Auth";
import prisma from "@/lib/Prisma";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ data: [], status: 200 }, { status: 200 });
  const user = await prisma.user.findFirst({ where: { id: session.user.id } });
  if (!user)
    return NextResponse.json({ data: [], status: 200 }, { status: 200 });

  const [kydd, kypp, kyddmonth, alldeb, debmonth] = await prisma.$transaction([
    prisma.dapem.findMany({
      where: {
        OR: [{ status_final: "TRANSFER" }, { status_final: "LUNAS" }],
        ...(user.sumdanId && { ProdukPembiayaan: { sumdanId: user.sumdanId } }),
        status: true,
      },
    }),
    prisma.dapem.findMany({
      where: {
        OR: [{ status_final: "ANTRI" }, { status_final: "PROSES" }],
        ...(user.sumdanId && { ProdukPembiayaan: { sumdanId: user.sumdanId } }),
        status: true,
      },
    }),
    prisma.dapem.findMany({
      where: {
        status_final: "TRANSFER",
        status: true,
        ...(user.sumdanId && { ProdukPembiayaan: { sumdanId: user.sumdanId } }),
        created_at: {
          gte: moment().startOf("month").toDate(),
          lte: moment().endOf("month").toDate(),
        },
      },
    }),
    prisma.debitur.count({
      where: {
        Dapem: {
          some: {
            OR: [{ status_final: "TRANSFER" }, { status_final: "LUNAS" }],
            ...(user.sumdanId && {
              ProdukPembiayaan: { sumdanId: user.sumdanId },
            }),
            status: true,
          },
        },
      },
    }),
    prisma.debitur.count({
      where: {
        Dapem: {
          some: {
            status_final: "TRANSFER",
            status: true,
            ...(user.sumdanId && {
              ProdukPembiayaan: { sumdanId: user.sumdanId },
            }),
            created_at: {
              gte: moment().startOf("month").toDate(),
              lte: moment().endOf("month").toDate(),
            },
          },
        },
      },
    }),
  ]);

  const troles = await prisma.role.findMany({
    where: { status: true },
    include: {
      User: {
        where: {
          ...(user.sumdanId
            ? {
                sumdanId: user.sumdanId,
              }
            : { sumdanId: null }),
          status: true,
        },
      },
    },
  });
  const roles = troles.filter((tr) => tr.User.length !== 0);
  const angsurans = await prisma.angsuran.findMany({
    where: {
      Dapem: {
        status_final: "TRANSFER",
        ...(user.sumdanId && { ProdukPembiayaan: { sumdanId: user.sumdanId } }),
      },
    },
  });
  const [pelunasan, pelunasanreq] = await prisma.$transaction([
    prisma.pelunasan.findMany({
      where: {
        status: true,
        status_final: "LUNAS",
        ...(user.sumdanId && {
          Dapem: {
            ProdukPembiayaan: { sumdanId: user.sumdanId },
          },
        }),
      },
    }),
    prisma.pelunasan.findMany({
      where: {
        status: true,
        OR: [{ status_final: "ANTRI" }, { status_final: "PROSES" }],
        ...(user.sumdanId && {
          Dapem: {
            ProdukPembiayaan: { sumdanId: user.sumdanId },
          },
        }),
      },
    }),
  ]);

  return NextResponse.json({
    kyd: kydd.reduce((acc, curr) => acc + curr.plafond, 0),
    kyp: kypp.reduce((acc, curr) => acc + curr.plafond, 0),
    alldeb,
    debmonth,
    kydmonth: kyddmonth.reduce((acc, curr) => acc + curr.plafond, 0),
    noamonth: kyddmonth.length,
    osall: angsurans
      .filter((a) => a.tgl_bayar === null)
      .reduce((acc, curr) => acc + (curr.margin + curr.pokok), 0),
    ospokok: angsurans
      .filter((a) => a.tgl_bayar === null)
      .reduce((acc, curr) => acc + curr.pokok, 0),
    roles,
    verif: kypp.filter((p) => p.verif_status === "PENDING"),
    slikapprov: kypp.filter(
      (p) => p.slik_status === "PENDING" || p.approv_status === "PENDING"
    ),
    akad: kypp.filter((p) => p.status_final === "PROSES"),
    pelunasan,
    pelunasanreq,
  });
};

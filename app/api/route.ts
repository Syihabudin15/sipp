import { getSession } from "@/lib/Auth";
import prisma from "@/lib/Prisma";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await getSession();
  if (!session) return NextResponse.json({ data: [], status: 200 });

  const user = await prisma.user.findFirst({
    where: { id: session.user.id },
  });
  if (!user) return NextResponse.json({ data: [], status: 200 });

  // Base condition untuk menghindari pengulangan
  const baseCondition = {
    status: true,
    ...(user.sumdanId && { ProdukPembiayaan: { sumdanId: user.sumdanId } }),
  };

  const startMonth = moment().startOf("month").toDate();
  const endMonth = moment().endOf("month").toDate();

  // QUERY UTAMA
  const [
    kydd,
    kypp,
    kyddmonth,
    alldeb,
    debmonth,
    troles,
    angsurans,
    pelunasan,
    pelunasanreq,
    sumdans,
  ] = await prisma.$transaction([
    prisma.dapem.findMany({
      where: {
        ...baseCondition,
        status_final: { in: ["TRANSFER", "LUNAS"] },
      },
    }),
    prisma.dapem.findMany({
      where: {
        ...baseCondition,
        status_final: { in: ["ANTRI", "PROSES"] },
      },
    }),
    prisma.dapem.findMany({
      where: {
        ...baseCondition,
        status_final: "TRANSFER",
        created_at: { gte: startMonth, lte: endMonth },
      },
    }),
    prisma.debitur.count({
      where: {
        Dapem: {
          some: {
            ...baseCondition,
            status_final: { in: ["TRANSFER", "LUNAS"] },
          },
        },
      },
    }),
    prisma.debitur.count({
      where: {
        Dapem: {
          some: {
            ...baseCondition,
            status_final: "TRANSFER",
            created_at: { gte: startMonth, lte: endMonth },
          },
        },
      },
    }),
    prisma.role.findMany({
      where: { status: true },
      include: {
        User: {
          where: {
            status: true,
            ...(user.sumdanId
              ? { sumdanId: user.sumdanId }
              : { sumdanId: null }),
          },
        },
      },
    }),
    prisma.angsuran.findMany({
      where: {
        Dapem: {
          status_final: "TRANSFER",
          ...baseCondition,
        },
      },
    }),
    prisma.pelunasan.findMany({
      where: {
        status: true,
        status_final: "LUNAS",
        ...(user.sumdanId && {
          Dapem: { ProdukPembiayaan: { sumdanId: user.sumdanId } },
        }),
      },
    }),
    prisma.pelunasan.findMany({
      where: {
        status: true,
        status_final: { in: ["ANTRI", "PROSES"] },
        ...(user.sumdanId && {
          Dapem: { ProdukPembiayaan: { sumdanId: user.sumdanId } },
        }),
      },
    }),
    prisma.sumdan.findMany({
      where: {
        status: true,
        ...(user.sumdanId ? { id: user.sumdanId } : {}),
      },
      include: {
        ProdukPembiayaan: {
          where: { status: true },
          include: {
            Dapem: {
              where: {
                status: true,
                status_final: "TRANSFER",
              },
            },
          },
        },
      },
    }),
  ]);

  // ROLES
  // const troles = await prisma.role.findMany({
  //   where: { status: true },
  //   include: {
  //     User: {
  //       where: {
  //         status: true,
  //         ...(user.sumdanId ? { sumdanId: user.sumdanId } : { sumdanId: null }),
  //       },
  //     },
  //   },
  // });

  const roles = troles.filter((r) => r.User.length > 0);

  // ANGSURAN
  // const angsurans = await prisma.angsuran.findMany({
  //   where: {
  //     Dapem: {
  //       status_final: "TRANSFER",
  //       ...baseCondition,
  //     },
  //   },
  // });

  // PELUNASAN
  // const [pelunasan, pelunasanreq] = await prisma.$transaction([
  //   prisma.pelunasan.findMany({
  //     where: {
  //       status: true,
  //       status_final: "LUNAS",
  //       ...(user.sumdanId && {
  //         Dapem: { ProdukPembiayaan: { sumdanId: user.sumdanId } },
  //       }),
  //     },
  //   }),
  //   prisma.pelunasan.findMany({
  //     where: {
  //       status: true,
  //       status_final: { in: ["ANTRI", "PROSES"] },
  //       ...(user.sumdanId && {
  //         Dapem: { ProdukPembiayaan: { sumdanId: user.sumdanId } },
  //       }),
  //     },
  //   }),
  // ]);

  return NextResponse.json({
    kyd: kydd.reduce((t, d) => t + d.plafond, 0),
    kyp: kypp.reduce((t, d) => t + d.plafond, 0),
    alldeb,
    debmonth,
    kydmonth: kyddmonth.reduce((t, d) => t + d.plafond, 0),
    noamonth: kyddmonth.length,

    osall: angsurans
      .filter((a) => a.tgl_bayar === null)
      .reduce((t, a) => t + (a.margin + a.pokok), 0),

    ospokok: angsurans
      .filter((a) => a.tgl_bayar === null)
      .reduce((t, a) => t + a.pokok, 0),

    roles,

    verif: kypp.filter((p) => p.verif_status === "PENDING"),

    slikapprov: kypp.filter(
      (p) => p.slik_status === "PENDING" || p.approv_status === "PENDING"
    ),

    akad: kypp.filter((p) => p.status_final === "PROSES"),

    pelunasan,
    pelunasanreq,
    sumdan: sumdans.flatMap((s) => ({
      name: s.code,
      noa: s.ProdukPembiayaan.flatMap((p) => p.Dapem).length,
      total: s.ProdukPembiayaan.flatMap((p) => p.Dapem).reduce(
        (t, d) => t + d.plafond,
        0
      ),
    })),
    produk: sumdans.flatMap((s) =>
      s.ProdukPembiayaan.map((p) => ({
        name: p.name,
        noa: p.Dapem.length,
        total: p.Dapem.reduce((t, d) => t + d.plafond, 0),
      }))
    ),
  });
};

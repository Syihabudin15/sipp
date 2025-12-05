import { getSession } from "@/lib/Auth";
import prisma from "@/lib/Prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      {
        verif: 0,
        slik: 0,
        approv: 0,
        akad: 0,
        si: 0,
        dropping: 0,
      },
      { status: 200 }
    );
  const findUser = await prisma.user.findFirst({
    where: { id: session.user.id },
  });

  if (!findUser)
    return NextResponse.json(
      {
        verif: 0,
        slik: 0,
        approv: 0,
        akad: 0,
        si: 0,
        dropping: 0,
      },
      { status: 200 }
    );

  const [verif, slik, approv, akad, si, dropping, cpb, pb, ctbo, tbo] =
    await Promise.all([
      prisma.dapem.count({
        where: {
          verif_status: "PENDING",
          ...(findUser.sumdanId && {
            ProdukPembiayaan: { sumdanId: findUser.sumdanId },
          }),
        },
      }),
      prisma.dapem.count({
        where: {
          slik_status: "PENDING",
          ...(findUser.sumdanId && {
            ProdukPembiayaan: { sumdanId: findUser.sumdanId },
          }),
        },
      }),
      prisma.dapem.count({
        where: {
          approv_status: "PENDING",
          ...(findUser.sumdanId && {
            ProdukPembiayaan: { sumdanId: findUser.sumdanId },
          }),
        },
      }),
      prisma.dapem.count({
        where: {
          approv_status: "SETUJU",
          status_final: "PROSES",
          file_akad: null,
          ...(findUser.sumdanId && {
            ProdukPembiayaan: { sumdanId: findUser.sumdanId },
          }),
        },
      }),
      prisma.dapem.count({
        where: {
          approv_status: "SETUJU",
          status_final: "PROSES",
          file_akad: { not: null },
          pencairanId: null,
          ...(findUser.sumdanId && {
            ProdukPembiayaan: { sumdanId: findUser.sumdanId },
          }),
        },
      }),
      prisma.dapem.count({
        where: {
          approv_status: "SETUJU",
          status_final: "PROSES",
          file_akad: { not: null },
          pencairanId: { not: null },
          Pencairan: { pencairan_status: { not: "TRANSFER" } },
          ...(findUser.sumdanId && {
            ProdukPembiayaan: { sumdanId: findUser.sumdanId },
          }),
        },
      }),
      prisma.dapem.count({
        where: {
          status_final: "TRANSFER",
          penyerahanBerkasId: null,
          ...(findUser.sumdanId && {
            ProdukPembiayaan: { sumdanId: findUser.sumdanId },
          }),
        },
      }),
      prisma.dapem.count({
        where: {
          status_final: "TRANSFER",
          penyerahanBerkasId: { not: null },
          PenyerahanBerkas: { berkas_status: { not: "SUMDAN" } },
          ...(findUser.sumdanId && {
            ProdukPembiayaan: { sumdanId: findUser.sumdanId },
          }),
        },
      }),
      prisma.dapem.count({
        where: {
          status_final: "TRANSFER",
          penyerahanJaminanId: null,
          ...(findUser.sumdanId && {
            ProdukPembiayaan: { sumdanId: findUser.sumdanId },
          }),
        },
      }),
      prisma.dapem.count({
        where: {
          status_final: "TRANSFER",
          penyerahanJaminanId: { not: null },
          PenyerahanJaminan: { jaminan_status: { not: "SUMDAN" } },
          ...(findUser.sumdanId && {
            ProdukPembiayaan: { sumdanId: findUser.sumdanId },
          }),
        },
      }),
    ]);

  return NextResponse.json(
    {
      verif: verif,
      slik: slik,
      approv: approv,
      akad: akad,
      si: si,
      dropping: dropping,
      cpb,
      pb,
      ctbo,
      tbo,
    },
    { status: 200 }
  );
};

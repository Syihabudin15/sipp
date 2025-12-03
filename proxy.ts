import type { NextRequest } from "next/server";
import { refreshToken } from "./lib/Auth";

export async function proxy(request: NextRequest) {
  return await refreshToken(request);
}

export const config = {
  matcher: [
    "/dashboard",
    "/simulasi",
    "/monitoring",
    "/permohonan",
    "/proses",
    "/pelunasan",
    "/pencairan",
    "/debitur",
    "/configs:path*",
    "/proses:path*",
  ],
};

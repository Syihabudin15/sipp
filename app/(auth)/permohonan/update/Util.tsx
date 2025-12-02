"use client";

import { IDapemCreate } from "@/app/(auth)/permohonan/create/page";
import dynamic from "next/dynamic";

const UpdatePermohonan = dynamic(
  () => import("@/app/(auth)/permohonan/create/page"),
  {
    ssr: false,
    loading: () => <p>Loading ...</p>,
  }
);

export default function Page({ data }: { data: IDapemCreate }) {
  return <UpdatePermohonan defaultData={data} />;
}

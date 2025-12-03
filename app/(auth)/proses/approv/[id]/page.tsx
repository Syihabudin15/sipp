import { DetailDapem } from "@/components";

type params = {
  id: string;
};

export default async function Page({ params }: { params: Promise<params> }) {
  const { id } = await params;
  const res = await fetch(
    process.env.NEXT_PUBLIC_APP_URL + "/api/dapem?id=" + id,
    { method: "PATCH" }
  );
  const { data } = await res.json();
  if (!data) {
    return (
      <div
        className="font-bold text-center text-red-500 opacity-70 text-xl"
        style={{ lineHeight: 20 }}
      >
        <p>Data Tidak Ditemukan!</p>
      </div>
    );
  }
  return <DetailDapem data={data} proses="approv" />;
}

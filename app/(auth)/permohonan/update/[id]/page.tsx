import UpdatePermohonan from "@/app/(auth)/permohonan/update/Util";
type params = {
  id: string;
};

export default async function Page({ params }: { params: Promise<params> }) {
  const { id } = await params;
  const res = await fetch("/api/dapem?id=" + id, { method: "PATCH" });
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
  return (
    <UpdatePermohonan
      data={{
        ...data,
        usia_tahun: 0,
        usia_bulan: 0,
        usia_hari: 0,
        usia_tahun_lunas: 0,
        usia_bulan_lunas: 0,
        usia_hari_lunas: 0,
        angsuran: 0,
        total_biaya: 0,
        max_tenor: 0,
        max_plafond: 0,
      }}
    />
  );
}

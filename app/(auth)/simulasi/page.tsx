"use client";

import { FormInput } from "@/components";
import { IProdukPembiayaan } from "@/components/IInterfaces";
import {
  getAngsuran,
  getFullAge,
  getMaxPlafond,
  getMaxTenor,
  IDRFormat,
  IDRToNumber,
} from "@/components/Utils";
import {
  AppstoreOutlined,
  CalculatorFilled,
  CalculatorOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  DollarOutlined,
  DropboxOutlined,
  HistoryOutlined,
  KeyOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Dapem, JenisPembiayaan, ProdukPembiayaan, User } from "@prisma/client";
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Input,
  message,
  Modal,
  Row,
  Tag,
} from "antd";
import moment from "moment";
import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState<IDapem>(defaultDapem);
  const [produkss, setProdukss] = useState<IProdukPembiayaan[]>([]);
  const [produks, setProduks] = useState<IProdukPembiayaan[]>([]);
  const [jeniss, setJeniss] = useState<JenisPembiayaan[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { modal } = App.useApp();

  useEffect(() => {
    (async () => {
      await fetch("/api/jenis?limit=100")
        .then((res) => res.json())
        .then((res) => setJeniss(res.data));
      await fetch("/api/produk?limit=1000")
        .then((res) => res.json())
        .then((res) => setProdukss(res.data));
    })();
  }, []);

  const handleNopen = async () => {
    if (!data.nopen) {
      modal.error({ content: "Mohon masukan nopen terlebih dahulu!" });
      return;
    }
    setLoading(true);
    await fetch(`/api/debitur?nopen=` + data.nopen, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status !== 200) {
          message.error({ content: res.msg });
        } else {
          const { data: resData } = res;
          setData({
            ...data,
            nama: resData.nama_penerima,
            tgl_lahir_penerima: resData.tgl_lahir_penerima,
            gaji: resData.gaji_pensiun,
          });
        }
      });
    setLoading(false);
  };

  const reset = () => {
    setData({
      ...defaultDapem,
      nopen: data.nopen,
      nama: data.nama,
      tgl_lahir_penerima: data.tgl_lahir_penerima,
      gaji: data.gaji,
    });
  };

  useEffect(() => {
    const { year, month, day } = getFullAge(
      moment(data.tgl_lahir_penerima, "DD-MM-YYYY").format("YYYY-MM-DD"),
      moment(data.created_at).format("YYYY-MM-DD")
    );
    setProduks(produkss.filter((p) => year >= p.min_usia && year < p.max_usia));
    // if (!data.ProdukPembiayaan) {
    //   setData({ ...data, usia_tahun: year, usia_bulan: month, usia_hari: day });
    // }
    const maxTenor = getMaxTenor(data.ProdukPembiayaan.usia_lunas, year, month);
    const maxPlafond = getMaxPlafond(
      data.margin + data.margin_sumdan,
      data.tenor,
      data.gaji * (data.ProdukPembiayaan.dsr / 100)
    );
    const angsuran = getAngsuran(
      data.plafond,
      data.tenor,
      data.margin + data.margin_sumdan,
      data.pembulatan
    );
    const admin = data.plafond * ((data.c_adm + data.c_adm_sumdan) / 100);
    const asuransi = data.plafond * (data.c_asuransi / 100);
    const blokir = data.c_blokir * angsuran.angsuran;

    const {
      year: yearLunas,
      month: monthLunas,
      day: dayLunas,
    } = getFullAge(
      moment(data.tgl_lahir_penerima, "DD-MM-YYYY").format("YYYY-MM-DD"),
      moment(data.created_at).add(data.tenor, "month").format("YYYY-MM-DD")
    );

    setData((prev) => ({
      ...prev,
      usia_tahun: year,
      usia_bulan: month,
      usia_hari: day,
      usia_tahun_lunas: yearLunas,
      usia_bulan_lunas: monthLunas,
      usia_hari_lunas: dayLunas,
      max_tenor: maxTenor,
      max_plafond: maxPlafond,
      angsuran: angsuran.angsuran,
      total_biaya:
        admin +
        asuransi +
        data.c_tatalaksana +
        data.c_materai +
        data.c_rekening +
        data.c_mutasi +
        blokir +
        data.c_pelunasan,
    }));
  }, [
    data.tgl_lahir_penerima,
    data.gaji,
    data.jenisPembiayaanId,
    data.produkPembiayaanId,
    data.c_blokir,
    data.c_pelunasan,
    data.tenor,
    data.plafond,
  ]);

  return (
    <div>
      <Card
        title={
          <div className="flex gap-2">
            <CalculatorFilled style={{ color: "blue" }} />
            Simulasi Pembiayaan Pensiun
          </div>
        }
        styles={{ body: { padding: 10 } }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="flex gap-2">
              <FormInput
                data={{
                  labelIcon: <KeyOutlined />,
                  label: "Nomor Pensiun",
                  type: "text",
                  mode: "vertical",
                  required: true,
                  value: data.nopen,
                  onChange: (e: string) => setData({ ...data, nopen: e }),
                  suffix: (
                    <Button
                      size="small"
                      type="primary"
                      icon={<SearchOutlined />}
                      loading={loading}
                      onClick={() => handleNopen()}
                    ></Button>
                  ),
                  class: "flex-1",
                }}
              />
              <FormInput
                data={{
                  labelIcon: <UserOutlined />,
                  label: "Nama Pemohon",
                  type: "text",
                  mode: "vertical",
                  required: true,
                  class: "flex-1",
                  value: data.nama,
                  onChange: (e: string) => setData({ ...data, nama: e }),
                }}
              />
            </div>
            <div className="flex gap-2">
              <FormInput
                data={{
                  labelIcon: <DollarOutlined />,
                  label: "Gaji Pensiun",
                  type: "text",
                  mode: "vertical",
                  required: true,
                  class: "flex-1",
                  value: IDRFormat(data.gaji),
                  onChange: (e: string) =>
                    setData({ ...data, gaji: IDRToNumber(e) }),
                }}
              />
              <FormInput
                data={{
                  labelIcon: <CalendarOutlined />,
                  label: "Tanggal Lahir",
                  type: "date",
                  mode: "vertical",
                  required: true,
                  class: "flex-1",
                  value: moment(data.tgl_lahir_penerima, "DD-MM-YYYY").format(
                    "YYYY-MM-DD"
                  ),
                  onChange: (e: string) =>
                    !isNaN(new Date(e).getDate()) &&
                    setData({
                      ...data,
                      tgl_lahir_penerima: moment(e).format("DD-MM-YYYY"),
                    }),
                }}
              />
            </div>
            <div className="flex gap-2 italic justify-end">
              <Tag color={"blue"}>
                {data.usia_tahun || "0"} Tahun {data.usia_bulan || "0"} Bulan{" "}
                {data.usia_hari || "0"} Hari
              </Tag>
            </div>
            <div className="flex gap-2">
              <FormInput
                data={{
                  labelIcon: <DropboxOutlined />,
                  label: "Jenis Pembiayaan",
                  type: "select",
                  mode: "vertical",
                  required: true,
                  class: "flex-1",
                  options: jeniss.map((j) => ({ label: j.name, value: j.id })),
                  value: data.jenisPembiayaanId,
                  onChange: (e: string) => {
                    const filter = jeniss.find((j) => j.id === e);
                    if (!filter) return;
                    setData({
                      ...data,
                      jenisPembiayaanId: e,
                      JenisPembiayaan: filter,
                      c_mutasi: filter.c_mutasi,
                      c_blokir: filter.blokir,
                    });
                  },
                }}
              />
              <FormInput
                data={{
                  labelIcon: <AppstoreOutlined />,
                  label: "Produk Pembiayaan",
                  type: "select",
                  mode: "vertical",
                  required: true,
                  class: "flex-1",
                  options: produks.map((p) => ({
                    label: `(${p.id}) ${p.name} `,
                    value: p.id,
                  })),
                  value: data.produkPembiayaanId,
                  onChange: (e: string) => {
                    const filter = produks.find((j) => j.id === e);
                    if (!filter) return;
                    setData({
                      ...data,
                      produkPembiayaanId: e,
                      ProdukPembiayaan: filter,
                      margin: filter.margin,
                      margin_sumdan: filter.margin_sumdan,
                      c_adm: filter.c_adm,
                      c_adm_sumdan: filter.c_adm_sumdan,
                      c_asuransi: filter.c_asuransi,
                      c_tatalaksana: filter.c_tatalaksana,
                      c_materai: filter.c_materai,
                      c_rekening: filter.c_rekening,
                      pembulatan: filter.Sumdan.pembulatan,
                    });
                  },
                }}
              />
            </div>
            <Divider titlePlacement="left" style={{ color: "#777" }}>
              Permohonan Pembiayaan
            </Divider>
            <div className="flex gap-2">
              <FormInput
                data={{
                  label: "Max Tenor",
                  type: "number",
                  mode: "vertical",
                  required: true,
                  class: "flex-1",
                  disabled: true,
                  value: data.max_tenor,
                }}
              />
              <FormInput
                data={{
                  labelIcon: <ClockCircleOutlined />,
                  label: "Tenor ",
                  type: "number",
                  mode: "vertical",
                  required: true,
                  class: "flex-1",
                  value: data.tenor,
                  onChange: (e: string) =>
                    setData({
                      ...data,
                      tenor:
                        parseInt(e || "0") > data.max_tenor
                          ? 0
                          : parseInt(e || "0"),
                    }),
                }}
              />
            </div>
            <div className="flex gap-2">
              <FormInput
                data={{
                  label: "Max Plafond",
                  type: "text",
                  mode: "vertical",
                  required: true,
                  class: "flex-1",
                  disabled: true,
                  value: IDRFormat(data.max_plafond),
                }}
              />
              <FormInput
                data={{
                  labelIcon: <DollarCircleOutlined />,
                  label: "Plafond Pengajuan",
                  type: "text",
                  mode: "vertical",
                  required: true,
                  class: "flex-1",
                  value: IDRFormat(data.plafond),
                  onChange: (e: string) =>
                    setData({
                      ...data,
                      plafond:
                        IDRToNumber(e || "0") > data.max_plafond
                          ? 0
                          : IDRToNumber(e || "0"),
                    }),
                }}
              />
            </div>
            <div className="flex justify-end gap-4 mt-2">
              <Button danger icon={<HistoryOutlined />} onClick={() => reset()}>
                Reset
              </Button>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title={
                <div className="flex gap-2 font-bold text-xl ">
                  <CalculatorOutlined />
                  <p>Rincian Pembiayaan</p>
                </div>
              }
              style={{ backgroundColor: "#eeeeee" }}
              styles={{
                body: { padding: "0px 15px" },
              }}
            >
              <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
                <p>Biaya Administrasi</p>
                <p>
                  {IDRFormat(
                    data.plafond * ((data.c_adm + data.c_adm_sumdan) / 100)
                  )}
                </p>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
                <p>Biaya Asuransi</p>
                <p>{IDRFormat(data.plafond * (data.c_asuransi / 100))}</p>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
                <p>Biaya Tatalaksana</p>
                <p>{IDRFormat(data.c_tatalaksana)}</p>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
                <p>Biaya Materai</p>
                <p>{IDRFormat(data.c_materai)}</p>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
                <p>Biaya Buka Rekening</p>
                <p>{IDRFormat(data.c_rekening)}</p>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
                <p>Biaya Mutasi</p>
                <p>{IDRFormat(data.c_mutasi)}</p>
              </div>
              <div className="flex justify-between border-b border-gray-400 p-1 items-center">
                <p>Blokir Angsuran</p>
                <Input
                  type={"number"}
                  size="small"
                  style={{ width: 100 }}
                  suffix="x"
                  min={0}
                  value={data.c_blokir}
                  onChange={(e: any) =>
                    setData({
                      ...data,
                      c_blokir: parseInt(e.target.value || "0"),
                    })
                  }
                />
                <p>{IDRFormat(data.c_blokir * data.angsuran)}</p>
              </div>
              <div className="flex justify-between border-b border-gray-400 p-1 items-center">
                <p>Nominal Takeover</p>
                <Input
                  type={"text"}
                  size="small"
                  style={{ width: 150 }}
                  min={0}
                  value={IDRFormat(data.c_pelunasan)}
                  onChange={(e: any) =>
                    setData({
                      ...data,
                      c_pelunasan: IDRToNumber(e.target.value || "0"),
                    })
                  }
                />
                <p>{IDRFormat(data.c_pelunasan)}</p>
              </div>
              <div className="flex justify-between text-red-500 font-bold italic items-center">
                <p>Total Biaya</p>
                <p>{IDRFormat(data.total_biaya)}</p>
              </div>
              <div className="flex justify-between text-green-500 font-bold italic items-center">
                <p>Terima Bersih</p>
                <p>{IDRFormat(data.plafond - data.total_biaya)}</p>
              </div>
              <Card styles={{ body: { padding: 10 } }} style={{ marginTop: 5 }}>
                <div className="flex justify-between items-center">
                  <p>Angsuran</p>
                  <Tag color={"blue"}>
                    DSR {((data.angsuran / data.gaji) * 100).toFixed(2)}%
                  </Tag>
                  <p>{IDRFormat(data.angsuran)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p>Sisa Gaji Perbulan</p>
                  <p>{IDRFormat(data.gaji - data.angsuran)}</p>
                </div>
              </Card>
            </Card>
            <div className="flex justify-end gap-4 mt-2">
              <Button
                type="primary"
                icon={<CalculatorOutlined />}
                onClick={() => setOpen(true)}
              >
                Cetak Simulasi
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
      <CetakSimulasi open={open} setOpen={setOpen} data={data} />
    </div>
  );
}

const CetakSimulasi = ({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: Function;
  data: IDapem;
}) => {
  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      style={{ top: 20 }}
      width={1000}
      footer={[]}
      title={
        <div className="text-center">
          <p>DETAIL PERMOHONAN PEMBIAYAAN</p>
        </div>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex gap-2 font-bold text-xl ">
                <CalculatorOutlined />
                <p>Permohonan Pembiayaan</p>
              </div>
            }
            // style={{ backgroundColor: "#eeeeee" }}
            styles={{
              body: { padding: "0px 15px" },
            }}
          >
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Nama Pemohon</p>
              <p>{data.nama}</p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Nomor Pensiun</p>
              <p>{data.nopen}</p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Tanggal Lahir</p>
              <p>{data.tgl_lahir_penerima}</p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Gaji Pensiun</p>
              <p>{IDRFormat(data.gaji)}</p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Jenis Pembiayaan</p>
              <p>{data.jenisPembiayaanId && data.JenisPembiayaan.name}</p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Produk Pembiayaan</p>
              <p>
                {data.produkPembiayaanId &&
                  `${data.ProdukPembiayaan.id} ${data.ProdukPembiayaan.name}`}
              </p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Plafond Permohonan</p>
              <p>{IDRFormat(data.plafond)}</p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Tenor Permohonan</p>
              <p>{data.tenor || "0"} Bulan</p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Usia Saat Ini</p>
              <p>
                {data.usia_tahun || "0"} Tahun {data.usia_bulan || "0"} Bulan{" "}
                {data.usia_hari || "0"} Hari
              </p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Estimasi Usia Lunas</p>
              <p>
                {data.usia_tahun_lunas || "0"} Tahun{" "}
                {data.usia_bulan_lunas || "0"} Bulan{" "}
                {data.usia_hari_lunas || "0"} Hari
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex gap-2 font-bold text-xl ">
                <CalculatorOutlined />
                <p>Rincian Pembiayaan</p>
              </div>
            }
            style={{ backgroundColor: "#eeeeee" }}
            styles={{
              body: { padding: "0px 15px" },
            }}
          >
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Biaya Administrasi</p>
              <p>
                {IDRFormat(
                  data.plafond * ((data.c_adm + data.c_adm_sumdan) / 100)
                )}
              </p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Biaya Asuransi</p>
              <p>{IDRFormat(data.plafond * (data.c_asuransi / 100))}</p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Biaya Tatalaksana</p>
              <p>{IDRFormat(data.c_tatalaksana)}</p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Biaya Materai</p>
              <p>{IDRFormat(data.c_materai)}</p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Biaya Buka Rekening</p>
              <p>{IDRFormat(data.c_rekening)}</p>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-400 p-1 items-center">
              <p>Biaya Mutasi</p>
              <p>{IDRFormat(data.c_mutasi)}</p>
            </div>
            <div className="flex justify-between border-b border-gray-400 p-1 items-center">
              <p>Blokir Angsuran</p>
              <p>{data.c_blokir}x</p>
              <p>{IDRFormat(data.c_blokir * data.angsuran)}</p>
            </div>
            <div className="flex justify-between border-b border-gray-400 p-1 items-center">
              <p>Nominal Takeover</p>
              <p>{IDRFormat(data.c_pelunasan)}</p>
            </div>
            <div className="flex justify-between text-red-500 font-bold items-center">
              <p>Total Biaya</p>
              <p>{IDRFormat(data.total_biaya)}</p>
            </div>
            <div className="flex justify-between text-green-500 font-bold items-center">
              <p>Terima Bersih</p>
              <p>{IDRFormat(data.plafond - data.total_biaya)}</p>
            </div>
            <Card
              styles={{ body: { padding: 10 } }}
              style={{ marginTop: 5, marginBottom: 5 }}
            >
              <div className="flex justify-between items-center">
                <p>Angsuran</p>
                <Tag color={"blue"}>
                  DSR {((data.angsuran / data.gaji) * 100).toFixed(2)}%
                </Tag>
                <p>{IDRFormat(data.angsuran)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Sisa Gaji Perbulan</p>
                <p>{IDRFormat(data.gaji - data.angsuran)}</p>
              </div>
            </Card>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

interface IDapem extends Dapem {
  nama: string;
  tgl_lahir_penerima: string;
  gaji: number;
  max_tenor: number;
  max_plafond: number;
  usia_tahun: number;
  usia_bulan: number;
  usia_hari: number;
  usia_tahun_lunas: number;
  usia_bulan_lunas: number;
  usia_hari_lunas: number;
  angsuran: number;
  total_biaya: number;
  ProdukPembiayaan: ProdukPembiayaan;
  JenisPembiayaan: JenisPembiayaan;
  CreatedBy: User;
  AO: User;
}
const defaultDapem: IDapem = {
  id: "",
  nama: "",
  tgl_lahir_penerima: "",
  usia_tahun: 0,
  usia_bulan: 0,
  usia_hari: 0,
  usia_tahun_lunas: 0,
  usia_bulan_lunas: 0,
  usia_hari_lunas: 0,
  angsuran: 0,
  total_biaya: 0,
  gaji: 0,
  max_tenor: 0,
  max_plafond: 0,
  tenor: 0,
  plafond: 0,
  margin: 0,
  margin_sumdan: 0,
  c_adm: 0,
  c_adm_sumdan: 0,
  c_asuransi: 0,
  c_tatalaksana: 0,
  c_materai: 0,
  c_rekening: 0,
  c_blokir: 0,
  c_mutasi: 0,
  c_pelunasan: 0,
  pembulatan: 0,

  status_final: "DRAFT",
  final_at: null,
  slik_status: null,
  slik_date: null,
  verif_status: null,
  verif_date: null,
  approv_status: null,
  approv_date: null,
  tbo: 0,
  penggunaan: null,

  mutasi_status: null,
  mutasi_from: null,
  mutasi_ke: null,
  mutasi_date: null,
  pelunasan_status: null,
  pelunasan_ke: null,
  pelunasan_date: null,

  file_slik: null,
  file_pengajuan: null,
  file_wawancara: null,
  file_asuransi: null,
  file_akad: null,
  file_mutasi: null,
  file_pelunasan: null,
  file_pencairan: null,
  video_pencairan: null,

  nopen: "",
  produkPembiayaanId: "",
  jenisPembiayaanId: "",
  JenisPembiayaan: {} as JenisPembiayaan,
  ProdukPembiayaan: {} as IProdukPembiayaan,
  CreatedBy: {} as User,
  AO: {} as User,
  createdById: "",
  aoId: "",

  status: true,
  created_at: new Date(),
  updated_at: new Date(),
};

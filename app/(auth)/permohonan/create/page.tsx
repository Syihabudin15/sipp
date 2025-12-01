"use client";

import { FormInput } from "@/components";
import {
  IAO,
  IDapem,
  IDebitur,
  IProdukPembiayaan,
} from "@/components/IInterfaces";
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
  CalculatorOutlined,
  ClockCircleOutlined,
  DiffOutlined,
  DollarCircleOutlined,
  DropboxOutlined,
  FolderOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { JenisPembiayaan, User } from "@prisma/client";
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Input,
  Row,
  Tag,
} from "antd";
import moment from "moment";
import { useEffect, useState } from "react";

export default function Page() {
  const [statusDomisili, setStatusDomisili] = useState(false);
  const [users, setUsers] = useState<IAO[]>([]);
  const [produkss, setProdukss] = useState<IProdukPembiayaan[]>([]);
  const [produks, setProduks] = useState<IProdukPembiayaan[]>([]);
  const [jeniss, setJeniss] = useState<JenisPembiayaan[]>([]);
  const [data, setData] = useState<IDapemCreate>(defaultDapem);
  const [loading, setLoading] = useState(false);
  const { modal, message } = App.useApp();

  useEffect(() => {
    if (statusDomisili && data.Debitur) {
      setData((prev) => ({
        ...prev,
        Debitur: {
          ...prev.Debitur,
          d_alm_peserta: prev.Debitur.alm_peserta,
          d_kelurahan: prev.Debitur.kelurahan,
          d_kecamatan: prev.Debitur.kecamatan,
          d_kota: prev.Debitur.kota,
          d_provinsi: prev.Debitur.provinsi,
          d_kode_pos: prev.Debitur.kode_pos,
        },
      }));
    } else {
      setData((prev) => ({
        ...prev,
        Debitur: {
          ...prev.Debitur,
          d_alm_peserta: null,
          d_kelurahan: null,
          d_kecamatan: null,
          d_kota: null,
          d_provinsi: null,
          d_kode_pos: null,
        },
      }));
    }
  }, [statusDomisili]);

  useEffect(() => {
    (async () => {
      await fetch("/api/jenis?limit=100")
        .then((res) => res.json())
        .then((res) => setJeniss(res.data));
      await fetch("/api/produk?limit=1000")
        .then((res) => res.json())
        .then((res) => setProdukss(res.data));
      await fetch("/api/users?limit=5000")
        .then((res) => res.json())
        .then((res) => setUsers(res.data));
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
            Debitur: resData,
            nopen: resData.nopen,
          });
        }
      });
    setLoading(false);
  };

  useEffect(() => {
    const { year, month, day } = getFullAge(
      moment(data.Debitur.tgl_lahir_penerima, "DD-MM-YYYY").format(
        "YYYY-MM-DD"
      ),
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
      data.Debitur.gaji_pensiun * (data.ProdukPembiayaan.dsr / 100)
    );
    const angsuran = getAngsuran(
      data.plafond,
      data.tenor,
      data.margin + data.margin_sumdan,
      1000
    );
    const admin = data.plafond * ((data.c_adm + data.c_adm_sumdan) / 100);
    const asuransi = data.plafond * (data.c_asuransi / 100);
    const blokir = data.c_blokir * angsuran.angsuran;

    const {
      year: yearLunas,
      month: monthLunas,
      day: dayLunas,
    } = getFullAge(
      moment(data.Debitur.tgl_lahir_penerima, "DD-MM-YYYY").format(
        "YYYY-MM-DD"
      ),
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
    data.Debitur.tgl_lahir_penerima,
    data.Debitur.gaji_pensiun,
    data.jenisPembiayaanId,
    data.produkPembiayaanId,
    data.c_blokir,
    data.c_pelunasan,
    data.tenor,
    data.plafond,
  ]);

  return (
    <div>
      <h1 className="font-bold text-xl p-2">
        <DiffOutlined /> Form Permohonan Pembiayaan
      </h1>
      <Card
        title={
          <div>
            <UserOutlined /> Data Debitur
          </div>
        }
        style={{ marginBottom: 10 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Nomor Pensiun",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.nopen,
                onChange: (e: string) => setData({ ...data, nopen: e }),
                suffix: (
                  <Button
                    size="small"
                    icon={<SearchOutlined />}
                    type="primary"
                    onClick={() => handleNopen()}
                    loading={loading}
                  ></Button>
                ),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Nama Sesuai KTP",
                type: "text",
                mode: "vertical",
                value: data.Debitur.nama_penerima,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, nama_penerima: e },
                  }),
                required: true,
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Nomor NIK",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.nik,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, nik: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Tanggal Lahir",
                type: "date",
                mode: "vertical",
                required: true,
                value: moment(
                  data.Debitur.tgl_lahir_penerima,
                  "DD-MM-YYYY"
                ).format("YYYY-MM-DD"),
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: {
                      ...data.Debitur,
                      tgl_lahir_penerima: !isNaN(new Date(e).getDate())
                        ? moment(e).format("DD-MM-YYYY")
                        : "",
                    },
                  }),
              }}
            />
            <div className="flex gap-2 italic justify-end">
              <Tag color={"blue"}>
                {data.usia_tahun || "0"} Tahun {data.usia_bulan || "0"} Bulan{" "}
                {data.usia_hari || "0"} Hari
              </Tag>
            </div>
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Jenis Kelamin",
                type: "select",
                mode: "vertical",
                required: true,
                options: [
                  { label: "LAKI - LAKI", value: "LAKI - LAKI" },
                  { label: "PEREMPUAN", value: "PEREMPUAN" },
                ],
                value: data.Debitur.jenis_kelamin,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, jenis_kelamin: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Agama",
                type: "select",
                mode: "vertical",
                required: true,
                options: [
                  { label: "ISLAM", value: "ISLAM" },
                  { label: "KRISTEN", value: "KRISTEN" },
                  { label: "HINDU", value: "HINDU" },
                  { label: "BUDHA", value: "BUDHA" },
                  { label: "KATHOLIK", value: "KATHOLIK" },
                  { label: "PROTESTAN", value: "PROTESTAN" },
                ],
                value: data.Debitur.agama,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, agama: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Pendidikan Terakhir",
                type: "select",
                mode: "vertical",
                required: true,
                options: [
                  { label: "TIDAK TAMAT SD", value: "TIDAK TAMAT SD" },
                  { label: "SD", value: "SD" },
                  { label: "SMP", value: "SMP" },
                  { label: "SMA / SEDERAJAT", value: "SMA / SEDERAJAT" },
                  { label: "D3", value: "D3" },
                  { label: "S1", value: "S1" },
                  { label: "S2", value: "S2" },
                  { label: "S3", value: "S3" },
                  { label: "LAINNYA", value: "LAINNYA" },
                ],
                value: data.Debitur.pendidikan,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, pendidikan: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "NPWP",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.npwp,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, npwp: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Nomor Telepon",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.no_telepon,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, no_telepon: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Nama Ibu Kandung",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.ibu_kandung,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, ibu_kandung: e },
                  }),
              }}
            />
          </Col>
          <Divider titlePlacement="left" style={{ color: "#999", margin: 0 }}>
            Pekerjaan & Status Rumah
          </Divider>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Pekerjaan",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.pekerjaan,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, pekerjaan: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Jenis Usaha",
                type: "select",
                mode: "vertical",
                required: true,
                options: [
                  { label: "WARUNG KOPI", value: "WARUNG KOPI" },
                  { label: "TOKO KELONTONG", value: "TOKO KELONTONG" },
                  {
                    label: "JASA CUCI KENDARAAN",
                    value: "JASA CUCI KENDARAAN",
                  },
                  { label: "LAUNDRY", value: "LAUNDRY" },
                  { label: "SALON KECANTIKAN", value: "SALON KECANTIKAN" },
                  { label: "LAINNYA", value: "LAINNYA" },
                  { label: "TIDAK PUNYA USAHA", value: "TIDAK PUNYA USAHA" },
                ],
                value: data.Debitur.jenis_usaha,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, jenis_usaha: e },
                  }),
              }}
            />
          </Col>
          <Col xs={24} lg={6}>
            <FormInput
              data={{
                label: "Alamat Pekerjaan",
                type: "textarea",
                mode: "vertical",
                value: data.Debitur.alm_pekerjaan,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, alm_pekerjaan: e },
                  }),
              }}
            />
          </Col>

          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Status Rumah",
                type: "select",
                mode: "vertical",
                required: true,
                options: [
                  { label: "MILIK SENDIRI", value: "MILIK SENDIRI" },
                  { label: "MILIK KELUARGA", value: "MILIK KELUARGA" },
                  { label: "SEWA", value: "SEWA" },
                  { label: "TIDAK PUNYA RUMAH", value: "TIDAK PUNYA RUMAH" },
                  { label: "LAINNYA", value: "LAINNYA" },
                ],
                value: data.Debitur.status_rumah,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, status_rumah: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Tahun Menempati Rumah",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.menempati_rumah,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, menempati_rumah: e },
                  }),
              }}
            />
          </Col>
          <Divider titlePlacement="left" style={{ color: "#999", margin: 0 }}>
            Alamat Sesuai KTP
          </Divider>
          <Col xs={24} lg={6}>
            <FormInput
              data={{
                label: "Alamat",
                type: "textarea",
                mode: "vertical",
                required: true,
                value: data.Debitur.alm_peserta,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, alm_peserta: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Kelurahan",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.kelurahan,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, kelurahan: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Kecamatan",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.kecamatan,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, kecamatan: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Kab/Kota",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.kota,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, kota: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Provinsi",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.provinsi,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, provinsi: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Kode Pos",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.kode_pos,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, kode_pos: e },
                  }),
              }}
            />
          </Col>
          <Divider titlePlacement="left" style={{ color: "#999", margin: 0 }}>
            Alamat Sesuai Domisili
          </Divider>
          <Col span={24}>
            <Checkbox
              checked={statusDomisili}
              onChange={(e) => setStatusDomisili(e.target.checked)}
            >
              Alamat Domisili sama dengan KTP?
            </Checkbox>
          </Col>
          {!statusDomisili && (
            <Col xs={24} lg={6}>
              <FormInput
                data={{
                  label: "Alamat",
                  type: "textarea",
                  mode: "vertical",
                  required: true,
                  value: data.Debitur.d_alm_peserta,
                  onChange: (e: string) =>
                    setData({
                      ...data,
                      Debitur: { ...data.Debitur, d_alm_peserta: e },
                    }),
                }}
              />
            </Col>
          )}
          {!statusDomisili && (
            <Col xs={12} lg={6}>
              <FormInput
                data={{
                  label: "Kelurahan",
                  type: "text",
                  mode: "vertical",
                  required: true,
                  value: data.Debitur.d_kelurahan,
                  onChange: (e: string) =>
                    setData({
                      ...data,
                      Debitur: { ...data.Debitur, d_kelurahan: e },
                    }),
                }}
              />
            </Col>
          )}
          {!statusDomisili && (
            <Col xs={12} lg={6}>
              <FormInput
                data={{
                  label: "Kecamatan",
                  type: "text",
                  mode: "vertical",
                  required: true,
                  value: data.Debitur.d_kecamatan,
                  onChange: (e: string) =>
                    setData({
                      ...data,
                      Debitur: { ...data.Debitur, d_kecamatan: e },
                    }),
                }}
              />
            </Col>
          )}
          {!statusDomisili && (
            <Col xs={12} lg={6}>
              <FormInput
                data={{
                  label: "Kab/Kota",
                  type: "text",
                  mode: "vertical",
                  required: true,
                  value: data.Debitur.d_kota,
                  onChange: (e: string) =>
                    setData({
                      ...data,
                      Debitur: { ...data.Debitur, d_kota: e },
                    }),
                }}
              />
            </Col>
          )}
          {!statusDomisili && (
            <Col xs={12} lg={6}>
              <FormInput
                data={{
                  label: "Provinsi",
                  type: "text",
                  mode: "vertical",
                  required: true,
                  value: data.Debitur.d_provinsi,
                  onChange: (e: string) =>
                    setData({
                      ...data,
                      Debitur: { ...data.Debitur, d_provinsi: e },
                    }),
                }}
              />
            </Col>
          )}
          {!statusDomisili && (
            <Col xs={12} lg={6}>
              <FormInput
                data={{
                  label: "Kode Pos",
                  type: "text",
                  mode: "vertical",
                  required: true,
                  value: data.Debitur.d_kode_pos,
                  onChange: (e: string) =>
                    setData({
                      ...data,
                      Debitur: { ...data.Debitur, d_kode_pos: e },
                    }),
                }}
              />
            </Col>
          )}
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Geo Location",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.geo_location,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, geo_location: e },
                  }),
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card
        title={
          <div>
            <TeamOutlined /> Data Keluarga
          </div>
        }
        style={{ marginBottom: 10 }}
      ></Card>
      <Card
        title={
          <div>
            <UserOutlined /> Data Pensiun Debitur
          </div>
        }
        style={{ marginBottom: 10 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Nama Sesuai SKEP",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.nama_skep,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, nama_skep: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Nomor SKEP",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.no_skep,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, no_skep: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Golongan Pensiun",
                type: "select",
                mode: "vertical",
                required: true,
                options: [
                  { label: "TASPEN", value: "TASPEN" },
                  { label: "ASABRI", value: "ASABRI" },
                  { label: "LAINNYA", value: "LAINNYA" },
                ],
                value: data.Debitur.jenis_skep,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, jenis_skep: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Penerbit SKEP",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.penerbit_skep,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, penerbit_skep: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Pangkat",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.pangkat,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, pangkat: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Kode Jiwa",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.kode_jiwa,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, kode_jiwa: parseInt(e) },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Tanggal SKEP",
                type: "date",
                mode: "vertical",
                required: true,
                value: moment(data.Debitur.tgl_skep, "DD-MM-YYYY").format(
                  "YYYY-MM-DD"
                ),
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: {
                      ...data.Debitur,
                      tgl_skep: !isNaN(new Date(e).getDate())
                        ? moment(e).format("DD-MM-YYYY")
                        : "",
                    },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "TMT Pensiun",
                type: "date",
                mode: "vertical",
                required: true,
                value: moment(data.Debitur.tmt_pensiun, "DD-MM-YYYY").format(
                  "YYYY-MM-DD"
                ),
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: {
                      ...data.Debitur,
                      tmt_pensiun: !isNaN(new Date(e).getDate())
                        ? moment(e).format("DD-MM-YYYY")
                        : "",
                    },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Gaji Pensiun",
                type: "text",
                mode: "vertical",
                required: true,
                value: IDRFormat(data.Debitur.gaji_pensiun || 0),
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: {
                      ...data.Debitur,
                      gaji_pensiun: IDRToNumber(e || "0"),
                    },
                  }),
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card
        title={
          <div>
            <CalculatorOutlined /> Rincian Pembiayaan
          </div>
        }
        style={{ marginBottom: 10 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
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
                      tbo: filter.Sumdan.tbo,
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
                    DSR{" "}
                    {(
                      (data.angsuran / data.Debitur.gaji_pensiun) *
                      100
                    ).toFixed(2)}
                    %
                  </Tag>
                  <p>{IDRFormat(data.angsuran)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p>Sisa Gaji Perbulan</p>
                  <p>{IDRFormat(data.Debitur.gaji_pensiun - data.angsuran)}</p>
                </div>
              </Card>
            </Card>
          </Col>
        </Row>
      </Card>
      <Card
        title={
          <div>
            <InfoCircleOutlined /> Informasi Pembiayaan Lainnya
          </div>
        }
        style={{ marginBottom: 10 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Instansi Pelunasan",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.pelunasan_ke,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    pelunasan_ke: e,
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Estimasi Tgl Pelunasan",
                type: "date",
                mode: "vertical",
                required: true,
                value: moment(data.pelunasan_date).format("YYYY-MM-DD"),
                onChange: (e: string) =>
                  setData({
                    ...data,
                    pelunasan_date: !isNaN(new Date(e).getDate())
                      ? moment(e).toDate()
                      : null,
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Kantor Bayar Sebelumnya",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.mutasi_from,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    mutasi_from: e,
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Kantor Bayar Tujuan",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.mutasi_ke,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    mutasi_ke: e,
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Nomor Rekening",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.norek,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, norek: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Nama Rek. Bank",
                type: "text",
                mode: "vertical",
                required: true,
                value: data.Debitur.bank,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    Debitur: { ...data.Debitur, bank: e },
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Tujuan Penggunaan",
                type: "textarea",
                mode: "vertical",
                required: true,
                value: data.penggunaan,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    penggunaan: e,
                  }),
              }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <FormInput
              data={{
                label: "Marketin/SPV",
                type: "select",
                mode: "vertical",
                required: true,
                options: users.map((u) => ({
                  label: `${u.fullname} (${u.Cabang.name})`,
                  value: u.id,
                })),
                value: data.aoId,
                onChange: (e: string) =>
                  setData({
                    ...data,
                    aoId: e,
                  }),
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card
        title={
          <div>
            <FolderOutlined /> Berkas Permohonan
          </div>
        }
        style={{ marginBottom: 10 }}
      ></Card>
    </div>
  );
}

interface IDapemCreate extends IDapem {
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
}

const defaultDapem: IDapemCreate = {
  id: "",
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
  AO: {} as IAO,
  Debitur: {} as IDebitur,
  createdById: "",
  aoId: "",

  status: true,
  created_at: new Date(),
  updated_at: new Date(),
};

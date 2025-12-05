"use client";

import {
  ArrowRightOutlined,
  AuditOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileFilled,
  FileOutlined,
  FolderOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { IDapem, IDebitur } from "./IInterfaces";
import { getAngsuran, getFullAge, IDRFormat } from "./Utils";
import {
  App,
  Button,
  Card,
  Descriptions,
  Divider,
  Table,
  TableProps,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { EStatusDapem, Keluarga } from "@prisma/client";
import moment from "moment";
import { FormInput } from ".";
import { useState } from "react";
const { Text } = Typography;

export default function DetailDapem({
  data,
  proses,
}: {
  data: IDapem;
  proses?: string;
}) {
  const items = [
    {
      key: "1",
      label: (
        <span>
          <CalculatorOutlined /> Detail Pembiayaan
        </span>
      ),
      children: <DataPembiayaan data={data} />,
    },
    {
      key: "2",
      label: (
        <span>
          <UserOutlined /> Data Debitur & Keluarga
        </span>
      ),
      children: <DataDebitur data={data.Debitur} />,
    },
    {
      key: "3",
      label: (
        <span>
          <FolderOutlined /> Berkas - Berkas
        </span>
      ),
      children: <BerkasBerkas data={data} />,
    },
    {
      key: "4",
      label: (
        <span>
          <AuditOutlined /> Proses Permohonan
        </span>
      ),
      children: <ProsesPermohonan data={data} proses={proses} />,
    },
  ];
  return (
    <div>
      <header className="mb-6 bg-white shadow-md rounded-xl p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Detail Permohonan Kredit
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          ID Permohonan:{" "}
          <span className="font-mono font-medium text-indigo-600">
            {data.id}
          </span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Nomor Akad:{" "}
          <span className="font-mono font-medium text-indigo-600">
            {data.id}
          </span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Pemohon:{" "}
          <span className="font-mono font-medium text-indigo-600">
            {data.Debitur.nama_penerima} ({data.Debitur.nopen})
          </span>
        </p>
      </header>
      <Card
        className="shadow-xl rounded-lg border-t-4 border-blue-500"
        styles={{ body: { padding: 5 } }}
      >
        <Tabs defaultActiveKey="1" items={items} size="large" className="p-2" />
      </Card>
    </div>
  );
}

const DataPembiayaan = ({ data }: { data: IDapem }) => {
  return (
    <div className="bg-white shadow-xl rounded-xl p-6 border-t-4 border-indigo-500">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center">
        Ringkasan Pembiayaan
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm font-medium text-indigo-600">Plafond</p>
          <p className="text-2xl font-bold text-indigo-800 mt-1">
            {IDRFormat(data.plafond)}
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-600">Tenor</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">
            {data.tenor} Bulan
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-600">Margin Efektif</p>
          <p className="text-2xl font-bold text-green-800 mt-1">
            {data.margin + data.margin_sumdan}% Pertahun
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-red-600">Angsuran Perbulan</p>
          <p className="text-2xl font-bold text-red-800 mt-1">
            {IDRFormat(
              getAngsuran(
                data.plafond,
                data.tenor,
                data.margin + data.margin_sumdan,
                data.pembulatan
              ).angsuran
            )}
          </p>
        </div>
      </div>
      <div className="bg-white shadow-xl rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Detail Produk & Biaya
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <DataItem
            label="Sumber Dana"
            value={data.ProdukPembiayaan.Sumdan.name}
          />
          <DataItem
            label="Produk Pembiayaan"
            value={data.ProdukPembiayaan.name}
          />
          <DataItem
            label="Jenis Pembiayaan"
            value={data.JenisPembiayaan.name}
          />
          {data.JenisPembiayaan.status_mutasi && (
            <DataItem
              label="Keterangan Mutasi"
              value={
                <div className="flex gap-2 flex-wrap">
                  <Tag color={"blue"}>{data.mutasi_from}</Tag>
                  <ArrowRightOutlined />
                  <Tag color={"blue"}>{data.mutasi_ke}</Tag>
                </div>
              }
            />
          )}
          {data.JenisPembiayaan.status_pelunasan && (
            <DataItem
              label="Keterangan Takeover"
              value={
                <div>
                  Pelunasan ke <Tag color={"blue"}>{data.pelunasan_ke}</Tag>
                </div>
              }
            />
          )}
          <DataItem label="Dibuat Oleh" value={data.CreatedBy.fullname} />
          <DataItem label="AO Bertanggung Jawab" value={data.AO.fullname} />
          <DataItem
            label="AO Cabang/Area"
            value={`${data.AO.Cabang.name} - ${data.AO.Cabang.Area.name}`}
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3 border-t pt-4"></h3>
        <Descriptions
          bordered
          column={1}
          size="middle"
          // labelStyle={{ width: "50%" }}
          styles={{ label: { width: "50%" } }}
          title={
            <span className="font-semibold text-base">Rincian Pembiayaan</span>
          }
        >
          <Descriptions.Item label="Usia Pemohon">
            <Text className="font-bold">
              {(() => {
                const { year, month, day } = getFullAge(
                  moment(data.Debitur.tgl_lahir_penerima, "DD-MM-YYYY").format(
                    "YYYY-MM-DD"
                  ),
                  moment(data.created_at).format("YYYY-MM-DD")
                );
                return `${year} Tahun ${month} Bulan ${day} Hari`;
              })()}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Gaji Pensiun">
            <Text className="font-bold ">
              {IDRFormat(data.Debitur.gaji_pensiun)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Plafond">
            <Text className="font-bold " style={{ color: "green" }}>
              {IDRFormat(data.plafond)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tenor">
            <Text className="font-bold text-blue-600">{data.tenor} Bulan</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Angsuran">
            <Text className="font-bold ">
              {IDRFormat(
                getAngsuran(
                  data.plafond,
                  data.tenor,
                  data.margin + data.margin_sumdan,
                  data.pembulatan
                ).angsuran
              )}
              <Tag color={"blue"} style={{ marginLeft: 10 }}>
                DSR{" "}
                {(getAngsuran(
                  data.plafond,
                  data.tenor,
                  data.margin + data.margin_sumdan,
                  data.pembulatan
                ).angsuran /
                  data.Debitur.gaji_pensiun) *
                  100}
                %
              </Tag>
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Sisa Gaji">
            <Text className="font-bold ">
              {IDRFormat(
                data.Debitur.gaji_pensiun -
                  getAngsuran(
                    data.plafond,
                    data.tenor,
                    data.margin + data.margin_sumdan,
                    data.pembulatan
                  ).angsuran
              )}
            </Text>
          </Descriptions.Item>
        </Descriptions>
        {/* Biaya - Biaya */}
        <div className="my-4"></div>
        <Descriptions
          bordered
          column={1}
          size="middle"
          // labelStyle={{ width: "50%" }}
          styles={{ label: { width: "50%" } }}
          title={
            <span className="font-semibold text-base">
              Terima Bersih & Biaya - Biaya
            </span>
          }
        >
          <Descriptions.Item label={`Biaya Asuransi (${data.c_asuransi}%)`}>
            <Text className="font-bold ">
              {IDRFormat(data.plafond * (data.c_asuransi / 100))}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label={`Biaya Administrasi (${data.c_adm}%)`}>
            <Text className="font-bold ">
              {IDRFormat(data.plafond * (data.c_adm / 100))}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item
            label={`Biaya Admin Sumber Dana (${data.c_adm_sumdan}%)`}
          >
            <Text className="font-bold ">
              {IDRFormat(data.plafond * (data.c_adm_sumdan / 100))}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label={`Biaya Buka Rekening`}>
            <Text className="font-bold ">{IDRFormat(data.c_rekening)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={`Biaya Tatalaksana`}>
            <Text className="font-bold ">{IDRFormat(data.c_tatalaksana)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={`Biaya Materai`}>
            <Text className="font-bold ">{IDRFormat(data.c_materai)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={`Biaya Mutasi`}>
            <Text className="font-bold ">{IDRFormat(data.c_mutasi)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={`Blokir Angsuran (${data.c_blokir}x)`}>
            <Text className="font-bold ">
              {IDRFormat(
                getAngsuran(
                  data.plafond,
                  data.tenor,
                  data.margin + data.margin_sumdan,
                  data.pembulatan
                ).angsuran * data.c_blokir
              )}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Total Biaya">
            <Text className="font-bold " style={{ color: "red" }}>
              {(() => {
                const asuransi = data.plafond * (data.c_asuransi / 100);
                const adm =
                  data.plafond * ((data.c_adm + data.c_adm_sumdan) / 100);
                const blokir =
                  getAngsuran(
                    data.plafond,
                    data.tenor,
                    data.margin + data.margin_sumdan,
                    data.pembulatan
                  ).angsuran * data.c_blokir;

                return IDRFormat(
                  asuransi +
                    adm +
                    data.c_rekening +
                    data.c_tatalaksana +
                    data.c_materai +
                    data.c_mutasi +
                    blokir
                );
              })()}
            </Text>
          </Descriptions.Item>
        </Descriptions>
        <div className="my-4"></div>
        <Descriptions
          bordered
          column={1}
          size="middle"
          // labelStyle={{ width: "50%" }}
          styles={{ label: { width: "50%" } }}
        >
          <Descriptions.Item label="Terima Kotor">
            <Text className="font-bold " style={{ color: "blue" }}>
              {(() => {
                const asuransi = data.plafond * (data.c_asuransi / 100);
                const adm =
                  data.plafond * ((data.c_adm + data.c_adm_sumdan) / 100);
                const blokir =
                  getAngsuran(
                    data.plafond,
                    data.tenor,
                    data.margin + data.margin_sumdan,
                    data.pembulatan
                  ).angsuran * data.c_blokir;

                return IDRFormat(
                  data.plafond -
                    (asuransi +
                      adm +
                      data.c_rekening +
                      data.c_tatalaksana +
                      data.c_materai +
                      data.c_mutasi +
                      blokir)
                );
              })()}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label={`Nominal Takeover`}>
            <Text className="font-bold ">{IDRFormat(data.c_pelunasan)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Terima Bersih">
            <Text className="font-bold " style={{ color: "green" }}>
              {(() => {
                const asuransi = data.plafond * (data.c_asuransi / 100);
                const adm =
                  data.plafond * ((data.c_adm + data.c_adm_sumdan) / 100);
                const blokir =
                  getAngsuran(
                    data.plafond,
                    data.tenor,
                    data.margin + data.margin_sumdan,
                    data.pembulatan
                  ).angsuran * data.c_blokir;

                return IDRFormat(
                  data.plafond -
                    (asuransi +
                      adm +
                      data.c_rekening +
                      data.c_tatalaksana +
                      data.c_materai +
                      data.c_mutasi +
                      blokir +
                      data.c_pelunasan)
                );
              })()}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );
};

const DataDebitur = ({ data }: { data: IDebitur }) => {
  return (
    <div>
      <Card
        title={
          <div>
            <UserOutlined /> Informasi Debitur
          </div>
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <DataItem label={"Nama Lengkap"} value={data.nama_penerima} />
          <DataItem label={"Nomor NIK"} value={data.nik} />
          <DataItem label={"Tempat Lahir"} value={data.tempat_lahir} />
          <DataItem
            label={"Tanggal Lahir"}
            value={moment(data.tgl_lahir_penerima, "DD-MM-YYYY").format(
              "DD/MM/YYYY"
            )}
          />
          <DataItem label={"Jenis Kelamin"} value={data.jenis_kelamin} />
          <DataItem label={"Agama"} value={data.agama} />
          <DataItem label={"Pendidikan Terakhir"} value={data.pendidikan} />
          <DataItem label={"Status Perkawinan"} value={data.status_kawin} />
          <DataItem label={"Nomor Telepon"} value={data.no_telepon} />
          <DataItem label={"Nomor NPWP"} value={data.npwp} />
          <DataItem label={"Ibu Kandung"} value={data.ibu_kandung} />
        </div>
        <Divider
          size="small"
          style={{ color: "#999", marginTop: 20 }}
          titlePlacement="left"
        >
          Alamat
        </Divider>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <DataItem label={"Alamat"} value={data.alm_peserta} />
          <DataItem label={"Kelurahan"} value={data.kelurahan} />
          <DataItem label={"Kecamatan"} value={data.kecamatan} />
          <DataItem label={"Kota"} value={data.kota} />
          <DataItem label={"Provinsi"} value={data.provinsi} />
          <DataItem label={"Kode Pos"} value={data.kode_pos} />
          <DataItem
            label={"Status Domisili"}
            value={
              data.alm_peserta === data.d_alm_peserta
                ? "Sama dengan KTP"
                : "Berbeda dengan KTP"
            }
          />
        </div>
        {data.alm_peserta !== data.d_alm_peserta && (
          <>
            <Divider
              size="small"
              style={{ color: "#999", marginTop: 20 }}
              titlePlacement="left"
            >
              Alamat Domisili
            </Divider>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <DataItem label={"Alamat"} value={data.d_alm_peserta} />
              <DataItem label={"Kelurahan"} value={data.d_kelurahan} />
              <DataItem label={"Kecamatan"} value={data.d_kecamatan} />
              <DataItem label={"Kota"} value={data.d_kota} />
              <DataItem label={"Provinsi"} value={data.d_provinsi} />
              <DataItem label={"Kode Pos"} value={data.d_kode_pos} />
            </div>
          </>
        )}
        <Divider
          size="small"
          style={{ color: "#999", marginTop: 20 }}
          titlePlacement="left"
        >
          Pekerjaan & Data Kepemilikan Rumah
        </Divider>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <DataItem label={"Pekerjaan"} value={data.pekerjaan} />
          <DataItem label={"Alamat Pekerjaan"} value={data.alm_pekerjaan} />
          <DataItem label={"Jenis Usaha"} value={data.jenis_usaha} />
          <DataItem label={"Status Rumah"} value={data.status_rumah} />
          <DataItem
            label={"Tahun Menempati Rumah"}
            value={data.menempati_rumah}
          />
        </div>
      </Card>
      <div className="my-4"></div>
      <Card
        title={
          <div>
            <TeamOutlined /> Data Keluarga Debitur
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={data.Keluarga}
          rowKey={"id"}
          pagination={false}
          size="small"
          bordered
          scroll={{ x: "max-content" }}
        />
      </Card>
      <div className="my-4"></div>
      <Card
        title={
          <div>
            <SafetyOutlined /> Data Pensiun Debitur
          </div>
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <DataItem label={"Nomor Pensiun"} value={data.nopen} />
          <DataItem label={"Nomor SKEP"} value={data.no_skep} />
          <DataItem
            label={"Gaji Pensiun"}
            value={IDRFormat(data.gaji_pensiun)}
          />
          <DataItem label={"Nama SKEP"} value={data.nama_skep} />
          <DataItem label={"Pangkat"} value={data.pangkat} />
          <DataItem label={"Kode Jiwa"} value={data.kode_jiwa} />
          <DataItem
            label={"Tanggal SKEP"}
            value={moment(data.tgl_skep).format("DD/MM/YYYY")}
          />
          <DataItem
            label={"TMT Pensiun"}
            value={moment(data.tmt_pensiun).format("DD/MM/YYYY")}
          />
          <DataItem label={"Kode Jiwa"} value={data.kode_jiwa} />
          <DataItem label={"Kelompok Pensiun"} value={data.kelompok_pensiun} />
          <DataItem label={"Penerbit SKEP"} value={data.penerbit_skep} />
        </div>
      </Card>
    </div>
  );
};

const DataItem = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col">
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
      {label}
    </span>
    <span className="text-base font-semibold text-gray-900 wrap-break-word mt-0.5">
      {value || "-"}
    </span>
  </div>
);

const columns: TableProps<Keluarga>["columns"] = [
  {
    title: "Nama Lengkap",
    dataIndex: "name",
    key: "name",
    render(value, record, index) {
      return (
        <div>
          <p>{record.name}</p>
          <p className="opacity-70">{record.nik}</p>
        </div>
      );
    },
  },
  {
    title: "Tanggal Lahir",
    dataIndex: "tgl_lahir",
    key: "tgl_lahir",
    render(value, record, index) {
      return <>{moment(record.tgl_lahir).format("DD/MM/YYYY")}</>;
    },
  },
  {
    title: "Alamat",
    dataIndex: "alamat",
    key: "alamat",
  },
  {
    title: "Pekerjaan",
    dataIndex: "pekerjaan",
    key: "pekerjaan",
  },
  {
    title: "No Telepon",
    dataIndex: "no_telepon",
    key: "no_telepon",
  },
  {
    title: "Hubungan",
    dataIndex: "hubungan",
    key: "hubungan",
  },
];

const ProsesPermohonan = ({
  data,
  proses,
}: {
  data: IDapem;
  proses?: string;
}) => {
  return (
    <div>
      <ProsesStep
        currdata={data}
        status={data.verif_status}
        title="VERIFIKASI"
        desc={data.verif_desc}
        date={data.verif_date}
        proses={proses}
        name="verif"
        nextstep={{ slik_status: "PENDING" }}
      />
      <ProsesStep
        currdata={data}
        status={data.slik_status}
        title="SLIK"
        desc={data.slik_desc}
        date={data.slik_date}
        proses={proses}
        name="slik"
        nextstep={{ approv_status: "PENDING" }}
      />
      <ProsesStep
        currdata={data}
        status={data.approv_status}
        title="APPROVAL"
        desc={data.approv_desc}
        date={data.approv_date}
        proses={proses}
        name="approv"
        nextstep={{ status_final: "PROSES" }}
      />
    </div>
  );
};
const ProsesStep = ({
  currdata,
  status,
  title,
  desc,
  date,
  proses,
  name,
  nextstep,
}: {
  currdata: IDapem;
  status: EStatusDapem | null;
  title: string;
  desc: string | null;
  date: Date | null;
  proses?: string;
  name: string;
  nextstep?: object;
}) => {
  const [data, setData] = useState<{
    desc: string;
    date: Date;
    status: EStatusDapem | null;
  }>({
    desc: desc || "",
    date: date || new Date(),
    status: status,
  });
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp();

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/dapem?id=" + currdata.id, {
      method: "PUT",
      body: JSON.stringify({
        ...currdata,
        [`${name}_status`]: data.status,
        [`${name}_desc`]: data.desc,
        [`${name}_date`]: data.date,
        ...(data.status === "SETUJU" && { ...nextstep }),
        ...(data.status === "TOLAK" && { final_status: "GAGAL" }),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        const { status, msg } = res;
        if (status === 201) {
          modal.success({ content: "Update Proses Permohonan berhasil" });
          setTimeout(() => {
            window && window.location.reload();
          }, 1000);
        } else {
          modal.error({ content: msg });
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({ content: "Internal Server Error!" });
      });
    setLoading(false);
  };

  return (
    <div
      className={`bg-white shadow-xl rounded-xl p-6 ${
        status && status !== "PENDING" ? "opacity-70" : ""
      }`}
    >
      <h3
        className={`text-lg font-semibold text-${
          status === "PENDING" || !status
            ? "indigo"
            : status === "TOLAK"
            ? "red"
            : "green"
        }-700 mb-2 flex items-center gap-4`}
      >
        {title}{" "}
        {status && status === "PENDING" ? (
          <ClockCircleOutlined style={{ color: "orange" }} />
        ) : (
          ""
        )}{" "}
        {status && status === "SETUJU" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          ""
        )}{" "}
        {status && status === "TOLAK" ? (
          <CloseCircleOutlined style={{ color: "red" }} />
        ) : (
          ""
        )}
      </h3>
      <p>{desc}</p>
      <p>{date && moment(date).format("DD/MM/YYYY HH:mm")}</p>
      {proses === name && status === "PENDING" && (
        <>
          <FormInput
            data={{
              label: "Status Persetujuan",
              type: "select",
              mode: "horizontal",
              required: true,
              options: [
                { label: "PENDING", value: "PENDING" },
                { label: "TOLAK", value: "TOLAK" },
                { label: "SETUJU", value: "SETUJU" },
              ],
              value: data.status,
              onChange: (e: EStatusDapem) => setData({ ...data, status: e }),
            }}
          />
          <FormInput
            data={{
              label: "Keterangan",
              type: "textarea",
              mode: "horizontal",
              required: true,
              value: data.desc,
              onChange: (e: string) => setData({ ...data, desc: e }),
            }}
          />
          <div className="flex justify-end">
            <Button
              type="primary"
              loading={loading}
              onClick={() => handleSubmit()}
            >
              Submit
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const BerkasBerkas = ({ data }: { data: IDapem }) => {
  return (
    <div>
      <div className="flex gap-4 items-center p-2 border-b border-gray-300">
        <div className="min-w-62">
          <FileOutlined /> Berkas SLIK
        </div>
        <Button icon={<FileFilled />}></Button>
      </div>
      <div className="flex gap-4 items-center p-2 border-b border-gray-300">
        <div className="min-w-62">
          <FileOutlined /> Berkas Pengajuan
        </div>
        <Button icon={<FileFilled />}></Button>
      </div>
      <div className="flex gap-4 items-center p-2 border-b border-gray-300">
        <div className="min-w-62">
          <FileOutlined /> Berkas Akad
        </div>
        <Button icon={<FileFilled />}></Button>
      </div>
      <div className="flex gap-4 items-center p-2 border-b border-gray-300">
        <div className="min-w-62">
          <FileOutlined /> Berkas Pencairan
        </div>
        <Button icon={<FileFilled />}></Button>
      </div>
      <div className="flex gap-4 items-center p-2 border-b border-gray-300">
        <div className="min-w-62">
          <FileOutlined /> Berkas Pelunasan
        </div>
        <Button icon={<FileFilled />}></Button>
      </div>
      <div className="flex gap-4 items-center p-2 border-b border-gray-300">
        <div className="min-w-62">
          <FileOutlined /> Berkas Mutasi
        </div>
        <Button icon={<FileFilled />}></Button>
      </div>
      <div className="flex gap-4 items-center p-2 border-b border-gray-300">
        <div className="min-w-62">
          <VideoCameraOutlined /> Video Wawancara
        </div>
        <Button icon={<FileFilled />}></Button>
      </div>
      <div className="flex gap-4 items-center p-2 border-b border-gray-300">
        <div className="min-w-62">
          <VideoCameraOutlined /> Video Asuransi
        </div>
        <Button icon={<FileFilled />}></Button>
      </div>
      <div className="flex gap-4 items-center p-2 border-b border-gray-300">
        <div className="min-w-62">
          <VideoCameraOutlined /> Video Pencairan
        </div>
        <Button icon={<FileFilled />}></Button>
      </div>
    </div>
  );
};

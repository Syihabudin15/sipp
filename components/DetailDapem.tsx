"use client";

import {
  AuditOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FolderOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { IDapem } from "./IInterfaces";
import { getAngsuran, IDRFormat } from "./Utils";
import { App, Button, Card, Tabs } from "antd";
import { EStatusDapem } from "@prisma/client";
import moment from "moment";
import { FormInput } from ".";
import { useState } from "react";

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
      children: <div className="p-4 bg-white rounded-lg"></div>,
    },
    {
      key: "3",
      label: (
        <span>
          <FolderOutlined /> Berkas - Berkas
        </span>
      ),
      children: <div className="p-4 bg-white rounded-lg"></div>,
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
    </div>
  );
};

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
      />
      <ProsesStep
        currdata={data}
        status={data.slik_status}
        title="SLIK"
        desc={data.slik_desc}
        date={data.slik_date}
        proses={proses}
        name="slik"
      />
      <ProsesStep
        currdata={data}
        status={data.approv_status}
        title="APPROVAL"
        desc={data.approv_desc}
        date={data.approv_date}
        proses={proses}
        name="approv"
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
}: {
  currdata: IDapem;
  status: EStatusDapem | null;
  title: string;
  desc: string | null;
  date: Date | null;
  proses?: string;
  name: string;
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
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        const { status, msg } = res;
        if (status === 201) {
          modal.success({ content: "Update Proses Permohonan berhasil" });
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
        status && status !== "PENDING" ? "opacity-60 grayscale" : ""
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
        {title} {status && status === "PENDING" ? <ClockCircleOutlined /> : ""}{" "}
        {status && status === "SETUJU" ? <CheckCircleOutlined /> : ""}{" "}
        {status && status === "TOLAK" ? <CloseCircleOutlined /> : ""}
      </h3>
      <p>{desc}</p>
      <p>{date && moment(date).format("DD/MM/YYYY HH:mm")}</p>
      {proses === name && (
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
            <Button type="primary" loading={loading}>
              Submit
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

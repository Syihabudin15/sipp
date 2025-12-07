"use client";

import { IDapem, IDebitur, IPageProps } from "@/components/IInterfaces";
import { getAngsuran, IDRFormat } from "@/components/Utils";
import { ArrowRightOutlined, DatabaseOutlined } from "@ant-design/icons";
import { Card, Input, Select, Table, TableProps, Tag } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";

export default function Page() {
  const [pageProps, setPageProps] = useState<IPageProps<IDebitur>>({
    page: 1,
    limit: 50,
    total: 0,
    data: [],
    search: "",
    kelompok: "",
    kantor_bayar: "",
    alamat: "",
  });
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", pageProps.page.toString());
    params.append("limit", pageProps.limit.toString());
    if (pageProps.search) {
      params.append("search", pageProps.search);
    }
    if (pageProps.kelompok) {
      params.append("kelompok", pageProps.kelompok);
    }
    if (pageProps.kantor_bayar) {
      params.append("kantor_bayar", pageProps.kantor_bayar);
    }
    if (pageProps.alamat) {
      params.append("alamat", pageProps.alamat);
    }
    const res = await fetch(`/api/debitur?${params.toString()}`);
    const json = await res.json();
    setPageProps((prev) => ({
      ...prev,
      data: json.data,
      total: json.total,
    }));
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await getData();
    }, 200);
    return () => clearTimeout(timeout);
  }, [
    pageProps.page,
    pageProps.limit,
    pageProps.search,
    pageProps.kelompok,
    pageProps.kantor_bayar,
    pageProps.alamat,
  ]);

  const columns: TableProps<IDebitur>["columns"] = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      className: "text-center",
      width: 50,
      render(value, record, index) {
        return <>{(pageProps.page - 1) * pageProps.limit + index + 1}</>;
      },
    },
    {
      title: "Pemohon",
      dataIndex: "pemohon",
      key: "pemohon",
      render(value, record, index) {
        return (
          <div>
            <p>{record.nama_penerima}</p>
            <div className="text-xs opacity-70">
              <p>{record.nopen}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Tgl Lahir & Gaji",
      dataIndex: "tgl_lahir_penerima",
      key: "tgl_lahir_penerima",
      render(value, record, index) {
        return (
          <div>
            <p>{moment(value, "YYYY-MM-DD").format("DD/MM/YYYY")}</p>
            <p>{IDRFormat(record.gaji_pensiun)}</p>
          </div>
        );
      },
    },
    {
      title: "Kelompok & Pangkat",
      dataIndex: "kelompok_pensiun",
      key: "kelompok_pensiun",
      render(value, record, index) {
        return (
          <div>
            <p>{value}</p>
            <p>{record.pangkat}</p>
          </div>
        );
      },
    },
    {
      title: "Alamat",
      dataIndex: "alamat_penerima",
      key: "alamat_penerima",
      render(value, record, index) {
        return (
          <div style={{ maxWidth: 250 }} className="text-xs">
            {record.alm_peserta} {record.kelurahan} {record.kecamatan}{" "}
            {record.kota} {record.provinsi} {record.kode_pos}
          </div>
        );
      },
    },
    {
      title: "Kantor Bayar",
      dataIndex: "kantor_bayar",
      key: "kantor_bayar",
    },
    {
      title: "No Telepon",
      dataIndex: "no_telepon",
      key: "no_telepon",
    },
  ];
  return (
    <Card
      title={
        <div className="flex gap-2 font-bold text-xl">
          <DatabaseOutlined /> Database
        </div>
      }
      styles={{ body: { padding: 5 } }}
    >
      <div className="flex justify-between my-1 gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <Select
            size="small"
            placeholder="Kelompok..."
            options={[
              { label: "TASPEN", value: "TASPEN" },
              { label: "ASABRI", value: "ASABRI" },
              { label: "LAINNYA", value: "LAINNYA" },
            ]}
            onChange={(e) => setPageProps({ ...pageProps, kelompok: e })}
            allowClear
          />
          <Input.Search
            size="small"
            style={{ width: 170 }}
            placeholder="Kantor Bayar..."
            onChange={(e) =>
              setPageProps({ ...pageProps, kantor_bayar: e.target.value })
            }
          />
          <Input.Search
            size="small"
            style={{ width: 170 }}
            placeholder="Alamat..."
            onChange={(e) =>
              setPageProps({ ...pageProps, alamat: e.target.value })
            }
          />
        </div>
        <Input.Search
          size="small"
          style={{ width: 170 }}
          placeholder="Cari nama..."
          onChange={(e) =>
            setPageProps({ ...pageProps, search: e.target.value })
          }
        />
      </div>
      <Table
        columns={columns}
        dataSource={pageProps.data}
        size="small"
        loading={loading}
        rowKey={"nopen"}
        bordered
        scroll={{ x: "max-content", y: 320 }}
        pagination={{
          current: pageProps.page,
          pageSize: pageProps.limit,
          total: pageProps.total,
          onChange: (page, pageSize) => {
            setPageProps((prev) => ({
              ...prev,
              page,
              limit: pageSize,
            }));
          },
          pageSizeOptions: [50, 100, 500, 1000],
        }}
        expandable={{
          expandedRowRender: (record) => (
            <Table
              bordered
              pagination={false}
              rowKey={"id"}
              columns={columnDapem}
              dataSource={record.Dapem}
            />
          ),
          rowExpandable: (record) => record.Dapem.length !== 0,
        }}
      />
    </Card>
  );
}

const columnDapem: TableProps<IDapem>["columns"] = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 120,
  },
  {
    title: "Permohonan",
    dataIndex: "permohonan",
    key: "permohonan",
    render(value, record, index) {
      return (
        <div>
          <p>
            Plafond : <Tag color={"blue"}>{IDRFormat(record.plafond)}</Tag>
          </p>
          <p>
            Tenor : <Tag color={"blue"}>{record.tenor} Bulan</Tag>
          </p>
        </div>
      );
    },
  },
  {
    title: "Angsuran",
    dataIndex: "angsuran",
    key: "angsuran",
    render(value, record, index) {
      return (
        <div>
          <p>
            Total :{" "}
            <Tag color={"blue"}>
              {IDRFormat(
                getAngsuran(
                  record.plafond,
                  record.tenor,
                  record.margin + record.margin_sumdan,
                  record.pembulatan
                ).angsuran
              )}
            </Tag>
          </p>
          <p>
            Sumdan :{" "}
            <Tag color={"blue"}>
              {" "}
              {IDRFormat(
                getAngsuran(
                  record.plafond,
                  record.tenor,
                  record.margin_sumdan,
                  record.pembulatan
                ).angsuran
              )}
            </Tag>
          </p>
        </div>
      );
    },
  },
  {
    title: "Produk Pembiayaan",
    dataIndex: "produk",
    key: "produk",
    render(value, record, index) {
      return (
        <div>
          <p>
            {record.ProdukPembiayaan.id} {record.ProdukPembiayaan.name}
          </p>
          <p>{record.JenisPembiayaan.name}</p>
        </div>
      );
    },
  },
  {
    title: "Mutasi & Pelunasan",
    dataIndex: "produk",
    key: "produk",
    render(value, record, index) {
      return (
        <div>
          <p>
            Pelunasan Ke{" "}
            <Tag color={"blue"}>
              {record.pelunasan_ke} (
              {moment(record.pelunasan_date).format("DD/MM/YYYY")})
            </Tag>
          </p>
          <p>
            Mutasi <Tag color={"red"}>{record.mutasi_from}</Tag>{" "}
            <ArrowRightOutlined style={{ fontSize: 10 }} />{" "}
            <Tag color={"blue"}>{record.mutasi_ke}</Tag>
          </p>
        </div>
      );
    },
  },
  {
    title: "AO & UP",
    dataIndex: "aoup",
    key: "aoup",
    render(value, record, index) {
      return (
        <div>
          <p>{record.AO.fullname}</p>
          <div className="text-xs opacity-70">
            <p>{record.AO.Cabang.name}</p>
            <p>{record.AO.Cabang.Area.name}</p>
          </div>
        </div>
      );
    },
  },
  {
    title: "Status Pembiayaan",
    dataIndex: "status_final",
    key: "status_final",
    width: 200,
    render: (_, record, i) => (
      <div className="">
        <p>
          Status:{" "}
          <Tag
            color={
              record.status_final === "TRANSFER"
                ? "green"
                : record.status_final === "DRAFT"
                ? "blue"
                : record.status_final === "ANTRI"
                ? "orange"
                : record.status_final === "PROSES"
                ? "blue"
                : "red"
            }
            variant="solid"
          >
            {record.status_final}
          </Tag>
        </p>
        <p className="text-xs">
          {record.final_at
            ? moment(record.final_at).format("DD-MM-YYYY HH:mm")
            : ""}
        </p>
      </div>
    ),
  },
  {
    title: "Created",
    dataIndex: "created_at",
    key: "created_at",
    render: (date) => moment(date).format("DD-MM-YYYY"),
  },
];

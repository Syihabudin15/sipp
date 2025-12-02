"use client";

import { IActionTable, IDapem, IPageProps } from "@/components/IInterfaces";
import { getAngsuran, IDRFormat } from "@/components/Utils";
import {
  ArrowRightOutlined,
  DeleteOutlined,
  DropboxOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { App, Button, Card, Input, Modal, Table, TableProps, Tag } from "antd";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [pageProps, setPageProps] = useState<IPageProps<IDapem>>({
    page: 1,
    limit: 50,
    total: 0,
    data: [],
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<IActionTable<IDapem>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
  });
  const { modal } = App.useApp();

  const getData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", pageProps.page.toString());
    params.append("limit", pageProps.limit.toString());
    if (pageProps.search) {
      params.append("search", pageProps.search);
    }
    const res = await fetch(`/api/dapem?${params.toString()}`);
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
  }, [pageProps.page, pageProps.limit, pageProps.search]);

  const columns: TableProps<IDapem>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Pemohon",
      dataIndex: "pemohon",
      key: "pemohon",
      render(value, record, index) {
        return (
          <div>
            <p>{record.Debitur.nama_penerima}</p>
            <div className="text-xs opacity-70">
              <p>{record.Debitur.nopen}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Permohonan",
      dataIndex: "permohonan",
      key: "permohonan",
      render(value, record, index) {
        return (
          <div>
            <p>Plafond : {IDRFormat(record.plafond)}</p>
            <p>Tenor : {record.tenor} Bulan</p>
            <p>
              Angsuran :{" "}
              {IDRFormat(
                getAngsuran(
                  record.plafond,
                  record.tenor,
                  record.margin + record.margin_sumdan,
                  record.pembulatan
                ).angsuran
              )}{" "}
              Bulan
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
              Pelunasan Ke {record.pelunasan_ke} (
              {moment(record.pelunasan_date).format("DD/MM/YYYY")})
            </p>
            <p>
              Mutasi {record.mutasi_from} <ArrowRightOutlined />{" "}
              {record.mutasi_ke}
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
      title: "Status",
      dataIndex: "status_final",
      key: "status_final",
      render: (_, record, i) => (
        <Tag
          color={
            record.status_final === "TRANSFER"
              ? "success"
              : record.status_final === "DRAFT"
              ? "blue"
              : "error"
          }
        >
          {record.status_final}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => moment(date).format("DD-MM-YYYY"),
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      render: (_, record) => (
        <div className="flex gap-2">
          <Link href={`/permohonan/update/${record.id}`}>
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
            ></Button>
          </Link>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            type="primary"
            danger
            onClick={() =>
              setSelected({ ...selected, openDelete: true, selected: record })
            }
          ></Button>
        </div>
      ),
    },
  ];

  const handleDelete = async () => {
    setLoading(true);
    await fetch("/api/dapem?id=" + selected.selected?.id)
      .then((res) => res.json())
      .then(async (res) => {
        const { msg, status } = res;
        if (status !== 201) {
          modal.error({ content: msg });
        } else {
          modal.success({
            content: `Data permohonan kredit ${selected.selected?.Debitur.nama_penerima} (${selected.selected?.nopen}) berhasil dihapus`,
          });
          await getData();
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({
          content: `Internal Server Error!!. Hapus data permohonan kredit ${selected.selected?.Debitur.nama_penerima} (${selected.selected?.nopen}) gagal`,
        });
      });
    setLoading(false);
  };

  return (
    <Card
      title={
        <div className="flex gap-2 font-bold text-xl">
          <DropboxOutlined /> Permohonan Pembiayaan
        </div>
      }
      styles={{ body: { padding: 5 } }}
    >
      <div className="flex justify-between my-1">
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
        rowKey={"id"}
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
      />
      <Modal
        open={selected.openDelete}
        onCancel={() =>
          setSelected({ ...selected, openDelete: false, selected: undefined })
        }
        title={`HAPUS DAPEM ${
          selected.selected ? selected.selected.Debitur.nama_penerima : ""
        }`}
        loading={loading}
        okButtonProps={{
          danger: true,
          onClick: () => handleDelete(),
        }}
      >
        <p>
          Konfirmasi hapus data pembiayaan ini *
          {selected.selected ? selected.selected.Debitur.nama_penerima : ""}* ?
        </p>
      </Modal>
    </Card>
  );
}

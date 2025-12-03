"use client";

import { IActionTable, IDapem, IPageProps } from "@/components/IInterfaces";
import { IDRFormat } from "@/components/Utils";
import {
  DeleteOutlined,
  DropboxOutlined,
  EditOutlined,
  PlusCircleFilled,
  SendOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Input,
  Modal,
  Table,
  TableProps,
  Tag,
  Tooltip,
} from "antd";
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
  const [selected, setSelected] = useState<IActionTable<IDapem>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
  });
  const { modal } = App.useApp();
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", pageProps.page.toString());
    params.append("limit", pageProps.limit.toString());
    params.append("status_final", "DRAFT");
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
      width: 120,
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
      width: 100,
      render: (_, record, i) => (
        <div className="flex justify-center">
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
        </div>
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
          <Link href={"/permohonan/update/" + record.id}>
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
          <Tooltip title={"Ajukan permohonan kredit ini?"}>
            <Button
              type="primary"
              icon={<SendOutlined />}
              size="small"
              onClick={() =>
                setSelected({ ...selected, openUpsert: true, selected: record })
              }
            ></Button>
          </Tooltip>
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

  const handleSend = async () => {
    setLoading(true);
    if (!selected.selected) {
      modal.error({ content: "Maaf tidak ada data yg dipilih!" });
    }
    await fetch("/api/dapem", {
      method: "PUT",
      body: JSON.stringify({
        ...selected.selected,
        status_final: "ANTRI",
        verif_status: "PENDING",
      }),
    })
      .then((res) => res.json())
      .then(async (res) => {
        const { msg, status } = res;
        if (status !== 201) {
          modal.error({ content: msg });
        } else {
          modal.success({
            content: `Data permohonan kredit ${selected.selected?.Debitur.nama_penerima} (${selected.selected?.nopen}) berhasil diajukan`,
          });
          setSelected({ ...selected, openUpsert: false, selected: undefined });
          await getData();
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({
          content: `Internal Server Error!!. Pengajuan data permohonan kredit ${selected.selected?.Debitur.nama_penerima} (${selected.selected?.nopen}) gagal`,
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
        <Link href={"/permohonan/create"}>
          <Button size="small" type="primary" icon={<PlusCircleFilled />}>
            Add New
          </Button>
        </Link>
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
        <p className="text-red-500">
          Konfirmasi hapus data permohonan kredit ini *
          {selected.selected ? selected.selected.Debitur.nama_penerima : ""}* ?
        </p>
      </Modal>
      <Modal
        open={selected.openUpsert}
        onCancel={() =>
          setSelected({ ...selected, openUpsert: false, selected: undefined })
        }
        title={`AJUKAN PERMOHONAN KREDIT ${
          selected.selected ? selected.selected.Debitur.nama_penerima : ""
        }`}
        loading={loading}
        okButtonProps={{
          onClick: () => handleSend(),
        }}
      >
        <p>
          Konfirmasi pengajuan Permohonan kredit ini *
          {selected.selected ? selected.selected.Debitur.nama_penerima : ""}* ?
        </p>
      </Modal>
    </Card>
  );
}

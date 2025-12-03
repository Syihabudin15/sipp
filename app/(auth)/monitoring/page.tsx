"use client";

import { IActionTable, IDapem, IPageProps } from "@/components/IInterfaces";
import { IDRFormat } from "@/components/Utils";
import {
  ArrowRightOutlined,
  DeleteOutlined,
  DropboxOutlined,
  EditOutlined,
  FolderOutlined,
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
  Typography,
} from "antd";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
const { Paragraph } = Typography;

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
              <ArrowRightOutlined />{" "}
              <Tag color={"success"}>{record.mutasi_ke}</Tag>
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
      title: "Status VERIFIKASI",
      dataIndex: "verif_status",
      key: "verif_status",
      width: 200,
      render: (_, record, i) => (
        <div>
          <p>
            Status :{" "}
            <Tag
              color={
                record.verif_status === "SETUJU"
                  ? "green-inverse"
                  : record.verif_status === "PENDING"
                  ? "orange-inverse"
                  : "red-inverse"
              }
            >
              {record.verif_status}
            </Tag>
          </p>
          <Paragraph
            ellipsis={{
              rows: 2,
              expandable: "collapsible",
            }}
            style={{ fontSize: 11 }}
          >
            Keterangan{" "}
            {record.verif_date
              ? `(${moment(record.verif_date).format("DD-MM-YYYY HH:mm")})`
              : ""}{" "}
            : {record.verif_desc}
          </Paragraph>
        </div>
      ),
    },
    {
      title: "Status SLIK",
      dataIndex: "slik_status",
      key: "slik_status",
      width: 200,
      render: (_, record, i) => (
        <div>
          <p>
            Status :{" "}
            <Tag
              color={
                record.slik_status === "SETUJU"
                  ? "green-inverse"
                  : record.slik_status === "PENDING"
                  ? "orange-inverse"
                  : "red-inverse"
              }
            >
              {record.slik_status}
            </Tag>
          </p>
          <Paragraph
            ellipsis={{
              rows: 2,
              expandable: "collapsible",
            }}
            style={{ fontSize: 11 }}
          >
            Keterangan{" "}
            {record.slik_date
              ? `(${moment(record.slik_date).format("DD-MM-YYYY HH:mm")})`
              : ""}{" "}
            : {record.slik_desc}
          </Paragraph>
        </div>
      ),
    },
    {
      title: "Status APPROVAL",
      dataIndex: "approv_status",
      key: "approv_status",
      width: 200,
      render: (_, record, i) => (
        <div>
          <p>
            Status :{" "}
            <Tag
              color={
                record.approv_status === "SETUJU"
                  ? "green-inverse"
                  : record.approv_status === "PENDING"
                  ? "orange-inverse"
                  : "red-inverse"
              }
            >
              {record.approv_status}
            </Tag>
          </p>
          <Paragraph
            ellipsis={{
              rows: 2,
              expandable: "collapsible",
            }}
            style={{ fontSize: 11 }}
          >
            Keterangan{" "}
            {record.approv_date
              ? `(${moment(record.approv_date).format("DD-MM-YYYY HH:mm")})`
              : ""}{" "}
            : {record.approv_desc}
          </Paragraph>
        </div>
      ),
    },
    {
      title: "Status Pencairan",
      dataIndex: "status_final",
      key: "status_final",
      width: 180,
      render: (_, record, i) => (
        <div className="">
          <p>
            Status:{" "}
            <Tag
              color={
                record.status_final === "TRANSFER"
                  ? "green-inverse"
                  : record.status_final === "DRAFT"
                  ? "blue-inverse"
                  : record.status_final === "ANTRI"
                  ? "orange-inverse"
                  : "red-inverse"
              }
            >
              {record.status_final}
            </Tag>
          </p>
          <p>
            Tanggal:{" "}
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
          <Link href={"/monitoring/" + record.id}>
            <Tooltip
              title={`Detail Data ${record.Debitur.nama_penerima} (${record.nopen})`}
            >
              <Button
                icon={<FolderOutlined />}
                type="primary"
                size="small"
              ></Button>
            </Tooltip>
          </Link>
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

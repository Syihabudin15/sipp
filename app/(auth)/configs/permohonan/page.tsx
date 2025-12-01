"use client";

import { IDapem, IPageProps } from "@/components/IInterfaces";
import { IDRFormat } from "@/components/Utils";
import {
  DeleteOutlined,
  DropboxOutlined,
  EditOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";
import { Button, Card, Input, Table, TableProps, Tag } from "antd";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [pageProps, setPageProps] = useState<IPageProps<IDapem>>({
    page: 1,
    limit: 10,
    total: 0,
    data: [],
    search: "",
  });
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
          <Button icon={<EditOutlined />} size="small" type="primary"></Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            type="primary"
            danger
          ></Button>
        </div>
      ),
    },
  ];

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
    </Card>
  );
}

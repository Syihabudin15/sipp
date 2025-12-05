"use client";

import { IDapem, IPageProps } from "@/components/IInterfaces";
import { IDRFormat } from "@/components/Utils";
import { useAccess } from "@/lib/Permission";
import {
  ArrowRightOutlined,
  DropboxOutlined,
  FormOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Input,
  Select,
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
const { RangePicker } = DatePicker;

export default function Page() {
  const [pageProps, setPageProps] = useState<IPageProps<IDapem>>({
    page: 1,
    limit: 50,
    total: 0,
    data: [],
    search: "",
    backdate: "",
    verif_status: "all",
  });
  const [loading, setLoading] = useState(false);
  const { hasAccess } = useAccess("/proses/verif");

  const getData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", pageProps.page.toString());
    params.append("limit", pageProps.limit.toString());
    if (pageProps.search) {
      params.append("search", pageProps.search);
    }
    if (pageProps.verif_status) {
      params.append("verif_status", pageProps.verif_status);
    } else {
      params.append("verif_status", "all");
    }
    if (pageProps.backdate) {
      params.append("backdate", pageProps.backdate);
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
  }, [
    pageProps.page,
    pageProps.limit,
    pageProps.search,
    pageProps.verif_status,
    pageProps.backdate,
  ]);

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
      width: 250,
      render: (_, record, i) => (
        <div>
          <p>
            Status :{" "}
            <Tag
              color={
                record.verif_status === "SETUJU"
                  ? "green"
                  : record.verif_status === "PENDING"
                  ? "orange"
                  : "red"
              }
              variant="solid"
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
          {hasAccess("proses") && (
            <Link href={"/proses/approv/" + record.id}>
              <Tooltip
                title={`Proses Data ${record.Debitur.nama_penerima} (${record.nopen})`}
              >
                <Button
                  icon={<FormOutlined />}
                  type="primary"
                  size="small"
                  disabled={record.verif_status !== "PENDING"}
                ></Button>
              </Tooltip>
            </Link>
          )}
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
      <div className="flex justify-between my-1 gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <RangePicker
            size="small"
            onChange={(date, dateStr) =>
              setPageProps({ ...pageProps, backdate: dateStr })
            }
          />
          <Select
            size="small"
            placeholder="Pilih Status..."
            options={[
              { label: "PENDING", value: "PENDING" },
              { label: "SETUJU", value: "SETUJU" },
              { label: "TOLAK", value: "TOLAK" },
            ]}
            onChange={(e) => setPageProps({ ...pageProps, verif_status: e })}
            allowClear
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

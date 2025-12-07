"use client";

import { FormInput, ViewFiles } from "@/components";
import { useUser } from "@/components/contexts/UserContext";
import {
  IActionTable,
  IDapem,
  IPageProps,
  IViewFiles,
} from "@/components/IInterfaces";
import { IDRFormat } from "@/components/Utils";
import { useAccess } from "@/lib/Permission";
import {
  ArrowRightOutlined,
  EditOutlined,
  FileFilled,
  FolderOpenFilled,
  FolderOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Sumdan } from "@prisma/client";
import {
  App,
  Button,
  Card,
  DatePicker,
  Input,
  Modal,
  Select,
  Table,
  TableProps,
  Tag,
  Tooltip,
} from "antd";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
const { RangePicker } = DatePicker;

export default function Page() {
  const [pageProps, setPageProps] = useState<IPageProps<IDapem>>({
    page: 1,
    limit: 50,
    total: 0,
    data: [],
    search: "",
    sumdanId: "",
    mutasi_status: "",
    pelunasan_status: "",
    backdate: "",
  });
  const [action, setAction] = useState<IActionTable<IDapem>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
  });
  const [views, setViews] = useState<IViewFiles>({
    open: false,
    data: [],
  });
  const [loading, setLoading] = useState(false);

  const [sumdans, setSumdans] = useState<Sumdan[]>([]);
  const { modal } = App.useApp();
  const { hasAccess } = useAccess("/after-dropping");
  const user = useUser();

  const getData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", pageProps.page.toString());
    params.append("limit", pageProps.limit.toString());
    params.append("approv_status", "SETUJU");

    if (pageProps.search) {
      params.append("search", pageProps.search);
    }
    if (pageProps.sumdanId) {
      params.append("sumdanId", pageProps.sumdanId);
    }
    if (pageProps.mutasi_status) {
      params.append("mutasi_status", pageProps.mutasi_status);
    }
    if (pageProps.pelunasan_status) {
      params.append("pelunasan_status", pageProps.pelunasan_status);
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
    pageProps.sumdanId,
    pageProps.backdate,
    pageProps.mutasi_status,
    pageProps.pelunasan_status,
  ]);

  useEffect(() => {
    (async () => {
      await fetch("/api/sumdan")
        .then((res) => res.json())
        .then((res) => setSumdans(res.data));
    })();
  }, []);

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
            {record.JenisPembiayaan.status_pelunasan && (
              <p>
                Pelunasan Ke{" "}
                <Tag color={"blue"}>
                  {record.pelunasan_ke} (
                  {moment(record.pelunasan_date).format("DD/MM/YYYY")})
                </Tag>
              </p>
            )}
            {record.JenisPembiayaan.status_mutasi && (
              <p>
                Mutasi <Tag color={"red"}>{record.mutasi_from}</Tag>{" "}
                <ArrowRightOutlined style={{ fontSize: 10 }} />{" "}
                <Tag color={"blue"}>{record.mutasi_ke}</Tag>
              </p>
            )}
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
      title: "Status Takeover",
      dataIndex: "pelunasan_status",
      key: "pelunasan_status",
      width: 200,
      render: (_, record, i) => (
        <div className="">
          <p>
            Status:{" "}
            <Tag
              color={
                record.pelunasan_status === "SETUJU"
                  ? "green"
                  : record.pelunasan_status === "PENDING"
                  ? "blue"
                  : record.pelunasan_status === "DRAFT"
                  ? "orange"
                  : "red"
              }
              variant="solid"
            >
              {record.pelunasan_status === "SETUJU"
                ? "SELESAI"
                : record.pelunasan_status === "PENDING"
                ? "PROSES"
                : record.pelunasan_status === "DRAFT"
                ? "PENDING"
                : "GAGAL"}
            </Tag>
          </p>
          <p className="text-xs italic">
            {record.pelunasan_date
              ? moment(record.pelunasan_date).format("DD-MM-YYYY")
              : ""}
          </p>
        </div>
      ),
    },
    {
      title: "Status Mutasi",
      dataIndex: "mutasi_status",
      key: "mutasi_status",
      width: 200,
      render: (_, record, i) => (
        <div className="">
          <p>
            Status:{" "}
            <Tag
              color={
                record.mutasi_status === "SETUJU"
                  ? "green"
                  : record.mutasi_status === "PENDING"
                  ? "blue"
                  : record.mutasi_status === "DRAFT"
                  ? "orange"
                  : "red"
              }
              variant="solid"
            >
              {record.mutasi_status === "SETUJU"
                ? "SELESAI"
                : record.mutasi_status === "PENDING"
                ? "PROSES"
                : record.mutasi_status === "DRAFT"
                ? "PENDING"
                : "GAGAL"}
            </Tag>
          </p>
          <p className="text-xs italic">
            {record.mutasi_date
              ? moment(record.mutasi_date).format("DD-MM-YYYY")
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
          {hasAccess("update") && (
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() =>
                setAction({ ...action, openUpsert: true, selected: record })
              }
            ></Button>
          )}
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
          <Tooltip title={"Berkas Berkas Pembiayaan"}>
            <Button
              size="small"
              icon={<FileFilled />}
              onClick={() =>
                setViews({
                  open: true,
                  data: [
                    { name: "Berkas SLIK", url: record.file_slik || "" },
                    {
                      name: "Berkas Permohonan",
                      url: record.file_pengajuan || "",
                    },
                    {
                      name: "Video Wawancara",
                      url: record.file_wawancara || "",
                    },
                    { name: "Video Asuransi", url: record.file_asuransi || "" },
                    { name: "Berkas Akad", url: record.file_akad || "" },
                    {
                      name: "Berkas Pelunasan",
                      url: record.file_pelunasan || "",
                    },
                    { name: "Berkas Mutasi", url: record.file_mutasi || "" },
                    {
                      name: "Berkas Pencairan",
                      url: record.file_pencairan || "",
                    },
                    {
                      name: "Video Pencairan",
                      url: record.video_pencairan || "",
                    },
                    {
                      name: "Video Pencairan 2",
                      url: record.video_pencairan2 || "",
                    },
                    {
                      name: "Video Pencairan 3",
                      url: record.video_pencairan3 || "",
                    },
                  ],
                })
              }
            ></Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleSubmit = async () => {
    if (!action.selected) return;
    setLoading(true);
    const {
      PenyerahanBerkas,
      PenyerahanJaminan,
      penyerahanBerkasId,
      penyerahanJaminanId,
      ...saved
    } = action.selected;
    await fetch("/api/dapem?id=" + action.selected.id, {
      method: "PUT",
      body: JSON.stringify(saved),
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
    <Card
      title={
        <div className="flex gap-2 font-bold text-xl">
          <SwapOutlined /> Mutasi & Takeover
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
          {user && !user.sumdanId && (
            <Select
              size="small"
              placeholder="Pilih Sumdan..."
              options={sumdans.map((s) => ({ label: s.code, value: s.id }))}
              onChange={(e) => setPageProps({ ...pageProps, sumdanId: e })}
              allowClear
            />
          )}
          <Select
            size="small"
            placeholder="Status Takeover..."
            options={[
              { label: "PENDING", value: "DRAFT" },
              { label: "PROSES", value: "PENDING" },
              { label: "SELESAI", value: "SETUJU" },
            ]}
            onChange={(e) =>
              setPageProps({ ...pageProps, pelunasan_status: e })
            }
            allowClear
          />
          <Select
            size="small"
            placeholder="Status Mutasi..."
            options={[
              { label: "PENDING", value: "DRAFT" },
              { label: "PROSES", value: "PENDING" },
              { label: "SELESAI", value: "SETUJU" },
            ]}
            onChange={(e) => setPageProps({ ...pageProps, mutasi_status: e })}
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
      {action.selected && (
        <Modal
          title={`UPDATE MUTASI/TAKEOVER ${action.selected.Debitur.nama_penerima} (${action.selected.nopen})`}
          open={action.openUpsert}
          key={action.selected.id || "create"}
          onCancel={() =>
            setAction({ ...action, openUpsert: false, selected: undefined })
          }
          okButtonProps={{
            disabled: !action.selected,
            loading: loading,
            onClick: () => handleSubmit(),
          }}
        >
          <FormInput
            data={{
              label: "Status Takeover",
              type: "select",
              required: true,
              value: action.selected.pelunasan_status,
              onChange: (e: any) =>
                setAction({
                  ...action,
                  selected: {
                    ...action.selected,
                    pelunasan_status: e,
                  } as IDapem,
                }),
              options: [
                { label: "PENDING", value: "DRAFT" },
                { label: "PROSES", value: "PENDING" },
                { label: "SELESAI", value: "SETUJU" },
              ],
            }}
          />
          <FormInput
            data={{
              label: "Tanggal Takeover",
              type: "date",
              required: true,
              value: moment(action.selected.pelunasan_date).format(
                "YYYY-MM-DD"
              ),
              onChange: (e: any) =>
                setAction({
                  ...action,
                  selected: {
                    ...action.selected,
                    pelunasan_date: !isNaN(new Date(e).getTime())
                      ? moment(e).toDate()
                      : null,
                  } as IDapem,
                }),
            }}
          />
          <FormInput
            data={{
              label: "Status Mutasi",
              type: "select",
              required: true,
              value: action.selected.mutasi_status,
              onChange: (e: any) =>
                setAction({
                  ...action,
                  selected: {
                    ...action.selected,
                    mutasi_status: e,
                  } as IDapem,
                }),
              options: [
                { label: "PENDING", value: "DRAFT" },
                { label: "PROSES", value: "PENDING" },
                { label: "SELESAI", value: "SETUJU" },
              ],
            }}
          />
          <FormInput
            data={{
              label: "Tanggal Mutasi",
              type: "date",
              required: true,
              value: moment(action.selected.mutasi_date).format("YYYY-MM-DD"),
              onChange: (e: any) =>
                setAction({
                  ...action,
                  selected: {
                    ...action.selected,
                    mutasi_date: !isNaN(new Date(e).getTime())
                      ? moment(e).toDate()
                      : null,
                  } as IDapem,
                }),
            }}
          />
        </Modal>
      )}
      <ViewFiles
        setOpen={(v: boolean) => setViews({ ...views, open: v })}
        data={{ ...views }}
      />
    </Card>
  );
}

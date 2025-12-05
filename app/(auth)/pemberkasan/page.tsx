"use client";

import { FormInput } from "@/components";
import {
  IActionTable,
  IDapem,
  IPageProps,
  IPemberkasan,
} from "@/components/IInterfaces";
import { IDRFormat } from "@/components/Utils";
import { useAccess } from "@/lib/Permission";
import {
  ArrowRightOutlined,
  EditOutlined,
  FolderOpenFilled,
  FolderOutlined,
} from "@ant-design/icons";
import { JenisPembiayaan, Sumdan } from "@prisma/client";
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
  const [pageProps, setPageProps] = useState<IPageProps<IPemberkasan>>({
    page: 1,
    limit: 50,
    total: 0,
    data: [],
    search: "",
    sumdanId: "",
    berkas_status: "",
    jaminan_status: "",
    backdate: "",
  });
  const [action, setAction] = useState<IActionTable<IPemberkasan>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
  });
  const [loading, setLoading] = useState(false);

  const [sumdans, setSumdans] = useState<Sumdan[]>([]);
  const [jeniss, setJeniss] = useState<JenisPembiayaan[]>([]);
  const { modal } = App.useApp();
  const { hasAccess } = useAccess("/pemberkasan");

  const getData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", pageProps.page.toString());
    params.append("limit", pageProps.limit.toString());
    if (pageProps.search) {
      params.append("search", pageProps.search);
    }
    if (pageProps.sumdanId) {
      params.append("sumdanId", pageProps.sumdanId);
    }
    if (pageProps.approv_status) {
      params.append("approv_status", "SETUJU");
    }
    if (pageProps.berkas_status) {
      params.append("berkas_status", pageProps.berkas_status);
    }
    if (pageProps.jaminan_status) {
      params.append("jaminan_status", pageProps.jaminan_status);
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
    pageProps.berkas_status,
    pageProps.jaminan_status,
  ]);

  useEffect(() => {
    (async () => {
      await fetch("/api/sumdan")
        .then((res) => res.json())
        .then((res) => setSumdans(res.data));
      await fetch("/api/jenis")
        .then((res) => res.json())
        .then((res) => setJeniss(res.data));
    })();
  }, []);

  const columns: TableProps<IPemberkasan>["columns"] = [
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
      width: 200,
      render(value, record, index) {
        return (
          <div>
            <p>{record.id}</p>
            <p className="opacity-70 italic text-xs">
              PK : {record.akad_nomor}
            </p>
          </div>
        );
      },
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
      title: "Status DROPPING",
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
          <p className="text-xs italic">
            Tanggal:{" "}
            {record.final_at
              ? moment(record.final_at).format("DD-MM-YYYY HH:mm")
              : ""}
          </p>
        </div>
      ),
    },
    {
      title: "Status Berkas",
      dataIndex: "berkas",
      key: "berkas",
      width: 200,
      render: (_, record, i) => (
        <div className="">
          <p>
            Status:{" "}
            <Tag
              color={
                record.berkas_status === "CABANG" ||
                record.berkas_status === "PUSAT"
                  ? "orange"
                  : record.berkas_status === "SENDING"
                  ? "blue"
                  : "green"
              }
              variant="solid"
            >
              {record.berkas_status}
            </Tag>
          </p>
          <p className="text-xs italic">
            Tanggal:{" "}
            {record.PenyerahanBerkas && record.PenyerahanBerkas.berkas_date
              ? moment(record.PenyerahanBerkas.berkas_date).format(
                  "DD-MM-YYYY HH:mm"
                )
              : record.PenyerahanBerkas
              ? moment(record.PenyerahanBerkas.created_at).format(
                  "DD/MM/YYYY HH:mm"
                )
              : "-"}
          </p>
        </div>
      ),
    },
    {
      title: "Status Jaminan",
      dataIndex: "jaminan",
      key: "jaminan",
      width: 200,
      render: (_, record, i) => (
        <div className="">
          <p>
            Status:{" "}
            <Tag
              color={
                record.jaminan_status === "CABANG" ||
                record.jaminan_status === "PUSAT"
                  ? "orange"
                  : record.jaminan_status === "SENDING"
                  ? "blue"
                  : "green"
              }
              variant="solid"
            >
              {record.jaminan_status}
            </Tag>
          </p>
          <p className="text-xs italic">
            Tanggal:{" "}
            {record.PenyerahanJaminan && record.PenyerahanJaminan.jaminan_date
              ? moment(record.PenyerahanJaminan.jaminan_date).format(
                  "DD-MM-YYYY HH:mm"
                )
              : record.PenyerahanJaminan
              ? moment(record.PenyerahanJaminan.created_at).format(
                  "DD/MM/YYYY HH:mm"
                )
              : "-"}
          </p>
        </div>
      ),
    },
    {
      title: "Status TBO",
      dataIndex: "tbo",
      key: "tbo",
      width: 200,
      render: (_, record, i) => {
        const tbo = moment(record.created_at).add(record.tbo, "month");
        const now = moment();
        const status = now.isAfter(tbo) && !record.penyerahanJaminanId;
        return (
          <div className="">
            <p>
              Status:{" "}
              <Tag
                color={
                  status
                    ? "red"
                    : record.jaminan_status === "CABANG" ||
                      record.jaminan_status === "PUSAT"
                    ? "orange"
                    : record.jaminan_status === "SENDING"
                    ? "blue"
                    : "green"
                }
                variant="solid"
              >
                {status
                  ? "LEWAT TBO"
                  : record.jaminan_status === "SUMDAN"
                  ? "OK"
                  : "MASA TBO"}
              </Tag>
            </p>
            <p className="text-xs italic">
              Tgl TBO: {tbo.format("DD/MM/YYYY")}
            </p>
          </div>
        );
      },
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
          <FolderOpenFilled /> Berkas Pembiayaan
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
            placeholder="Pilih Sumdan..."
            options={sumdans.map((s) => ({ label: s.code, value: s.id }))}
            onChange={(e) => setPageProps({ ...pageProps, sumdanId: e })}
            allowClear
          />
          <Select
            size="small"
            placeholder="Status Berkas..."
            options={[
              { label: "CABANG", value: "CABANG" },
              { label: "PUSAT", value: "PUSAT" },
              { label: "SENDING", value: "SENDING" },
              { label: "SUMDAN", value: "SUMDAN" },
            ]}
            onChange={(e) => setPageProps({ ...pageProps, berkas_status: e })}
            allowClear
          />
          <Select
            size="small"
            placeholder="Status Jaminan..."
            options={[
              { label: "CABANG", value: "CABANG" },
              { label: "PUSAT", value: "PUSAT" },
              { label: "SENDING", value: "SENDING" },
              { label: "SUMDAN", value: "SUMDAN" },
            ]}
            onChange={(e) => setPageProps({ ...pageProps, jaminan_status: e })}
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
          title={`UPDATE BERKAS ${action.selected.Debitur.nama_penerima} (${action.selected.nopen})`}
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
              label: "Status Berkas",
              type: "select",
              required: true,
              value: action.selected.berkas_status,
              onChange: (e: any) =>
                setAction({
                  ...action,
                  selected: {
                    ...action.selected,
                    berkas_status: e,
                  } as IPemberkasan,
                }),
              options: [
                { label: "SENDING", value: "SENDING" },
                { label: "CABANG", value: "CABANG" },
                { label: "PUSAT", value: "PUSAT" },
                { label: "SUMDAN", value: "SUMDAN" },
              ],
            }}
          />
          <FormInput
            data={{
              label: "Tanggal Terima Berkas",
              type: "date",
              disabled: true,
            }}
          />
          <FormInput
            data={{
              label: "Status Jaminan",
              type: "select",
              required: true,
              value: action.selected.jaminan_status,
              onChange: (e: any) =>
                setAction({
                  ...action,
                  selected: {
                    ...action.selected,
                    jaminan_status: e,
                  } as IPemberkasan,
                }),
              options: [
                { label: "SENDING", value: "SENDING" },
                { label: "CABANG", value: "CABANG" },
                { label: "PUSAT", value: "PUSAT" },
                { label: "SUMDAN", value: "SUMDAN" },
              ],
            }}
          />
          <FormInput
            data={{
              label: "Tanggal Terima Jaminan",
              type: "date",
              disabled: true,
            }}
          />
        </Modal>
      )}
    </Card>
  );
}

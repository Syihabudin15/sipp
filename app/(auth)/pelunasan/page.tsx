"use client";

import { FormInput, ViewFiles } from "@/components";
import {
  IActionTable,
  IDapem,
  IPageProps,
  IPelunasan,
  IViewFiles,
} from "@/components/IInterfaces";
import { getAngsuran, IDRFormat, IDRToNumber } from "@/components/Utils";
import { useAccess } from "@/lib/Permission";
import {
  FileFilled,
  FormOutlined,
  MoneyCollectOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { EStatusBerkas, EStatusFinal, Sumdan } from "@prisma/client";
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
import { HookAPI } from "antd/es/modal/useModal";
import moment from "moment";
import { useEffect, useState } from "react";
const { RangePicker } = DatePicker;

export default function Page() {
  const [pageProps, setPageProps] = useState<IPageProps<IPelunasan>>({
    page: 1,
    limit: 50,
    total: 0,
    data: [],
    search: "",
    sumdanId: "",
    status_final: "",
    status_jaminan: "",
    alasan: "",
    backdate: "",
  });
  const [action, setAction] = useState<IActionTable<IPelunasan>>({
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
  const [dapems, setDapems] = useState<IDapem[]>([]);
  const { modal } = App.useApp();
  const { hasAccess } = useAccess("/pelunasan");

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
    if (pageProps.status_final) {
      params.append("status_final", pageProps.status_final);
    }
    if (pageProps.status_jaminan) {
      params.append("status_jaminan", pageProps.status_jaminan);
    }
    if (pageProps.alasan) {
      params.append("alasan", pageProps.alasan);
    }
    if (pageProps.backdate) {
      params.append("backdate", pageProps.backdate);
    }
    const res = await fetch(`/api/pelunasan?${params.toString()}`);
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
    pageProps.status_final,
    pageProps.status_jaminan,
    pageProps.alasan,
  ]);

  useEffect(() => {
    (async () => {
      await fetch("/api/sumdan")
        .then((res) => res.json())
        .then((res) => setSumdans(res.data));
      await fetch("/api/dapem?limit=100000&final_status=TRANSFER")
        .then((res) => res.json())
        .then((res) => setDapems(res.data));
    })();
  }, []);

  const columns: TableProps<IPelunasan>["columns"] = [
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
              DapemId: {record.dapemId}
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
            <p>{record.Dapem.Debitur.nama_penerima}</p>
            <div className="text-xs opacity-70">
              <p>{record.Dapem.Debitur.nopen}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Pembiayaan",
      dataIndex: "pembiayaan",
      key: "pembiayaan",
      render(value, record, index) {
        return (
          <div>
            <p>
              Plafond:{" "}
              <Tag color={"blue"}>{IDRFormat(record.Dapem.plafond)}</Tag>
            </p>
            <p>
              Tenor: <Tag color={"blue"}>{record.Dapem.tenor} Bulan</Tag>
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
            <Tag color={"blue"}>
              {IDRFormat(
                getAngsuran(
                  record.Dapem.plafond,
                  record.Dapem.tenor,
                  record.Dapem.margin + record.Dapem.margin_sumdan,
                  record.Dapem.pembulatan
                ).angsuran
              )}
            </Tag>
            <Tag color={"blue"} style={{ marginLeft: 2 }}>
              Ke 1
            </Tag>
            <p className="text-xs opacity-70 italic">
              Sisa Pokok:{" "}
              {IDRFormat(
                record.Dapem.Angsuran.filter(
                  (a) => a.tgl_bayar === null
                ).reduce((acc, curr) => acc + curr.pokok, 0)
              )}
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
              {record.Dapem.ProdukPembiayaan.id}{" "}
              {record.Dapem.ProdukPembiayaan.name}
            </p>
            <p>{record.Dapem.JenisPembiayaan.name}</p>
          </div>
        );
      },
    },
    {
      title: "Status Jaminan",
      dataIndex: "jaminan",
      key: "jaminan",
      render: (_, record, i) => (
        <div className="">
          <Tag
            color={
              ["CABANG", "PUSAT", "DEBITUR"].includes(record.status_jaminan)
                ? "green"
                : record.status_jaminan === "SENDING"
                ? "blue"
                : "orange"
            }
            variant="solid"
          >
            {record.status_jaminan}
          </Tag>
        </div>
      ),
    },
    {
      title: "Status Pelunasan",
      dataIndex: "status_final",
      key: "status_final",
      width: 200,
      render: (_, record, i) => (
        <div className="">
          <p>
            Status:{" "}
            <Tag
              color={
                record.status_final === "LUNAS"
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
            {record.pelunasan_date
              ? moment(record.pelunasan_date).format("DD-MM-YYYY HH:mm")
              : ""}
          </p>
        </div>
      ),
    },
    {
      title: "Alasan",
      dataIndex: "alasan",
      key: "alasan",
      render(value, record, index) {
        return <Tag color={"blue"}>{value}</Tag>;
      },
    },
    {
      title: "Nominal Pelunasan",
      dataIndex: "pembiayaan",
      key: "pembiayaan",
      render(value, record, index) {
        return (
          <div>
            <p>
              <Tag color={"blue"}>{IDRFormat(record.nominal)}</Tag>
            </p>
            <p>
              Sumdan:{" "}
              <Tag color={"blue"}>{IDRFormat(record.nominal_sumdan)}</Tag>
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
          {(hasAccess("update") || hasAccess("proses")) && (
            <Button
              size="small"
              type="primary"
              icon={<FormOutlined />}
              onClick={() =>
                setAction({ ...action, openUpsert: true, selected: record })
              }
            ></Button>
          )}
          {(hasAccess("update") || hasAccess("write")) && (
            <Button
              size="small"
              type="primary"
              icon={<PrinterOutlined />}
            ></Button>
          )}
          <Tooltip title={"Berkas Pelunasan"}>
            <Button
              size="small"
              icon={<FileFilled />}
              disabled={!record.file_pelunasan}
              onClick={() =>
                setViews({
                  open: true,
                  data: [
                    {
                      name: "Permohonan Pelunasan",
                      url: record.file_pelunasan || "",
                    },
                    { name: "Bukti Pelunasan", url: record.file_proof || "" },
                  ],
                })
              }
            ></Button>
          </Tooltip>
        </div>
      ),
    },
  ];
  return (
    <Card
      title={
        <div className="flex gap-2 font-bold text-xl">
          <MoneyCollectOutlined /> Pelunasan Debitur
        </div>
      }
      styles={{ body: { padding: 5 } }}
    >
      <div className="flex justify-between my-1 gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <Button
            icon={<PlusCircleOutlined />}
            size="small"
            type="primary"
            onClick={() =>
              setAction({ ...action, openUpsert: true, selected: undefined })
            }
          >
            Add New
          </Button>
          <RangePicker
            size="small"
            onChange={(date, dateStr) =>
              setPageProps({ ...pageProps, backdate: dateStr })
            }
          />
          {hasAccess("update") && (
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
            placeholder="Status Jaminan..."
            options={[
              { label: "CABANG", value: "CABANG" },
              { label: "PUSAT", value: "PUSAT" },
              { label: "SENDING", value: "SENDING" },
              { label: "SUMDAN", value: "SUMDAN" },
            ]}
            onChange={(e) => setPageProps({ ...pageProps, status_jaminan: e })}
            allowClear
          />
          <Select
            size="small"
            placeholder="Status Pelunasan..."
            options={[
              { label: "ANTRI", value: "ANTRI" },
              { label: "PROSES", value: "PROSES" },
              { label: "LUNAS", value: "LUNAS" },
            ]}
            onChange={(e) => setPageProps({ ...pageProps, status_final: e })}
            allowClear
          />
          <Select
            size="small"
            placeholder="Alasan Pelunasan..."
            options={[
              { label: "MENINGGAL DUNIA", value: "MENINGGAL DUNIA" },
              { label: "PELUNASAN LEPAS", value: "PELUNASAN LEPAS" },
              { label: "JATUH TEMPO", value: "JATUH TEMPO" },
              { label: "PERMOHONAN DEBITUR", value: "PERMOHONAN DEBITUR" },
              { label: "LAINNYA", value: "LAINNYA" },
            ]}
            onChange={(e) => setPageProps({ ...pageProps, alasan: e })}
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
      <UpsertPelunasan
        open={action.openUpsert}
        setOpen={(v: boolean) => setAction({ ...action, openUpsert: v })}
        record={action.selected}
        dapems={dapems}
        hasAccess={hasAccess}
        modal={modal}
        getData={getData}
        key={action.selected ? action.selected.id : "create"}
      />
      <ViewFiles
        setOpen={(v: boolean) => setViews({ ...views, open: v })}
        data={{ ...views }}
      />
    </Card>
  );
}

const UpsertPelunasan = ({
  open,
  setOpen,
  record,
  dapems,
  hasAccess,
  modal,
  getData,
}: {
  open: boolean;
  setOpen: Function;
  record?: IPelunasan;
  dapems: IDapem[];
  hasAccess: Function;
  modal: HookAPI;
  getData: Function;
}) => {
  const [data, setData] = useState<IPelunasan>(record || defaultPelunasan);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/pelunasan", {
      method: record ? "PUT" : "POST",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 201) {
          modal.success({ content: res.msg });
          setOpen(false);
          await getData();
        } else {
          modal.error({ content: res.msg });
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({ content: "Internal Server Error!!" });
      });
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      title={`${record ? "UPDATE/PROSES" : "BUAT"} PELUNASAN ${
        record
          ? `${record.Dapem.Debitur.nama_penerima} (${record.Dapem.nopen})`
          : ""
      }`}
      loading={loading}
      style={{ top: 20 }}
      okButtonProps={{
        loading: loading,
        disabled: !data.dapemId,
        onClick: () => handleSubmit(),
      }}
    >
      <FormInput
        data={{
          label: "Data Pembiayaan",
          type: "select",
          required: true,
          disabled:
            record !== undefined || !hasAccess("write") || !hasAccess("update"),
          value: data.dapemId,
          onChange: (e: string) =>
            setData({
              ...data,
              dapemId: e,
              Dapem: dapems.find((d) => d.id === e) as IDapem,
            }),
          options: dapems.map((d) => ({
            label: `${d.Debitur.nama_penerima} (${d.nopen})`,
            value: d.id,
          })),
        }}
      />
      <FormInput
        data={{
          label: "ID Pembiayaan",
          type: "text",
          required: true,
          value: data.dapemId ? data.Dapem.id : "",
          disabled: true,
        }}
      />
      <FormInput
        data={{
          label: "Produk",
          type: "text",
          required: true,
          value:
            data.dapemId && data.Dapem && data.Dapem.ProdukPembiayaan
              ? `${data.Dapem.ProdukPembiayaan.id} ${data.Dapem.ProdukPembiayaan.name}`
              : "",
          disabled: true,
        }}
      />
      <FormInput
        data={{
          label: "Sisa Pokok",
          type: "text",
          required: true,
          value:
            data.dapemId && data.Dapem && data.Dapem.Angsuran
              ? IDRFormat(
                  data.Dapem.Angsuran.filter(
                    (a) => a.tgl_bayar === null
                  ).reduce((acc, curr) => acc + curr.pokok, 0)
                )
              : "",
          disabled: true,
        }}
      />
      <FormInput
        data={{
          label: "Nominal",
          type: "text",
          required: true,
          disabled: !hasAccess("write") || !hasAccess("update"),
          value: IDRFormat(data.nominal || 0),
          onChange: (e: string) =>
            setData({ ...data, nominal: IDRToNumber(e || "0") }),
        }}
      />
      <FormInput
        data={{
          label: "Alasan",
          type: "select",
          required: true,
          disabled: !hasAccess("write") || !hasAccess("update"),
          value: data.alasan,
          onChange: (e: string) => setData({ ...data, alasan: e }),
          options: [
            { label: "MENINGGAL DUNIA", value: "MENINGGAL DUNIA" },
            { label: "PELUNASAN LEPAS", value: "PELUNASAN LEPAS" },
            { label: "JATUH TEMPO", value: "JATUH TEMPO" },
            { label: "PERMOHONAN DEBITUR", value: "PERMOHONAN DEBITUR" },
            { label: "LAINNYA", value: "LAINNYA" },
          ],
        }}
      />
      <FormInput
        data={{
          label: "Status",
          type: "select",
          required: true,
          disabled: !hasAccess("proses") || record?.status_final === "LUNAS",
          value: data.status_final,
          onChange: (e: string) =>
            setData({
              ...data,
              status_final: e as EStatusFinal,
              ...(record &&
                e === "LUNAS" && {
                  Dapem: { ...data.Dapem, status_final: "LUNAS" },
                  pelunasan_date: new Date(),
                }),
            } as IPelunasan),
          options: [
            { label: "LUNAS", value: "LUNAS" },
            { label: "PROSES", value: "PROSES" },
            { label: "ANTRI", value: "ANTRI" },
            { label: "TOLAK", value: "GAGAL" },
          ],
        }}
      />
      <FormInput
        data={{
          label: "Nominal Sumdan",
          type: "text",
          required: true,
          disabled: !hasAccess("proses"),
          value: IDRFormat(data.nominal_sumdan || 0),
          onChange: (e: string) =>
            setData({ ...data, nominal_sumdan: IDRToNumber(e || "0") }),
        }}
      />
      <FormInput
        data={{
          label: "Keterangan",
          type: "textarea",
          required: true,
          disabled: !hasAccess("proses"),
          value: data.keterangan,
          onChange: (e: string) => setData({ ...data, keterangan: e }),
        }}
      />
      <FormInput
        data={{
          label: "Status Jaminan",
          type: "select",
          required: true,
          disabled: !hasAccess("proses") || !hasAccess("update"),
          value: data.status_jaminan,
          onChange: (e: string) =>
            setData({ ...data, status_jaminan: e as EStatusBerkas }),
          options: [
            { label: "SUMDAN", value: "SUMDAN" },
            { label: "SENDING", value: "SENDING" },
            { label: "PUSAT", value: "PUSAT" },
            { label: "CABANG", value: "CABANG" },
          ],
        }}
      />
      <FormInput
        data={{
          label: "Permohonan",
          type: "upload",
          required: true,
          disabled: !hasAccess("write") || !hasAccess("update"),
          value: data.file_pelunasan,
          onChange: (e: string) =>
            setData({
              ...data,
              file_pelunasan: e,
              ...(e &&
                data.status_final !== "LUNAS" && { status_final: "PROSES" }),
            }),
        }}
      />
      <FormInput
        data={{
          label: "Bukti Pelunasan",
          type: "upload",
          required: true,
          disabled: !hasAccess("write") || !hasAccess("update"),
          value: data.file_proof,
          onChange: (e: string) => setData({ ...data, file_proof: e }),
        }}
      />
    </Modal>
  );
};

const defaultPelunasan: IPelunasan = {
  id: "",
  nominal: 0,
  nominal_sumdan: 0,
  file_pelunasan: null,
  file_proof: null,
  pelunasan_date: null,
  alasan: "LAINNYA",
  keterangan: null,
  status_jaminan: "SUMDAN",
  status_final: "ANTRI",

  status: true,
  created_at: new Date(),
  updated_at: new Date(),

  Dapem: {} as IDapem,
  dapemId: "",
};

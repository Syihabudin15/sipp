"use client";

import { FormInput } from "@/components";
import {
  IActionTable,
  IDapem,
  IPageProps,
  IPencairan,
  IPenyerahanJaminan,
} from "@/components/IInterfaces";
import { IDRFormat } from "@/components/Utils";
import { useAccess } from "@/lib/Permission";
import {
  FileFilled,
  FormOutlined,
  PayCircleOutlined,
  PrinterOutlined,
  SafetyCertificateOutlined,
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
import { useEffect, useState } from "react";
const { RangePicker } = DatePicker;

export default function Page() {
  const [pageProps, setPageProps] = useState<IPageProps<IPenyerahanJaminan>>({
    page: 1,
    limit: 50,
    data: [],
    total: 0,
    search: "",
    sumdanId: "",
    backdate: "",
    jaminan_status: "",
  });
  const [loading, setLoading] = useState(false);
  const [sumdans, setSumdans] = useState<Sumdan[]>([]);
  const [action, setAction] = useState<IActionTable<IPenyerahanJaminan>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
  });
  const { hasAccess } = useAccess("/penyerahan-jaminan/list");
  const { modal } = App.useApp();

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
    if (pageProps.backdate) {
      params.append("backdate", pageProps.backdate);
    }
    if (pageProps.jaminan_status) {
      params.append("jaminan_status", pageProps.jaminan_status);
    }
    const res = await fetch(
      `/api/penyerahan-jaminan/list?${params.toString()}`
    );
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
    pageProps.jaminan_status,
  ]);

  useEffect(() => {
    (async () => {
      await fetch("/api/sumdan")
        .then((res) => res.json())
        .then((res) => setSumdans(res.data));
    })();
  }, []);

  const columnPencairan: TableProps<IPenyerahanJaminan>["columns"] = [
    {
      title: "Sumber Dana",
      key: "sumdan",
      dataIndex: ["Sumdan", "name"],
    },
    {
      title: "Nomor TBO",
      key: "id",
      dataIndex: "id",
    },
    {
      title: "End User",
      key: "enduser",
      dataIndex: "enduser",
      className: "text-center",
      render(value, record, index) {
        return <>{record.Dapem.length}</>;
      },
    },
    {
      title: "Plafond & Dropping",
      key: "plafond",
      dataIndex: "plafond",
      render(value, record, index) {
        const total = record.Dapem.reduce((acc, curr) => acc + curr.plafond, 0);
        const biaya = record.Dapem.reduce(
          (acc, curr) =>
            acc + (curr.plafond * (curr.c_adm_sumdan / 100) + curr.c_rekening),
          0
        );
        return (
          <div>
            <p>
              Plafond: <Tag color={"blue"}>{IDRFormat(total)}</Tag>
            </p>
            <p>
              Dropping: <Tag color={"blue"}>{IDRFormat(total - biaya)}</Tag>
            </p>
          </div>
        );
      },
    },
    {
      title: "Status Penerimaan",
      dataIndex: "berkas_status",
      key: "berkas_status",
      width: 200,
      render: (_, record, i) => (
        <div className="">
          <p>
            Status:{" "}
            <Tag
              color={record.jaminan_status === "SENDING" ? "blue" : "green"}
              variant="solid"
            >
              {record.jaminan_status}
            </Tag>
          </p>
          <p className="opacity-70 italic text-xs">
            Tgl:{" "}
            {record.jaminan_date
              ? moment(record.jaminan_date).format("DD-MM-YYYY HH:mm")
              : ""}
          </p>
        </div>
      ),
    },
    {
      title: "Created",
      key: "created_at",
      dataIndex: "created_at",
      render(value, record, index) {
        return <>{moment(record.created_at).format("DD/MM/YYYY")}</>;
      },
    },
    {
      title: hasAccess("proses") ? "Proses" : "Berkas",
      key: "proses",
      dataIndex: "proses",
      render(value, record, index) {
        return (
          <div className="flex justify-center gap-2">
            {(hasAccess("update") || hasAccess("proses")) && (
              <Button
                icon={<FormOutlined />}
                type="primary"
                size="small"
                onClick={() =>
                  setAction({ ...action, openUpsert: true, selected: record })
                }
              ></Button>
            )}
            {hasAccess("update") && (
              <Tooltip title="Cetak SI">
                <Button
                  icon={<PrinterOutlined />}
                  size="small"
                  type="primary"
                ></Button>
              </Tooltip>
            )}
            <Tooltip title="Berkas SI">
              <Button
                icon={<FileFilled />}
                size="small"
                disabled={!record.file_si}
              ></Button>
            </Tooltip>
            <Tooltip title="Bukti Transfer">
              <Button
                icon={<FileFilled />}
                size="small"
                disabled={!record.file_proof}
              ></Button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const handleSubmit = async () => {
    if (!action.selected) {
      modal.error({ content: "Tidak data yang dipilih!" });
      return;
    }
    setLoading(true);
    await fetch("/api/penyerahan-jaminan/list", {
      method: "PUT",
      body: JSON.stringify(action.selected),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 201) {
          modal.success({ content: res.msg });
          setAction({ ...action, openUpsert: false, selected: undefined });
          await getData();
        } else {
          modal.error({ content: res.msg });
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
          <SafetyCertificateOutlined /> Penyerahan Jaminan
        </div>
      }
      styles={{ body: { padding: 5 } }}
    >
      <div className="flex justify-between items-center my-1 gap-2 flex-wrap">
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
              { label: "SENDING", value: "SENDING" },
              { label: "SUMDAN", value: "SUMDAN" },
            ]}
            onChange={(e) => setPageProps({ ...pageProps, jaminan_status: e })}
            allowClear
          />
          {hasAccess("update") && (
            <Select
              size="small"
              onChange={(e: string) =>
                setPageProps({ ...pageProps, sumdanId: e })
              }
              allowClear
              placeholder="Pilih Sumdan..."
              options={sumdans.map((s) => ({ label: s.code, value: s.id }))}
            />
          )}
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
        columns={columnPencairan}
        dataSource={pageProps.data}
        size="small"
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
        loading={loading}
        expandable={{
          expandedRowRender: (record) => <TableDapem data={record.Dapem} />,
          rowExpandable: (record) => record.Dapem.length !== 0,
        }}
      />
      {action.selected && (
        <Modal
          open={action.openUpsert}
          onCancel={() =>
            setAction({ ...action, openUpsert: false, selected: undefined })
          }
          title={"Data TBO " + action.selected.id}
          key={action.selected.id || "created"}
          okButtonProps={{ loading: loading, onClick: () => handleSubmit() }}
        >
          {hasAccess("update") && (
            <>
              <FormInput
                data={{
                  label: "Tanggal Penyerahan",
                  type: "date",
                  required: true,
                  value: moment(action.selected.created_at).format(
                    "YYYY-MM-DD"
                  ),
                  onChange: (e: string) =>
                    setAction({
                      ...action,
                      selected: {
                        ...action.selected,
                        created_at: !isNaN(new Date(e).getTime())
                          ? moment(e).toDate()
                          : new Date(),
                      } as IPenyerahanJaminan,
                    }),
                }}
              />
              <FormInput
                data={{
                  label: "Berkas PB",
                  type: "upload",
                  required: true,
                  value: action.selected.file_si,
                  accept: "application/pdf",
                  onChange: (e: string) =>
                    setAction({
                      ...action,
                      selected: {
                        ...action.selected,
                        file_si: e,
                        ...(e &&
                          action.selected?.jaminan_status !== "SUMDAN" && {
                            ["Dapem"]: action.selected?.Dapem.map((d) => ({
                              ...d,
                              jaminan_status: "SENDING",
                            })),
                          }),
                      } as IPenyerahanJaminan,
                    }),
                }}
              />
            </>
          )}
          {hasAccess("proses") && (
            <>
              <FormInput
                data={{
                  label: "Status Penerimaan",
                  type: "select",
                  required: true,
                  disabled: action.selected.jaminan_status === "SUMDAN",
                  value: action.selected.jaminan_status,
                  onChange: (e: string) =>
                    setAction({
                      ...action,
                      selected: {
                        ...action.selected,
                        jaminan_status: e,
                        ...(e === "SUMDAN" && {
                          ["jaminan_date"]: new Date(),
                        }),
                        ...(e === "SUMDAN" && {
                          ["Dapem"]: action.selected?.Dapem.map((d) => ({
                            ...d,
                            jaminan_status: "SUMDAN",
                          })),
                        }),
                      } as IPenyerahanJaminan,
                    }),
                  options: [
                    { label: "DITERIMA", value: "SUMDAN" },
                    { label: "SENDING", value: "SENDING" },
                  ],
                }}
              />
              <FormInput
                data={{
                  label: "Bukti Transfer",
                  type: "upload",
                  required: true,
                  value: action.selected.file_proof,
                  accept: "application/pdf",
                  onChange: (e: string) =>
                    setAction({
                      ...action,
                      selected: {
                        ...action.selected,
                        file_proof: e,
                      } as IPenyerahanJaminan,
                    }),
                }}
              />
            </>
          )}
        </Modal>
      )}
    </Card>
  );
}

const columnDapem: TableProps<IDapem>["columns"] = [
  {
    title: "ID",
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Pemohon",
    key: "pemohon",
    dataIndex: "pemohon",
    render(value, record, index) {
      return (
        <div>
          <p>{record.Debitur.nama_penerima}</p>
          <p className="opacity-70">{record.nopen}</p>
        </div>
      );
    },
  },
  {
    title: "ProdukPembiayaan",
    key: "produk",
    dataIndex: "produk",
    render(value, record, index) {
      return (
        <div>
          <p>{record.ProdukPembiayaan.name}</p>
          <p>{record.JenisPembiayaan.name}</p>
        </div>
      );
    },
  },
  {
    title: "Plafond",
    key: "plafond",
    dataIndex: "plafond",
    render(value, record, index) {
      return (
        <div>
          <p>{IDRFormat(record.plafond)}</p>
          <p>{record.tenor} Bulan</p>
        </div>
      );
    },
  },
  {
    title: "Tgl TBO",
    key: "tbo",
    dataIndex: "tbo",
    render(value, record, index) {
      return (
        <>
          {moment(record.created_at)
            .add(record.tbo, "month")
            .format("DD/MM/YYYY")}
        </>
      );
    },
  },
];

const TableDapem = ({ data }: { data: IDapem[] }) => {
  return (
    <Table
      bordered
      pagination={false}
      rowKey={"id"}
      columns={columnDapem}
      dataSource={data}
    />
  );
};

"use client";

import { FormInput, ViewFiles } from "@/components";
import {
  IActionTable,
  IDapem,
  IPageProps,
  IPencairan,
  IViewFiles,
} from "@/components/IInterfaces";
import { printSI } from "@/components/pdfs/Dropping";
import { IDRFormat } from "@/components/Utils";
import { useAccess } from "@/lib/Permission";
import {
  FileFilled,
  FormOutlined,
  PayCircleOutlined,
  PrinterOutlined,
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
  const [pageProps, setPageProps] = useState<IPageProps<IPencairan>>({
    page: 1,
    limit: 50,
    data: [],
    total: 0,
    search: "",
    sumdanId: "",
    backdate: "",
    pencairan_status: "",
  });
  const [loading, setLoading] = useState(false);
  const [sumdans, setSumdans] = useState<Sumdan[]>([]);
  const [action, setAction] = useState<IActionTable<IPencairan>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
  });
  const [views, setViews] = useState<IViewFiles>({
    open: false,
    data: [],
  });

  const { hasAccess } = useAccess("/pencairan/list");
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
    if (pageProps.pencairan_status) {
      params.append("pencairan_status", pageProps.pencairan_status);
    }
    const res = await fetch(`/api/pencairan?${params.toString()}`);
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
    pageProps.pencairan_status,
  ]);

  useEffect(() => {
    (async () => {
      await fetch("/api/sumdan")
        .then((res) => res.json())
        .then((res) => setSumdans(res.data));
    })();
  }, []);

  const columnPencairan: TableProps<IPencairan>["columns"] = [
    {
      title: "Sumber Dana",
      key: "sumdan",
      dataIndex: ["Sumdan", "name"],
    },
    {
      title: "Nomor SI",
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
      title: "Adm Sumdan & Rekening",
      key: "adm",
      dataIndex: "adm",
      render(value, record, index) {
        const adm = record.Dapem.reduce(
          (acc, curr) => acc + curr.plafond * (curr.c_adm_sumdan / 100),
          0
        );
        const rek = record.Dapem.reduce(
          (acc, curr) => acc + curr.c_rekening,
          0
        );
        return (
          <div>
            <p>
              Adm : <Tag color={"blue"}>{IDRFormat(adm)}</Tag>
            </p>
            <p>
              Rekening : <Tag color={"blue"}>{IDRFormat(rek)}</Tag>
            </p>
          </div>
        );
      },
    },
    {
      title: "Status DROPPING",
      dataIndex: "pencairan_status",
      key: "pencairan_status",
      width: 180,
      render: (_, record, i) => (
        <div className="">
          <p>
            Status:{" "}
            <Tag
              color={
                record.pencairan_status === "TRANSFER"
                  ? "green"
                  : record.pencairan_status === "DRAFT"
                  ? "blue"
                  : record.pencairan_status === "ANTRI"
                  ? "orange"
                  : record.pencairan_status === "PROSES"
                  ? "blue"
                  : "red"
              }
              variant="solid"
            >
              {record.pencairan_status}
            </Tag>
          </p>
          <p>
            {record.pencairan_date
              ? moment(record.pencairan_date).format("DD-MM-YYYY HH:mm")
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
                  onClick={() => printSI(record)}
                ></Button>
              </Tooltip>
            )}
            <Tooltip title="Berkas Akad & Dropping">
              <Button
                icon={<FileFilled />}
                size="small"
                onClick={() =>
                  setViews({
                    open: true,
                    data: [
                      { name: "Berkas SI", url: record.file_si || "" },
                      { name: "Bukti Transfer", url: record.file_proof || "" },
                      ...record.Dapem.map((d) => ({
                        name: "Akad " + d.Debitur.nama_penerima,
                        url: d.file_akad || "",
                      })),
                    ],
                  })
                }
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
    await fetch("/api/pencairan", {
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
          <PayCircleOutlined /> Permohonan Pencairan
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
              { label: "ANTRI", value: "ANTRI" },
              { label: "PROSES", value: "PROSES" },
              { label: "TRANSFER", value: "TRANSFER" },
            ]}
            onChange={(e) =>
              setPageProps({ ...pageProps, pencairan_status: e })
            }
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
          title={"Data Pencairan " + action.selected.id}
          key={action.selected.id || "created"}
          okButtonProps={{ loading: loading, onClick: () => handleSubmit() }}
        >
          {hasAccess("update") && (
            <>
              <FormInput
                data={{
                  label: "Tanggal SI",
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
                      } as IPencairan,
                    }),
                }}
              />
              <FormInput
                data={{
                  label: "Berkas SI",
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
                          action.selected?.pencairan_status !== "TRANSFER" && {
                            pencairan_status: "PROSES",
                          }),
                      } as IPencairan,
                    }),
                }}
              />
            </>
          )}
          {hasAccess("proses") && (
            <>
              <FormInput
                data={{
                  label: "Status Dropping",
                  type: "select",
                  required: true,
                  disabled: action.selected.pencairan_status === "TRANSFER",
                  value: action.selected.pencairan_status,
                  onChange: (e: string) =>
                    setAction({
                      ...action,
                      selected: {
                        ...action.selected,
                        pencairan_status: e,
                        ...(e === "TRANSFER" && {
                          ["pencairan_date"]: new Date(),
                        }),
                        ...(e === "TRANSFER" && {
                          ["Dapem"]: action.selected?.Dapem.map((d) => ({
                            ...d,
                            status_final: "TRANSFER",
                            final_at: new Date(),
                          })),
                        }),
                      } as IPencairan,
                    }),
                  options: [
                    { label: "TRANSFER", value: "TRANSFER" },
                    { label: "ANTRI", value: "ANTRI" },
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
                      } as IPencairan,
                    }),
                }}
              />
            </>
          )}
        </Modal>
      )}
      <ViewFiles
        setOpen={(v: boolean) => setViews({ ...views, open: v })}
        data={{ ...views }}
      />
    </Card>
  );
}

const TableDapem = ({ data }: { data: IDapem[] }) => {
  const [views, setViews] = useState<IViewFiles>({
    open: false,
    data: [],
  });

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
      title: "Adm Sumdan & Rekening",
      key: "admsumdan",
      dataIndex: "admsumdan",
      render(value, record, index) {
        return (
          <div>
            <p>
              Adm :{" "}
              <Tag color={"blue"}>
                {IDRFormat(record.plafond * (record.c_adm_sumdan / 100))}
              </Tag>
            </p>
            <p>
              Rekening :{" "}
              <Tag color={"blue"}>{IDRFormat(record.c_rekening)}</Tag>
            </p>
          </div>
        );
      },
    },
    {
      title: "Akad",
      dataIndex: "akad",
      key: "akad",
      render(value, record, index) {
        return (
          <div className="flex gap-2">
            <Button
              icon={<FileFilled />}
              size="small"
              disabled={!record.file_akad}
              onClick={() =>
                setViews({
                  open: true,
                  data: [{ name: "Berkas Akad", url: record.file_akad || "" }],
                })
              }
            ></Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Table
        bordered
        pagination={false}
        rowKey={"id"}
        columns={columnDapem}
        dataSource={data}
      />
      <ViewFiles
        setOpen={(v: boolean) => setViews({ ...views, open: v })}
        data={{ ...views }}
      />
    </>
  );
};

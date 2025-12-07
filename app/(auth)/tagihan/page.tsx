"use client";

import { useUser } from "@/components/contexts/UserContext";
import {
  IActionTable,
  IAngsuran,
  IDapem,
  IPageProps,
} from "@/components/IInterfaces";
import { IDRFormat } from "@/components/Utils";
import { useAccess } from "@/lib/Permission";
import { getAngsuran } from "@/lib/Prisma";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  FormOutlined,
  MoneyCollectOutlined,
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
  Progress,
  Select,
  Table,
  TableProps,
  Tag,
  Tooltip,
} from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import "moment/locale/id";
import { printTagihan } from "@/components/pdfs/PrintTagihan";

moment.locale("id");

export default function Page() {
  const [pageProps, setPageProps] = useState<IPageProps<IAngsuran>>({
    page: 1,
    limit: 50,
    total: 0,
    data: [],
    search: "",
    sumdanId: "",
    backdate: "",
    status: "",
  });
  const [action, setAction] = useState<IActionTable<IAngsuran>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [sumdans, setSumdans] = useState<Sumdan[]>([]);
  const { modal } = App.useApp();
  const { hasAccess } = useAccess("/tagihan");
  const user = useUser();

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
    if (pageProps.status) {
      params.append("status", pageProps.status);
    }
    const res = await fetch(`/api/tagihan?${params.toString()}`);
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
    pageProps.status,
  ]);

  useEffect(() => {
    (async () => {
      await fetch("/api/sumdan")
        .then((res) => res.json())
        .then((res) => setSumdans(res.data));
    })();
  }, []);

  const columns: TableProps<IAngsuran>["columns"] = [
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
      title: "Plafond",
      dataIndex: "plafond",
      key: "plafond",
      render(value, record, index) {
        return <Tag color={"blue"}>{IDRFormat(record.Dapem.plafond)}</Tag>;
      },
    },
    {
      title: "Angsuran",
      dataIndex: "angsuran",
      key: "angsuran",
      render(value, record, index) {
        return (
          <div className="text-xs">
            <p>
              Total :{" "}
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
            </p>
            <p>
              Sumdan :{" "}
              <Tag color={"blue"}>
                {" "}
                {IDRFormat(
                  getAngsuran(
                    record.Dapem.plafond,
                    record.Dapem.tenor,
                    record.Dapem.margin_sumdan,
                    record.Dapem.pembulatan
                  ).angsuran
                )}
              </Tag>
            </p>
          </div>
        );
      },
    },
    {
      title: "Pokok Margin",
      dataIndex: "pokokmargin",
      key: "pokokmargin",
      render(value, record, index) {
        return (
          <div className="text-xs">
            <p>
              Pokok : <Tag color={"blue"}>{IDRFormat(record.pokok)}</Tag>
            </p>
            <p>
              Margin : <Tag color={"blue"}> {IDRFormat(record.margin)}</Tag>
            </p>
          </div>
        );
      },
    },
    {
      title: "Angsuran Ke",
      dataIndex: "ke",
      key: "ke",
      render(value, record, index) {
        const percent = (record.ke / record.Dapem.tenor) * 100;
        return (
          <Tooltip
            title={`Angsuran ke: ${record.ke} dari ${record.Dapem.tenor} Bulan`}
          >
            <Progress
              percent={parseFloat(percent.toFixed(1))}
              size="small"
              status={
                record.ke === record.Dapem.tenor && record.tgl_bayar
                  ? "success"
                  : record.tgl_bayar
                  ? "active"
                  : "exception"
              }
            />
            <div className="text-xs opacity-80">
              {record.ke} / {record.Dapem.tenor}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 200,
      render: (_, record, i) => (
        <div className="">
          <p>
            Status:{" "}
            <Tag color={record.tgl_bayar ? "green" : "red"} variant="solid">
              {record.tgl_bayar ? "PAID" : "UNPAID"}
            </Tag>
          </p>
          <p className="text-xs italic">
            {record.tgl_bayar
              ? moment(record.tgl_bayar).format("DD-MM-YYYY")
              : ""}
          </p>
        </div>
      ),
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
              danger={record.tgl_bayar ? true : false}
              icon={
                record.tgl_bayar ? <DeleteOutlined /> : <CheckCircleOutlined />
              }
              onClick={() =>
                setAction({ ...action, openDelete: true, selected: record })
              }
            ></Button>
          )}
          <Button
            size="small"
            icon={<PrinterOutlined />}
            loading={loading}
            onClick={() => printTable(record.Dapem)}
          ></Button>
        </div>
      ),
    },
  ];

  const handleOneUpdate = async () => {
    setLoading(true);
    await fetch("/api/tagihan?id=" + action.selected?.id, { method: "PUT" })
      .then((res) => res.json())
      .then(async (res) => {
        const { msg, status } = res;
        if (status !== 201) {
          modal.error({ content: msg });
        } else {
          modal.success({ content: msg });
          await getData();
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({
          content: `Internal Server Error!!`,
        });
      });
    setLoading(false);
  };

  const handleBulkUpdate = async () => {
    setLoading(true);
    await fetch("/api/tagihan?month=" + pageProps.backdate, { method: "POST" })
      .then((res) => res.json())
      .then(async (res) => {
        const { msg, status } = res;
        if (status !== 201) {
          modal.error({ content: msg });
        } else {
          modal.success({ content: msg });
          await getData();
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({
          content: `Internal Server Error!!`,
        });
      });
    setLoading(false);
  };

  const printTable = async (dapem: IDapem) => {
    setLoading(true);
    await fetch("/api/tagihan?dapemId=" + dapem.id, { method: "PATCH" })
      .then((res) => res.json())
      .then((res) => printTagihan(res.data, dapem));
    setLoading(false);
  };

  return (
    <Card
      title={
        <div className="flex gap-2 font-bold text-xl">
          <MoneyCollectOutlined /> Data Tagihan
        </div>
      }
      styles={{ body: { padding: 5 } }}
    >
      <div className="flex justify-between my-1 gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <Button
            size="small"
            type="primary"
            disabled={!pageProps.backdate}
            icon={<FormOutlined />}
            onClick={() => setAction({ ...action, openUpsert: true })}
          >
            Update All
          </Button>
          <DatePicker
            size="small"
            picker="month"
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
            placeholder="Pilih Status..."
            options={[
              { label: "PAID", value: "PAID" },
              { label: "UNPAID", value: "UNPAID" },
            ]}
            onChange={(e) => setPageProps({ ...pageProps, status: e })}
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
        summary={(pageData) => {
          return (
            <Table.Summary.Row className="text-xs bg-blue-400">
              <Table.Summary.Cell index={0} colSpan={2} className="text-center">
                <b>SUMMARY</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} className="text-center">
                <b>
                  {IDRFormat(
                    pageData.reduce((acc, item) => acc + item.Dapem.plafond, 0)
                  )}{" "}
                </b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} className="text-center">
                <b>
                  {IDRFormat(
                    pageData.reduce(
                      (acc, item) =>
                        acc +
                        getAngsuran(
                          item.Dapem.plafond,
                          item.Dapem.tenor,
                          item.Dapem.margin + item.Dapem.margin_sumdan,
                          item.Dapem.pembulatan
                        ).angsuran,
                      0
                    )
                  )}{" "}
                  /{" "}
                  {IDRFormat(
                    pageData.reduce(
                      (acc, item) =>
                        acc +
                        getAngsuran(
                          item.Dapem.plafond,
                          item.Dapem.tenor,
                          item.Dapem.margin_sumdan,
                          item.Dapem.pembulatan
                        ).angsuran,
                      0
                    )
                  )}
                </b>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
      <Modal
        open={action.openDelete}
        onCancel={() =>
          setAction({ ...action, openDelete: false, selected: undefined })
        }
        title={`UPDATE ${
          action.selected ? action.selected.Dapem.Debitur.nama_penerima : ""
        }`}
        loading={loading}
        okButtonProps={{
          onClick: () => handleOneUpdate(),
        }}
      >
        <p>
          Konfirmasi untuk menjadikan angsuran *
          {action.selected ? action.selected.Dapem.Debitur.nama_penerima : ""}*
          menjadi {action.selected?.tgl_bayar ? "tidak tertagih" : "tertagih"} ?
        </p>
        <div className="my-8 italic opacity-90">
          <p>
            Angsuran ke {action.selected?.ke} dari{" "}
            {action.selected?.Dapem.tenor}
          </p>
          <p>
            Periode{" "}
            {action.selected &&
              moment(action.selected?.jadwal_bayar).format("MMMM YYYY")}
          </p>
        </div>
      </Modal>
      <Modal
        open={action.openUpsert}
        onCancel={() =>
          setAction({ ...action, openUpsert: false, selected: undefined })
        }
        title={`UPDATE SEMUA TAGIHAN`}
        loading={loading}
        okButtonProps={{
          onClick: () => handleBulkUpdate(),
        }}
      >
        <p>
          Konfirmasi untuk menjadikan semua tagihan pada periode *
          {moment(pageProps.backdate).format("MMMM YYYY")}* menjadi menjadi
          tertagih ?
        </p>
      </Modal>
    </Card>
  );
}

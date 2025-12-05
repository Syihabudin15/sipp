"use client";

import { FormInput, PDFAkad } from "@/components";
import { IActionTable, IDapem, IPageProps } from "@/components/IInterfaces";
import { getAngsuran, IDRFormat } from "@/components/Utils";
import { useAccess } from "@/lib/Permission";
import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  FileFilled,
  FolderOutlined,
  PrinterOutlined,
  ReadOutlined,
  RobotOutlined,
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
  Typography,
} from "antd";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
const { Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface IActionTableAkad<T> extends IActionTable<T> {
  cetakAkad: boolean;
  openAkad: boolean;
  showAkad: boolean;
}

export default function Page() {
  const [pageProps, setPageProps] = useState<IPageProps<IDapem>>({
    page: 1,
    limit: 50,
    total: 0,
    data: [],
    search: "",
    sumdanId: "",
    jenisPembiayaanId: "",
    status_final: "",
    backdate: "",
  });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<IActionTableAkad<IDapem>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
    cetakAkad: false,
    openAkad: false,
    showAkad: false,
  });
  const [sumdans, setSumdans] = useState<Sumdan[]>([]);
  const [jeniss, setJeniss] = useState<JenisPembiayaan[]>([]);
  const { modal } = App.useApp();
  const { hasAccess } = useAccess("/monitoring");

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
    if (pageProps.jenisPembiayaanId) {
      params.append("jenisPembiayaanId", pageProps.jenisPembiayaanId);
    }
    if (pageProps.status_final) {
      params.append("status_final", pageProps.status_final);
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
    pageProps.jenisPembiayaanId,
    pageProps.status_final,
    pageProps.backdate,
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
      title: "Angsuran",
      dataIndex: "angsuran",
      key: "angsuran",
      render(value, record, index) {
        return (
          <div>
            <p>
              Total :{" "}
              <Tag color={"blue"}>
                {IDRFormat(
                  getAngsuran(
                    record.plafond,
                    record.tenor,
                    record.margin + record.margin_sumdan,
                    record.pembulatan
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
                    record.plafond,
                    record.tenor,
                    record.margin_sumdan,
                    record.pembulatan
                  ).angsuran
                )}
              </Tag>
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
              <Tag color={"blue"}>{record.mutasi_ke}</Tag>
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
      title: "Status SLIK",
      dataIndex: "slik_status",
      key: "slik_status",
      width: 250,
      render: (_, record, i) => (
        <div>
          <p>
            Status :{" "}
            <Tag
              color={
                record.slik_status === "SETUJU"
                  ? "green"
                  : record.slik_status === "PENDING"
                  ? "orange"
                  : "red"
              }
              variant="solid"
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
      width: 250,
      render: (_, record, i) => (
        <div>
          <p>
            Status :{" "}
            <Tag
              color={
                record.approv_status === "SETUJU"
                  ? "green"
                  : record.approv_status === "PENDING"
                  ? "orange"
                  : "red"
              }
              variant="solid"
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
          <p className="text-xs">
            Tanggal:{" "}
            {record.final_at
              ? moment(record.final_at).format("DD-MM-YYYY HH:mm")
              : ""}
          </p>
        </div>
      ),
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
                setSelected({ ...selected, selected: record, showAkad: true })
              }
            ></Button>
            {hasAccess("update") && (
              <Button
                icon={<PrinterOutlined />}
                type="primary"
                size="small"
                disabled={record.approv_status !== "SETUJU"}
                onClick={() =>
                  setSelected({
                    ...selected,
                    selected: record,
                    cetakAkad: true,
                  })
                }
              ></Button>
            )}
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
            <Link href={`/permohonan/update/${record.id}`}>
              <Button
                icon={<EditOutlined />}
                size="small"
                type="primary"
              ></Button>
            </Link>
          )}
          {hasAccess("delete") && (
            <Button
              icon={<DeleteOutlined />}
              size="small"
              type="primary"
              danger
              onClick={() =>
                setSelected({ ...selected, openDelete: true, selected: record })
              }
              disabled={record.status_final === "TRANSFER"}
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

  const generateNoAkad = async () => {
    setLoading(true);
    await fetch("/api/akad?id=" + selected.selected?.id)
      .then((res) => res.json())
      .then((res) => {
        setSelected({
          ...selected,
          selected: {
            ...selected.selected,
            akad_nomor: res.akad_nomor,
          } as IDapem,
        });
      });
    setLoading(false);
  };

  const generatePK = async () => {
    setLoading(true);
    setSelected({ ...selected, cetakAkad: false, openAkad: true });
    setLoading(false);
  };

  return (
    <Card
      title={
        <div className="flex gap-2 font-bold text-xl">
          <ReadOutlined /> Monitoring Pembiayaan
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
            placeholder="Pilih Jenis..."
            options={jeniss.map((s) => ({ label: s.name, value: s.id }))}
            onChange={(e) =>
              setPageProps({ ...pageProps, jenisPembiayaanId: e })
            }
            allowClear
          />
          <Select
            size="small"
            placeholder="Pilih Status..."
            options={[
              { label: "ANTRI", value: "ANTRI" },
              { label: "PROSES", value: "PROSES" },
              { label: "TRANSFER", value: "TRANSFER" },
              { label: "GAGAL", value: "GAGAL" },
              { label: "LUNAS", value: "LUNAS" },
              { label: "DRAFT", value: "DRAFT" },
            ]}
            onChange={(e) => setPageProps({ ...pageProps, status_final: e })}
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
      {selected.selected && (
        <Modal
          title={`CETAK AKAD ${selected.selected.Debitur.nama_penerima} (${selected.selected.nopen})`}
          open={selected.cetakAkad}
          onCancel={() =>
            setSelected({ ...selected, cetakAkad: false, selected: undefined })
          }
          loading={loading}
          onOk={() => generatePK()}
        >
          <FormInput
            data={{
              label: "Tanggal Akad",
              type: "date",
              required: true,
              value: moment(selected.selected.akad_date).format("YYYY-MM-DD"),
              onChange: (e: string) =>
                setSelected({
                  ...selected,
                  selected: {
                    ...selected.selected,
                    akad_date: !isNaN(new Date(e).getDate())
                      ? moment(e).toDate()
                      : null,
                  } as IDapem,
                }),
            }}
          />
          <FormInput
            data={{
              label: "Nomor Akad",
              type: "text",
              required: true,
              value: selected.selected.akad_nomor,
              onChange: (e: string) =>
                setSelected({
                  ...selected,
                  selected: {
                    ...selected.selected,
                    akad_nomor: e,
                  } as IDapem,
                }),
              suffix: (
                <Button
                  size="small"
                  icon={<RobotOutlined />}
                  type="primary"
                  onClick={() => generateNoAkad()}
                  loading={loading}
                ></Button>
              ),
            }}
          />
        </Modal>
      )}
      {selected.selected && (
        <Modal
          title={`AKAD ${selected.selected.Debitur.nama_penerima} (${selected.selected.nopen})`}
          open={selected.openAkad}
          onCancel={() =>
            setSelected({ ...selected, openAkad: false, selected: undefined })
          }
          footer={[]}
          style={{ top: 20 }}
          width={1200}
          key={selected.selected.id}
        >
          <PDFAkad data={selected.selected} />
        </Modal>
      )}
    </Card>
  );
}

"use client";

import { FormInput } from "@/components";
import { IDapem, IPageProps, IPencairan } from "@/components/IInterfaces";
import { IDRFormat } from "@/components/Utils";
import {
  PrinterOutlined,
  RobotOutlined,
  TransactionOutlined,
} from "@ant-design/icons";
import { Sumdan } from "@prisma/client";
import { App, Button, Card, Modal, Table, TableProps } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";

interface ISumdan extends Sumdan {
  Dapem: IDapem[];
}

export default function Page() {
  const [pageProps, setPageProps] = useState<IPageProps<ISumdan>>({
    page: 1,
    limit: 50,
    data: [],
    total: 0,
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const [selecteds, setSelecteds] = useState<IDapem[]>([]);
  const [pencairan, setPencairan] = useState<IPencairan>(defaultPencairan);
  const [open, setOpen] = useState(false);
  const { modal } = App.useApp();

  const getData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", pageProps.page.toString());
    params.append("limit", pageProps.limit.toString());
    const res = await fetch(`/api/si?${params.toString()}`);
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
  }, [pageProps.page, pageProps.limit]);

  const generateNoSI = async () => {
    setLoading(true);
    const sumdan = selecteds[selecteds.length - 1].ProdukPembiayaan.Sumdan;
    await fetch("/api/si?id=" + sumdan.id, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then((res) => {
        setPencairan({
          ...pencairan,
          id: res.nomor,
          sumdanId: sumdan.id,
          Sumdan: sumdan,
          Dapem: selecteds,
        });
      });
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/si", {
      method: "POST",
      body: JSON.stringify(pencairan),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 201) {
          modal.success({ content: res.msg });
          await getData();
          setOpen(false);
          setSelecteds([]);
          setPencairan(defaultPencairan);
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
    <div>
      <Card
        title={
          <div>
            <TransactionOutlined /> Cetak SI Pencairan
          </div>
        }
        styles={{ body: { padding: 5 } }}
      >
        <div className="my-1">
          <Button
            size="small"
            icon={<PrinterOutlined />}
            type="primary"
            onClick={() => setOpen(true)}
            disabled={selecteds.length === 0}
          >
            Cetak SI
          </Button>
        </div>
        <Table
          columns={columnSumdan}
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
            expandedRowRender: (record) => (
              <TableDapem data={record.Dapem} setSelecteds={setSelecteds} />
            ),
            rowExpandable: (record) => record.Dapem.length !== 0,
          }}
        />
      </Card>
      {selecteds.length !== 0 && (
        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          title={`CETAK SI PENCAIRAN ${
            selecteds[selecteds.length - 1].ProdukPembiayaan.Sumdan.name
          }`}
          loading={loading}
          okButtonProps={{ loading: loading, onClick: () => handleSubmit() }}
        >
          <FormInput
            data={{
              label: "Tanggal SI",
              required: true,
              type: "date",
              value: moment(pencairan.created_at).format("YYYY-MM-DD"),
              onChange: (e: string) =>
                setPencairan({
                  ...pencairan,
                  created_at: !isNaN(new Date(e).getTime())
                    ? moment(e).toDate()
                    : new Date(),
                }),
            }}
          />
          <FormInput
            data={{
              label: "Nomor SI",
              required: true,
              type: "text",
              value: pencairan.id,
              onChange: (e: string) =>
                setPencairan({
                  ...pencairan,
                  id: e,
                }),
              suffix: (
                <Button
                  type="primary"
                  size="small"
                  icon={<RobotOutlined />}
                  onClick={() => generateNoSI()}
                ></Button>
              ),
            }}
          />
        </Modal>
      )}
    </div>
  );
}

const columnSumdan: TableProps<ISumdan>["columns"] = [
  {
    title: "Sumber Dana",
    key: "sumdan",
    dataIndex: "name",
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
    title: "Total Plafond",
    key: "plafond",
    dataIndex: "plafond",
    render(value, record, index) {
      const total = record.Dapem.reduce((acc, curr) => acc + curr.plafond, 0);
      return <>{IDRFormat(total)}</>;
    },
  },
];

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
];

const TableDapem = ({
  data,
  setSelecteds,
}: {
  data: IDapem[];
  setSelecteds: Function;
}) => {
  const rowSelection: TableProps<IDapem>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: IDapem[]) => {
      if (selectedRows.length !== 0) {
        const last = selectedRows[selectedRows.length - 1];
        setSelecteds(
          selectedRows.filter(
            (s) =>
              s.ProdukPembiayaan.sumdanId === last.ProdukPembiayaan.sumdanId
          )
        );
      } else {
        setSelecteds(selectedRows);
      }
    },
  };
  return (
    <Table
      bordered
      pagination={false}
      rowKey={"id"}
      columns={columnDapem}
      dataSource={data}
      rowSelection={rowSelection}
    />
  );
};

const defaultPencairan: IPencairan = {
  id: "",
  pencairan_status: "ANTRI",
  pencairan_date: null,
  file_si: null,
  file_proof: null,
  status: true,
  created_at: new Date(),
  updated_at: new Date(),
  sumdanId: "",
  Sumdan: {} as Sumdan,
  Dapem: [],
};

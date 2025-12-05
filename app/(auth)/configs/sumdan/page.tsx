"use client";

import { FormInput } from "@/components";
import { IActionTable, IPageProps } from "@/components/IInterfaces";
import { IDRFormat, IDRToNumber } from "@/components/Utils";
import { useAccess } from "@/lib/Permission";
import {
  BankOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FolderOutlined,
  PhoneOutlined,
  PlusCircleFilled,
  SaveOutlined,
} from "@ant-design/icons";
import { ProdukPembiayaan, Sumdan } from "@prisma/client";
import { App, Button, Card, Input, Modal, Table, TableProps } from "antd";
import { HookAPI } from "antd/es/modal/useModal";
import moment from "moment";
import { useEffect, useState } from "react";

interface ISumdan extends Sumdan {
  ProdukPembiayaan: ProdukPembiayaan[];
}

export default function Page() {
  const [upsert, setUpsert] = useState<IActionTable<ISumdan>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
  });
  const [pageProps, setPageProps] = useState<IPageProps<ISumdan>>({
    page: 1,
    limit: 10,
    total: 0,
    data: [],
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp();
  const { hasAccess } = useAccess("/configs/sumdan");

  const getData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", pageProps.page.toString());
    params.append("limit", pageProps.limit.toString());
    if (pageProps.search) {
      params.append("search", pageProps.search);
    }
    const res = await fetch(`/api/sumdan?${params.toString()}`);
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

  const columns: TableProps<ISumdan>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Nama BPR/Bank",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render(value, record, index) {
        return (
          <div>
            <p>{record.name}</p>
            <p className="text-xs italic text-blue-500">{record.description}</p>
          </div>
        );
      },
    },
    {
      title: "Kode BPR/Bank",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      render(value, record, index) {
        return (
          <div>
            <p>{record.code}</p>
            <div className="text-xs italic text-blue-500">
              <p>
                <EnvironmentOutlined /> {record.alamat}
              </p>
              <p>
                <PhoneOutlined /> {record.no_telp}
              </p>
              <p>
                <FolderOutlined /> TBO {record.tbo} Bulan
              </p>
              <p>
                <DollarCircleOutlined /> Pembulatan{" "}
                {IDRFormat(record.pembulatan)}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Produk",
      dataIndex: "produk",
      key: "produk",
      className: "text-center",
      render(value, record, index) {
        return <>{record.ProdukPembiayaan.length}</>;
      },
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => moment(date).format("DD-MM-YYYY HH:mm:ss"),
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      render: (_, record) => (
        <div className="flex gap-2">
          {hasAccess("update") && (
            <Button
              icon={<EditOutlined />}
              onClick={() =>
                setUpsert({ ...upsert, openUpsert: true, selected: record })
              }
              size="small"
              type="primary"
            ></Button>
          )}
          {hasAccess("delete") && (
            <Button
              icon={<DeleteOutlined />}
              onClick={() =>
                setUpsert({ ...upsert, openDelete: true, selected: record })
              }
              size="small"
              type="primary"
              danger
            ></Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex gap-2 font-bold text-xl">
          <BankOutlined /> Sumber Dana Pembiayaan
        </div>
      }
      styles={{ body: { padding: 5 } }}
    >
      <div className="flex justify-between my-1">
        {hasAccess("write") && (
          <Button
            size="small"
            type="primary"
            icon={<PlusCircleFilled />}
            onClick={() =>
              setUpsert({ ...upsert, openUpsert: true, selected: undefined })
            }
          >
            Add New
          </Button>
        )}
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
        expandable={{
          expandedRowRender: (record) => {
            return (
              <TableProduk
                record={record}
                getData={getData}
                modal={modal}
                hasAccess={hasAccess}
              />
            );
          },
        }}
      />
      <UpsertSumdan
        open={upsert.openUpsert}
        record={upsert.selected}
        setOpen={(v: boolean) => setUpsert({ ...upsert, openUpsert: v })}
        getData={getData}
        modal={modal}
        key={upsert.selected ? upsert.selected.id : "create"}
      />
      <DeleteSumdan
        open={upsert.openDelete}
        setOpen={(v: boolean) => setUpsert({ ...upsert, openDelete: v })}
        getData={getData}
        record={upsert.selected}
        key={upsert.selected ? upsert.selected.id : "delete"}
        modal={modal}
      />
    </Card>
  );
}

function UpsertSumdan({
  record,
  open,
  setOpen,
  getData,
  modal,
}: {
  record?: ISumdan;
  open: boolean;
  setOpen: Function;
  getData?: Function;
  modal: HookAPI;
}) {
  const [data, setData] = useState(record ? record : defaultSumdan);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { ProdukPembiayaan, ...saved } = data;
    await fetch("/api/sumdan", {
      method: record ? "PUT" : "POST",
      body: JSON.stringify(saved),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 201 || res.status === 200) {
          modal.success({
            title: "BERHASIL",
            content: `Data berhasil ${record ? "di Update" : "ditambahkan"}!`,
          });
          setOpen(false);
          getData && (await getData());
        } else {
          modal.error({
            title: "ERROR",
            content: res.msg,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({
          title: "ERROR",
          content: "Internal Server Error",
        });
      });
    setLoading(false);
  };

  return (
    <Modal
      title={
        record ? "Update Sumber Dana " + record.name : "Add New Sumber Dana"
      }
      open={open}
      onCancel={() => setOpen(false)}
      footer={[]}
      loading={loading}
      width={1000}
      style={{ top: 20 }}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-3">
          <div className="hidden">
            <FormInput
              data={{
                label: "ID",
                mode: "horizontal",
                type: "text",
                value: data.id,
                onChange: (e: string) => setData({ ...data, id: e }),
              }}
            />
          </div>
          <FormInput
            data={{
              label: "Nama BPR/Bank",
              mode: "horizontal",
              required: true,
              type: "text",
              value: data.name,
              onChange: (e: string) => setData({ ...data, name: e }),
            }}
          />
          <FormInput
            data={{
              label: "Kode BPR/Bank",
              mode: "horizontal",
              required: true,
              type: "text",
              value: data.code,
              onChange: (e: string) => setData({ ...data, code: e }),
            }}
          />
          <FormInput
            data={{
              label: "No Telepon",
              mode: "horizontal",
              required: true,
              type: "text",
              value: data.no_telp,
              onChange: (e: string) => setData({ ...data, no_telp: e }),
            }}
          />
          <FormInput
            data={{
              label: "Alamat",
              mode: "horizontal",
              required: true,
              type: "textarea",
              value: data.alamat,
              onChange: (e: string) => setData({ ...data, alamat: e }),
            }}
          />
          <FormInput
            data={{
              label: "Keterangan",
              mode: "horizontal",
              required: true,
              type: "textarea",
              value: data.description,
              onChange: (e: string) => setData({ ...data, description: e }),
            }}
          />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <FormInput
            data={{
              label: "SK Akad",
              mode: "horizontal",
              type: "textarea",
              value: data.sk_akad,
              onChange: (e: string) => setData({ ...data, sk_akad: e }),
            }}
          />
          <FormInput
            data={{
              label: "TTD Akad",
              mode: "horizontal",
              type: "text",
              value: data.ttd_akad,
              onChange: (e: string) => setData({ ...data, ttd_akad: e }),
            }}
          />
          <FormInput
            data={{
              label: "TTD Jabatan",
              mode: "horizontal",
              type: "text",
              value: data.ttd_jabatan,
              onChange: (e: string) => setData({ ...data, ttd_jabatan: e }),
            }}
          />
          <FormInput
            data={{
              label: "TBO Berkas",
              mode: "horizontal",
              type: "number",
              value: data.tbo,
              onChange: (e: any) => setData({ ...data, tbo: parseInt(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Pembulatan",
              mode: "horizontal",
              type: "text",
              value: IDRFormat(data.pembulatan || 0),
              onChange: (e: any) =>
                setData({ ...data, pembulatan: IDRToNumber(e || "0") }),
            }}
          />
          <FormInput
            data={{
              label: "Logo BPR/Bank",
              mode: "horizontal",
              type: "upload",
              accept: "image/png,image/jpg,image/jpeg",
              value: data.logo,
              onChange: (e: string) => setData({ ...data, logo: e }),
            }}
          />
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button
          icon={<SaveOutlined />}
          type="primary"
          onClick={() => handleSave()}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}

export function DeleteSumdan({
  record,
  open,
  setOpen,
  getData,
  modal,
}: {
  record?: ISumdan;
  open: boolean;
  setOpen: Function;
  getData?: Function;
  modal: HookAPI;
}) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/sumdan?id=${record?.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          modal.success({
            title: "SUCCESS",
            content: data.msg,
          });
          setOpen(false);
          getData && (await getData());
        } else {
          modal.error({
            title: "ERROR",
            content: data.msg,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({
          title: "ERROR",
          content: "Internal Server Error",
        });
      });
    setLoading(false);
  };
  return (
    <Modal
      loading={loading}
      footer={[]}
      open={open}
      onCancel={() => setOpen(false)}
      width={400}
      style={{ top: 20 }}
      title={"Delete Sumber Dana " + record?.name}
    >
      <p>Are you sure you want to delete this sumber dana?</p>
      <div className="flex justify-end gap-4">
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button danger onClick={handleDelete} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

const defaultSumdan: ISumdan = {
  id: "",
  name: "",
  code: "",
  alamat: null,
  no_telp: null,
  ttd_akad: null,
  ttd_jabatan: null,
  sk_akad: "",
  description: null,
  logo: null,
  tbo: 3,
  pembulatan: 1000,
  ProdukPembiayaan: [],

  status: true,
  created_at: new Date(),
  updated_at: new Date(),
};

function TableProduk({
  record,
  getData,
  modal,
  hasAccess,
}: {
  record: ISumdan;
  getData: Function;
  modal: HookAPI;
  hasAccess: Function;
}) {
  const [upsert, setUpsert] = useState<IActionTable<ProdukPembiayaan>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
  });

  const columns: TableProps<ProdukPembiayaan>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "Produk",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Kriteria",
      dataIndex: "kriteria",
      key: "kriteria",
      render(value, record, index) {
        return (
          <div className="text-xs italic text-blue-500">
            <p>
              Usia Pengajuan : {record.min_usia} - {record.max_usia}
            </p>
            <p>Usia Lunas : {record.usia_lunas}</p>
            <p>Max Tenor : {record.max_tenor}</p>
            <p>MaxPlafond : {IDRFormat(record.max_plafond)}</p>
          </div>
        );
      },
    },
    {
      title: "Margin & DSR",
      dataIndex: "margin_dsr",
      key: "margin_dsr",
      render(value, record, index) {
        return (
          <div className="text-xs italic text-blue-500">
            <p>Margin Sumdan : {record.margin_sumdan}%</p>
            <p>Margin : {record.margin}%</p>
            <p>DSR : {record.dsr}%</p>
          </div>
        );
      },
    },
    {
      title: "Biaya - Biaya",
      dataIndex: "biaya",
      key: "biaya",
      render(value, record, index) {
        return (
          <div className="text-xs italic text-blue-500">
            <p>Admin Sumdan : {record.c_adm_sumdan}%</p>
            <p>Admin : {record.c_adm}%</p>
            <p>Asuransi : {record.c_asuransi}%</p>
            <p>Tatalaksana : {IDRFormat(record.c_tatalaksana)}</p>
            <p>Materai : {IDRFormat(record.c_materai)}</p>
            <p>Buka Rekening : {IDRFormat(record.c_rekening)}</p>
          </div>
        );
      },
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => (
        <div className="text-xs">
          {moment(date).format("DD-MM-YYYY HH:mm:ss")}
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
              icon={<EditOutlined />}
              onClick={() =>
                setUpsert({ ...upsert, openUpsert: true, selected: record })
              }
              size="small"
              type="primary"
            ></Button>
          )}
          {hasAccess("delete") && (
            <Button
              icon={<DeleteOutlined />}
              onClick={() =>
                setUpsert({ ...upsert, openDelete: true, selected: record })
              }
              size="small"
              type="primary"
              danger
            ></Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {hasAccess("write") && (
        <Button
          icon={<PlusCircleFilled />}
          size="small"
          type="primary"
          onClick={() =>
            setUpsert({ ...upsert, openUpsert: true, selected: undefined })
          }
        >
          Add Produk
        </Button>
      )}
      <Table
        columns={columns}
        dataSource={record.ProdukPembiayaan}
        rowKey={"id"}
        pagination={false}
        size="small"
        bordered
      />
      <UpsertProduk
        open={upsert.openUpsert}
        record={upsert.selected}
        setOpen={(v: boolean) => setUpsert({ ...upsert, openUpsert: v })}
        getData={getData}
        modal={modal}
        sumdan={record}
        key={upsert.selected ? upsert.selected.id : "createproduk"}
      />
      <DeleteProduk
        open={upsert.openDelete}
        setOpen={(v: boolean) => setUpsert({ ...upsert, openDelete: v })}
        getData={getData}
        modal={modal}
        record={upsert.selected}
        key={upsert.selected ? upsert.selected.id : "deleteproduk"}
      />
    </div>
  );
}

function UpsertProduk({
  record,
  open,
  setOpen,
  getData,
  modal,
  sumdan,
}: {
  record?: ProdukPembiayaan;
  open: boolean;
  setOpen: Function;
  getData?: Function;
  modal: HookAPI;
  sumdan: Sumdan;
}) {
  const [data, setData] = useState(record ? record : defaultProduk);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await fetch("/api/produk", {
      method: record ? "PUT" : "POST",
      body: JSON.stringify({ ...data, sumdanId: sumdan.id }),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 201 || res.status === 200) {
          modal.success({
            title: "BERHASIL",
            content: `Data berhasil ${record ? "di Update" : "ditambahkan"}!`,
          });
          setOpen(false);
          getData && (await getData());
        } else {
          modal.error({
            title: "ERROR",
            content: res.msg,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({
          title: "ERROR",
          content: "Internal Server Error",
        });
      });
    setLoading(false);
  };

  return (
    <Modal
      title={`${sumdan.code} | ${
        record ? "Update Produk " + record.name : "Add New Produk"
      }`}
      open={open}
      onCancel={() => setOpen(false)}
      footer={[]}
      loading={loading}
      width={1000}
      style={{ top: 20 }}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-3">
          <div className="hidden">
            <FormInput
              data={{
                label: "ID",
                mode: "horizontal",
                type: "text",
                value: data.id,
                onChange: (e: string) => setData({ ...data, id: e }),
              }}
            />
          </div>
          <FormInput
            data={{
              label: "Produk Pembiayaan",
              mode: "horizontal",
              required: true,
              type: "text",
              value: data.name,
              onChange: (e: string) => setData({ ...data, name: e }),
            }}
          />
          <FormInput
            data={{
              label: "Min Usia",
              mode: "horizontal",
              required: true,
              type: "number",
              value: data.min_usia,
              onChange: (e: any) => setData({ ...data, min_usia: parseInt(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Maks Usia",
              mode: "horizontal",
              required: true,
              type: "number",
              value: data.max_usia,
              onChange: (e: any) => setData({ ...data, max_usia: parseInt(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Usia Lunas",
              mode: "horizontal",
              required: true,
              type: "number",
              value: data.usia_lunas,
              onChange: (e: any) =>
                setData({ ...data, usia_lunas: parseInt(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Max Tenor",
              mode: "horizontal",
              required: true,
              type: "number",
              value: data.max_tenor,
              onChange: (e: any) =>
                setData({ ...data, max_tenor: parseInt(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Max Plafond",
              mode: "horizontal",
              required: true,
              type: "text",
              value: IDRFormat(data.max_plafond),
              onChange: (e: any) =>
                setData({ ...data, max_plafond: IDRToNumber(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Debt Service Ratio",
              mode: "horizontal",
              required: true,
              type: "number",
              value: data.dsr,
              onChange: (e: any) => setData({ ...data, dsr: parseFloat(e) }),
            }}
          />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <FormInput
            data={{
              label: "Margin Sumdan",
              mode: "horizontal",
              type: "number",
              required: true,
              value: data.margin_sumdan,
              onChange: (e: any) =>
                setData({ ...data, margin_sumdan: parseFloat(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Margin",
              mode: "horizontal",
              type: "number",
              required: true,
              value: data.margin,
              onChange: (e: any) => setData({ ...data, margin: parseFloat(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Admin Sumdan",
              mode: "horizontal",
              type: "number",
              required: true,
              value: data.c_adm_sumdan,
              onChange: (e: any) =>
                setData({ ...data, c_adm_sumdan: parseFloat(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Admin",
              mode: "horizontal",
              type: "number",
              required: true,
              value: data.c_adm,
              onChange: (e: any) => setData({ ...data, c_adm: parseFloat(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Asuransi",
              mode: "horizontal",
              type: "number",
              required: true,
              value: data.c_asuransi,
              onChange: (e: any) =>
                setData({ ...data, c_asuransi: parseFloat(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Tatalaksana",
              mode: "horizontal",
              type: "text",
              required: true,
              value: IDRFormat(data.c_tatalaksana),
              onChange: (e: any) =>
                setData({ ...data, c_tatalaksana: IDRToNumber(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Materai",
              mode: "horizontal",
              type: "text",
              required: true,
              value: IDRFormat(data.c_materai),
              onChange: (e: any) =>
                setData({ ...data, c_materai: IDRToNumber(e) }),
            }}
          />
          <FormInput
            data={{
              label: "Buka Rekening",
              mode: "horizontal",
              type: "text",
              required: true,
              value: IDRFormat(data.c_rekening),
              onChange: (e: any) =>
                setData({ ...data, c_rekening: IDRToNumber(e) }),
            }}
          />
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-2">
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button
          icon={<SaveOutlined />}
          type="primary"
          onClick={() => handleSave()}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}

export function DeleteProduk({
  record,
  open,
  setOpen,
  getData,
  modal,
}: {
  record?: ProdukPembiayaan;
  open: boolean;
  setOpen: Function;
  getData?: Function;
  modal: HookAPI;
}) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/produk?id=${record?.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          modal.success({
            title: "SUCCESS",
            content: data.msg,
          });
          setOpen(false);
          getData && (await getData());
        } else {
          modal.error({
            title: "ERROR",
            content: data.msg,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({
          title: "ERROR",
          content: "Internal Server Error",
        });
      });
    setLoading(false);
  };
  return (
    <Modal
      loading={loading}
      footer={[]}
      open={open}
      onCancel={() => setOpen(false)}
      width={400}
      style={{ top: 20 }}
      title={"Delete Produk " + record?.name}
    >
      <p>Are you sure you want to delete this produk?</p>
      <div className="flex justify-end gap-4">
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button danger onClick={handleDelete} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

const defaultProduk: ProdukPembiayaan = {
  id: "",
  name: "",
  margin: 0,
  margin_sumdan: 0,
  dsr: 0,
  min_usia: 0,
  max_usia: 0,
  usia_lunas: 0,
  c_adm: 0,
  c_adm_sumdan: 0,
  c_asuransi: 0,
  c_tatalaksana: 0,
  c_materai: 0,
  c_rekening: 0,
  max_tenor: 0,
  max_plafond: 0,

  status: true,
  created_at: new Date(),
  updated_at: new Date(),
  sumdanId: "",
};

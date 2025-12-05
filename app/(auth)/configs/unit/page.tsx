"use client";

import { FormInput } from "@/components";
import { IActionTable, IUnit, IPageProps } from "@/components/IInterfaces";
import { useAccess } from "@/lib/Permission";
import {
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusCircleFilled,
  SaveOutlined,
} from "@ant-design/icons";
import { Cabang } from "@prisma/client";
import { App, Button, Card, Input, Modal, Table, TableProps, Tag } from "antd";
import { HookAPI } from "antd/es/modal/useModal";
import moment from "moment";
import { useEffect, useState } from "react";

export default function Page() {
  const [upsert, setUpsert] = useState<IActionTable<IUnit>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
  });
  const [pageProps, setPageProps] = useState<IPageProps<IUnit>>({
    page: 1,
    limit: 10,
    total: 0,
    data: [],
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp();
  const { hasAccess } = useAccess("/configs/unit");

  const getData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", pageProps.page.toString());
    params.append("limit", pageProps.limit.toString());
    if (pageProps.search) {
      params.append("search", pageProps.search);
    }
    const res = await fetch(`/api/unit?${params.toString()}`);
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

  const columns: TableProps<IUnit>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Area",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Cabang",
      dataIndex: "Cabang",
      key: "cabang",
      className: "text-center",
      render(value, record, index) {
        return record.Cabang.length;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status ? "success" : "error"}>
          {status ? "Aktif" : "Tidak Aktif"}
        </Tag>
      ),
      sorter: (a, b) => (a.status === b.status ? 0 : a.status ? 1 : -1),
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
          <EnvironmentOutlined /> Unit Pelayanan
        </div>
      }
      styles={{ body: { padding: 5 } }}
    >
      <div className="flex justify-between my-1">
        <Button
          size="small"
          type="primary"
          icon={<PlusCircleFilled />}
          onClick={() =>
            setUpsert({ ...upsert, openUpsert: true, selected: undefined })
          }
        >
          Add Area
        </Button>
        <Input.Search
          size="small"
          style={{ width: 170 }}
          placeholder="Cari area/cabang..."
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
              <TableCabang
                record={record.Cabang}
                areaId={record.id}
                getData={getData}
                modal={modal}
                hasAccess={hasAccess}
              />
            );
          },
        }}
      />
      <UpsertArea
        open={upsert.openUpsert}
        setOpen={(v: boolean) => setUpsert({ ...upsert, openUpsert: v })}
        getData={getData}
        record={upsert.selected}
        key={upsert.selected ? upsert.selected.id : "create"}
        modal={modal}
      />
      <DeleteArea
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

function UpsertArea({
  open,
  setOpen,
  record,
  getData,
  modal,
}: {
  open: boolean;
  setOpen: Function;
  record?: IUnit;
  getData: Function;
  modal: HookAPI;
}) {
  const [data, setData] = useState(record || defaultUnit);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { Cabang, ...saved } = data;
    await fetch("/api/unit", {
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
      title={record ? "Update Area " + record.name : "Add New Area"}
      open={open}
      onCancel={() => setOpen(false)}
      footer={[]}
      loading={loading}
    >
      <div className="flex flex-col gap-3">
        <FormInput
          data={{
            label: "ID/Kode Area",
            mode: "horizontal",
            type: "text",
            value: data.id,
            onChange: (e: string) => setData({ ...data, id: e }),
          }}
        />
        <FormInput
          data={{
            label: "Nama Area",
            mode: "horizontal",
            required: true,
            type: "text",
            value: data.name,
            onChange: (e: string) => setData({ ...data, name: e }),
          }}
        />
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
      </div>
    </Modal>
  );
}

export function DeleteArea({
  record,
  open,
  setOpen,
  getData,
  modal,
}: {
  record?: IUnit;
  open: boolean;
  setOpen: Function;
  getData?: Function;
  modal: HookAPI;
}) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/unit?id=${record?.id}`, {
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
      title={"Delete Area " + record?.name}
    >
      <p>Are you sure you want to delete this area?</p>
      <div className="flex justify-end gap-4">
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button danger onClick={handleDelete} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

const defaultUnit: IUnit = {
  id: "",
  name: "",
  status: true,
  created_at: new Date(),
  updated_at: new Date(),
  Cabang: [],
};

function TableCabang({
  record,
  areaId,
  getData,
  modal,
  hasAccess,
}: {
  record: Cabang[];
  areaId: string;
  getData: Function;
  modal: HookAPI;
  hasAccess: Function;
}) {
  const [upsert, setUpsert] = useState<IActionTable<Cabang>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
  });
  const columns: TableProps<Cabang>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Cabang",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render(value, record, index) {
        return (
          <div className="text-xs">
            <p>{record.alamat}</p>
            <p>{record.no_telp}</p>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status ? "success" : "error"}>
          {status ? "Aktif" : "Tidak Aktif"}
        </Tag>
      ),
      sorter: (a, b) => (a.status === b.status ? 0 : a.status ? 1 : -1),
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
          Add Cabang
        </Button>
      )}
      <Table
        columns={columns}
        dataSource={record}
        rowKey={"id"}
        pagination={false}
        size="small"
        bordered
      />
      <UpsertCabang
        open={upsert.openUpsert}
        record={upsert.selected}
        setOpen={(v: boolean) => setUpsert({ ...upsert, openUpsert: v })}
        getData={getData}
        areaId={areaId}
        modal={modal}
        key={upsert.selected ? upsert.selected.id : "createCabang"}
      />
      <DeleteCabang
        open={upsert.openDelete}
        setOpen={(v: boolean) => setUpsert({ ...upsert, openDelete: v })}
        getData={getData}
        modal={modal}
        record={upsert.selected}
        key={upsert.selected ? upsert.selected.id : "deleteCabang"}
      />
    </div>
  );
}

function UpsertCabang({
  record,
  open,
  setOpen,
  getData,
  areaId,
  modal,
}: {
  record?: Cabang;
  open: boolean;
  setOpen: Function;
  getData: Function;
  areaId: string;
  modal: HookAPI;
}) {
  const [data, setData] = useState(
    record || { ...defaultCabang, areaId: areaId }
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await fetch("/api/cabang", {
      method: record ? "PUT" : "POST",
      body: JSON.stringify(data),
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
      title={record ? "Update Cabang " + record.name : "Add New Cabang"}
      open={open}
      onCancel={() => setOpen(false)}
      footer={[]}
      loading={loading}
    >
      <div className="flex flex-col gap-3">
        <FormInput
          data={{
            label: "ID/Kode Cabang",
            mode: "horizontal",
            type: "text",
            value: data.id,
            onChange: (e: string) => setData({ ...data, id: e }),
          }}
        />
        <FormInput
          data={{
            label: "Nama Cabang",
            mode: "horizontal",
            required: true,
            type: "text",
            value: data.name,
            onChange: (e: string) => setData({ ...data, name: e }),
          }}
        />
        <FormInput
          data={{
            label: "No Telepon",
            mode: "horizontal",
            type: "text",
            value: data.no_telp,
            onChange: (e: string) => setData({ ...data, no_telp: e }),
          }}
        />
        <FormInput
          data={{
            label: "Alamat",
            mode: "horizontal",
            type: "textarea",
            value: data.alamat,
            onChange: (e: string) => setData({ ...data, alamat: e }),
          }}
        />
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
      </div>
    </Modal>
  );
}

export function DeleteCabang({
  record,
  open,
  setOpen,
  getData,
  modal,
}: {
  record?: Cabang;
  open: boolean;
  setOpen: Function;
  getData?: Function;
  modal: HookAPI;
}) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/cabang?id=${record?.id}`, {
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
      title={"Delete Cabang " + record?.name}
    >
      <p>Are you sure you want to delete this cabang?</p>
      <div className="flex justify-end gap-4">
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button danger onClick={handleDelete} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

const defaultCabang: Cabang = {
  id: "",
  name: "",
  alamat: "",
  no_telp: "",

  status: true,
  created_at: new Date(),
  updated_at: new Date(),
  areaId: "",
};

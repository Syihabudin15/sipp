"use client";

import { FormInput } from "@/components";
import { IActionTable, IPageProps } from "@/components/IInterfaces";
import { IDRFormat, IDRToNumber } from "@/components/Utils";
import {
  BankOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusCircleFilled,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Cabang, Role, Sumdan, User } from "@prisma/client";
import {
  App,
  Button,
  Card,
  Input,
  Modal,
  Select,
  Table,
  TableProps,
  Tag,
} from "antd";
import { HookAPI } from "antd/es/modal/useModal";
import moment from "moment";
import { useEffect, useState } from "react";

interface UserType extends User {
  Cabang: Cabang;
  Sumdan: Sumdan;
  Role: Role;
}

export default function Page() {
  const [upsert, setUpsert] = useState<IActionTable<UserType>>({
    openUpsert: false,
    openDelete: false,
    selected: undefined,
  });
  const [pageProps, setPageProps] = useState<IPageProps<UserType>>({
    page: 1,
    limit: 10,
    total: 0,
    data: [],
    search: "",
    roleId: "",
  });
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [cabangs, setCabangs] = useState<Cabang[]>([]);
  const [sumdans, setSumdans] = useState<Sumdan[]>([]);
  const { modal } = App.useApp();

  const getData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", pageProps.page.toString());
    params.append("limit", pageProps.limit.toString());
    if (pageProps.search) {
      params.append("search", pageProps.search);
    }
    if (pageProps.roleId) {
      params.append("roleId", pageProps.roleId);
    }
    const res = await fetch(`/api/users?${params.toString()}`);
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
  }, [pageProps.page, pageProps.limit, pageProps.search, pageProps.roleId]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/roles");
      const resJson = await res.json();
      setRoles(resJson.data);
      const resC = await fetch("/api/cabang");
      const resCJson = await resC.json();
      setCabangs(resCJson.data);
      const resS = await fetch("/api/sumdan");
      const resSJson = await resS.json();
      setSumdans(resSJson.data);
    })();
  }, []);

  const columns: TableProps<UserType>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Nama Lengkap",
      dataIndex: "fullname",
      key: "fullname",
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      render(value, record, index) {
        return (
          <div>
            <p>
              {record.fullname} ({record.nip})
            </p>
            <div className="text-xs italic text-blue-400">
              <p>@{record.username}</p>
              <p>
                <MailOutlined /> {record.email}
              </p>
              <p>
                <PhoneOutlined /> {record.phone}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Info Tambahan",
      dataIndex: "tambahan",
      key: "tambahan",
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      render(value, record, index) {
        return (
          <div>
            <Tag color={"blue"}>{record.Role.name}</Tag>
            <div className="text-xs italic text-blue-400">
              <p>
                <EnvironmentOutlined /> {record.Cabang.name}
              </p>
              {record.Sumdan && (
                <p>
                  <BankOutlined /> {record.Sumdan.name}
                </p>
              )}
              {record.target && (
                <p>
                  <DollarCircleOutlined /> Target: {IDRFormat(record.target)}
                </p>
              )}
            </div>
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
          <Button
            icon={<EditOutlined />}
            onClick={() =>
              setUpsert({ ...upsert, openUpsert: true, selected: record })
            }
            size="small"
            type="primary"
          ></Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() =>
              setUpsert({ ...upsert, openDelete: true, selected: record })
            }
            size="small"
            type="primary"
            danger
          ></Button>
        </div>
      ),
    },
  ];
  return (
    <Card
      title={
        <div className="flex gap-2 font-bold text-xl">
          <UserOutlined /> Users Management
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
          Add User
        </Button>
        <Select
          style={{ width: 170 }}
          options={roles.map((r) => ({ label: r.name, value: r.id }))}
          onChange={(e) => setPageProps({ ...pageProps, roleId: e })}
          placeholder="filter role..."
          size="small"
          allowClear
        />
        <Input.Search
          size="small"
          style={{ width: 170 }}
          placeholder="Cari user..."
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
      <UpsertUser
        open={upsert.openUpsert}
        record={upsert.selected}
        setOpen={(v: boolean) => setUpsert({ ...upsert, openUpsert: v })}
        getData={getData}
        modal={modal}
        roles={roles}
        cabangs={cabangs}
        sumdans={sumdans}
        key={upsert.selected ? upsert.selected.id : "create"}
      />
      <DeleteUser
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

function UpsertUser({
  record,
  open,
  setOpen,
  getData,
  modal,
  roles,
  cabangs,
  sumdans,
}: {
  record?: User;
  open: boolean;
  setOpen: Function;
  getData?: Function;
  modal: HookAPI;
  roles: Role[];
  cabangs: Cabang[];
  sumdans: Sumdan[];
}) {
  const [data, setData] = useState(record ? record : defaultUser);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    if ("Cabang" in data) {
      delete data.Cabang;
    }
    if ("Role" in data) {
      delete data.Role;
    }
    if ("Sumdan" in data) {
      delete data.Sumdan;
    }
    await fetch("/api/users", {
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
      title={record ? "Update User " + record.fullname : "Add New User"}
      open={open}
      onCancel={() => setOpen(false)}
      footer={[]}
      loading={loading}
      style={{ top: 20 }}
    >
      <div className="flex flex-col gap-3">
        <div className="hidden">
          <FormInput
            data={{
              label: "USER ID",
              mode: "horizontal",
              type: "text",
              value: data.id,
              onChange: (e: string) => setData({ ...data, id: e }),
            }}
          />
        </div>
        <FormInput
          data={{
            label: "Role User",
            mode: "horizontal",
            required: true,
            type: "select",
            value: data.roleId,
            onChange: (e: string) => setData({ ...data, roleId: e }),
            options: roles.map((r) => ({ label: r.name, value: r.id })),
          }}
        />
        <FormInput
          data={{
            label: "Cabang",
            mode: "horizontal",
            required: true,
            type: "select",
            value: data.cabangId,
            onChange: (e: string) => setData({ ...data, cabangId: e }),
            options: cabangs.map((r) => ({ label: r.name, value: r.id })),
          }}
        />
        <FormInput
          data={{
            label: "Sumber Dana",
            mode: "horizontal",
            type: "select",
            value: data.sumdanId,
            onChange: (e: string) => setData({ ...data, sumdanId: e }),
            options: sumdans.map((r) => ({ label: r.name, value: r.id })),
          }}
        />
        <FormInput
          data={{
            label: "Nama Lengkap",
            mode: "horizontal",
            required: true,
            type: "text",
            value: data.fullname,
            onChange: (e: string) => setData({ ...data, fullname: e }),
          }}
        />
        <FormInput
          data={{
            label: "Username",
            mode: "horizontal",
            required: true,
            type: "text",
            value: data.username,
            onChange: (e: string) => setData({ ...data, username: e }),
          }}
        />
        <FormInput
          data={{
            label: "Email",
            mode: "horizontal",
            type: "text",
            value: data.email,
            onChange: (e: string) => setData({ ...data, email: e }),
          }}
        />
        <FormInput
          data={{
            label: "Password",
            mode: "horizontal",
            type: "password",
            required: true,
            value: record ? null : data.password,
            onChange: (e: string) => setData({ ...data, password: e }),
          }}
        />
        <FormInput
          data={{
            label: "No Telepon",
            mode: "horizontal",
            type: "text",
            value: data.phone,
            onChange: (e: string) => setData({ ...data, phone: e }),
          }}
        />
        <FormInput
          data={{
            label: "Target Perbulan",
            mode: "horizontal",
            type: "text",
            value: IDRFormat(data.target),
            onChange: (e: string) =>
              setData({ ...data, target: IDRToNumber(e || "0") }),
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

export function DeleteUser({
  record,
  open,
  setOpen,
  getData,
  modal,
}: {
  record?: User;
  open: boolean;
  setOpen: Function;
  getData?: Function;
  modal: HookAPI;
}) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/users?id=${record?.id}`, {
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
      title={"Delete User " + record?.fullname}
    >
      <p>Are you sure you want to delete this user?</p>
      <div className="flex justify-end gap-4">
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button danger onClick={handleDelete} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

const defaultUser: User = {
  id: "",
  fullname: "",
  username: "",
  email: null,
  phone: null,
  password: "",
  cabangId: "",
  roleId: "",
  sumdanId: null,
  nip: "",
  target: 0,

  status: true,
  created_at: new Date(),
  updated_at: new Date(),
};

"use client";
import {
  Badge,
  Button,
  Dropdown,
  Layout,
  Menu,
  Modal,
  theme,
  Typography,
} from "antd";
import {
  DashboardOutlined,
  KeyOutlined,
  UserOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  DropboxOutlined,
  BankOutlined,
  BookOutlined,
  ReadOutlined,
  CalculatorOutlined,
  AuditOutlined,
  MoneyCollectOutlined,
  TransactionOutlined,
  LogoutOutlined,
  BellOutlined,
  PrinterOutlined,
  PayCircleOutlined,
  FolderOpenOutlined,
  FolderAddOutlined,
  FolderViewOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useUser } from "./contexts/UserContext";
import { useEffect, useState } from "react";
import { INotif, IPermission } from "./IInterfaces";
import { filterMenuItemsByPermission, NotifItem } from "./Utils";
import { MenuItemType } from "antd/es/menu/interface";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

export const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  {
    key: "/simulasi",
    icon: <CalculatorOutlined />,
    label: "Simulasi Pembiayaan",
  },
  {
    key: "/monitoring",
    icon: <ReadOutlined />,
    label: "Monitoring Pembiayaan",
  },
  {
    key: "/permohonan",
    icon: <BookOutlined />,
    label: "Permohonan Pembiayaan",
  },
  {
    key: "/proses",
    icon: <AuditOutlined />,
    label: "Proses Pembiayaan",
    children: [
      {
        key: "/proses/verif",
        icon: <AuditOutlined />,
        label: "Proses VERIFIKASI",
      },
      {
        key: "/proses/slik",
        icon: <AuditOutlined />,
        label: "Proses SLIK",
      },
      {
        key: "/proses/approv",
        icon: <AuditOutlined />,
        label: "Proses APPROVAL",
      },
    ],
  },
  {
    key: "/pencairan",
    icon: <TransactionOutlined />,
    label: "Data Pencairan",
    children: [
      {
        key: "/pencairan/cetak",
        icon: <PrinterOutlined />,
        label: "Cetak SI Pencairan",
      },
      {
        key: "/pencairan/list",
        icon: <PayCircleOutlined />,
        label: "Permohonan Pencairan",
      },
    ],
  },
  {
    key: "/pemberkasan",
    icon: <FolderViewOutlined />,
    label: "Berkas Pembiayaan",
  },
  {
    key: "/penyerahan-berkas",
    icon: <FolderAddOutlined />,
    label: "Penyerahan Berkas",
    children: [
      {
        key: "/penyerahan-berkas/cetak",
        icon: <PrinterOutlined />,
        label: "Cetak Penyerahan Berkas",
      },
      {
        key: "/penyerahan-berkas/list",
        icon: <FolderOpenOutlined />,
        label: "List Penyerahan Berkas",
      },
    ],
  },
  {
    key: "/penyerahan-jaminan",
    icon: <SafetyCertificateOutlined />,
    label: "Penyerahan Jaminan",
    children: [
      {
        key: "/penyerahan-jaminan/cetak",
        icon: <PrinterOutlined />,
        label: "Cetak Penyerahan Jaminan",
      },
      {
        key: "/penyerahan-jaminan/list",
        icon: <SafetyOutlined />,
        label: "List Penyerahan Jaminan",
      },
    ],
  },
  {
    key: "/pelunasan",
    icon: <MoneyCollectOutlined />,
    label: "Pelunasan Debitur",
  },
  {
    key: "/debitur",
    icon: <UserOutlined />,
    label: "Data Debitur",
  },
  {
    key: "/configs",
    label: "Master Data",
    icon: <DatabaseOutlined />,
    children: [
      {
        key: "/configs/unit",
        label: "UP Management",
        icon: <EnvironmentOutlined />,
      },
      {
        key: "/configs/roles",
        label: "Role Management",
        icon: <KeyOutlined />,
      },
      {
        key: "/configs/users",
        label: "User Management",
        icon: <UserOutlined />,
      },
      {
        key: "/configs/jenis",
        label: "Jenis Pembiayaan",
        icon: <DropboxOutlined />,
      },
      {
        key: "/configs/sumdan",
        label: "Sumber Dana",
        icon: <BankOutlined />,
      },
    ],
  },
];

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const router = useRouter();
  const user = useUser();
  const [notif, setNotif] = useState<INotif>({
    verif: 0,
    slik: 0,
    approv: 0,
    akad: 0,
    si: 0,
    dropping: 0,
    cpb: 0,
    pb: 0,
    ctbo: 0,
    tbo: 0,
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getNotif = async () => {
    await fetch("/api/notif")
      .then((res) => res.json())
      .then((res) => {
        setNotif(res);
      });
  };

  useEffect(() => {
    (async () => {
      await getNotif();
      setInterval(async () => {
        await getNotif();
      }, 10000);
    })();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth", { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        window && window.location.replace("/");
      });
    setLoading(false);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider collapsible breakpoint="lg" collapsedWidth="0" width={250}>
        <div
          className="demo-logo-vertical"
          style={{
            height: 32,
            margin: 10,
            color: "white",
            textAlign: "center",
          }}
        >
          <Title level={4} style={{ color: "white", margin: 0 }}>
            {process.env.NEXT_PUBLIC_APP_SHORTNAME || "SIPP"}
          </Title>
        </div>
        {user && (
          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="inline"
            items={
              filterMenuItemsByPermission(
                menuItems,
                (JSON.parse(user.Role.permission) as IPermission[]).map(
                  (p) => p.path
                )
              ) as MenuItemType[]
            }
            onClick={(e) => router.push(e.key)}
          />
        )}
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            height: 60,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={3} style={{ margin: "0 20px", lineHeight: "60px" }}>
            {window && window.innerWidth > 600
              ? process.env.NEXT_PUBLIC_APP_FULLNAME || "SIPP"
              : process.env.NEXT_PUBLIC_APP_SHORTNAME || "SIPP"}
          </Title>
          <div className="pr-4 flex gap-4 items-center">
            <Dropdown
              trigger={["hover"]}
              placement="bottomRight"
              popupRender={() => (
                <div
                  style={{
                    width: 300,
                    maxHeight: 300,
                    overflowY: "auto",
                    padding: 10,
                    background: "white",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  className="flex flex-wrap gap-2 items-center justify-center"
                >
                  <NotifItem
                    name="VERIFIKASI"
                    count={notif.verif}
                    link="/proses/verif"
                  />
                  <NotifItem
                    name="SLIK"
                    count={notif.slik}
                    link="/proses/slik"
                  />
                  <NotifItem
                    name="APPROVAL"
                    count={notif.approv}
                    link="/proses/approv"
                  />
                  <NotifItem
                    name="AKAD"
                    count={notif.akad}
                    link="/monitoring"
                  />
                  <NotifItem
                    name="CETAK SI"
                    count={notif.si}
                    link="/pencairan/cetak"
                  />
                  <NotifItem
                    name="DROPPING"
                    count={notif.dropping}
                    link="/pencairan/list"
                  />
                  <NotifItem
                    name="CETAK PB"
                    count={notif.cpb}
                    link="/penyerahan-berkas/cetak"
                  />
                  <NotifItem
                    name="PB"
                    count={notif.pb}
                    link="/penyerahan-berkas/list"
                  />
                  <NotifItem
                    name="CETAK TBO"
                    count={notif.ctbo}
                    link="/penyerahan-jaminan/cetak"
                  />
                  <NotifItem
                    name="TBO"
                    count={notif.tbo}
                    link="/penyerahan-jaminan/list"
                  />
                </div>
              )} // ⬅️ AntD v5 way
            >
              <Button
                icon={
                  <Badge
                    count={
                      notif.verif +
                      notif.slik +
                      notif.approv +
                      notif.akad +
                      notif.si +
                      notif.dropping +
                      notif.cpb +
                      notif.pb +
                      notif.ctbo +
                      notif.tbo
                    }
                    size="small"
                    showZero
                  >
                    <BellOutlined style={{ cursor: "pointer" }} />
                  </Badge>
                }
              ></Button>
            </Dropdown>
            <p>{user?.fullname}</p>
            <Button
              icon={<LogoutOutlined />}
              danger
              onClick={() => setOpen(true)}
            ></Button>
          </div>
        </Header>

        {/* Konten Utama */}
        <Content style={{ margin: "10px 14px" }}>
          <div
            style={{
              // padding: 10,
              minHeight: 360,
              // background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={"Konfirmasi Logout?"}
        onOk={() => handleLogout()}
        loading={loading}
      >
        <p>Lanjutkan untuk keluar?</p>
      </Modal>
    </Layout>
  );
};

export default DashboardLayout;

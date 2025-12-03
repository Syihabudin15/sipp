"use client";
import {
  Badge,
  Button,
  Layout,
  Menu,
  Modal,
  theme,
  Tooltip,
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
  FolderOutlined,
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
            {window && window.innerWidth > 600 && (
              <div className="flex items-center gap-2">
                <NotifItem
                  count={notif.verif}
                  name="VERIF"
                  link="/proses/verif"
                />
                <NotifItem count={notif.slik} name="SLIK" link="/proses/slik" />
                <NotifItem
                  count={notif.approv}
                  name="APPROV"
                  link="/proses/approv"
                />
                <NotifItem count={notif.akad} name="AKAD" link="/berkas" />
                <NotifItem count={notif.si} name="SI" link="/pencairan/cetak" />
                <NotifItem
                  count={notif.dropping}
                  name="DROPPING"
                  link="/pencairan/list"
                />
              </div>
            )}
            {window && window.innerWidth < 600 && (
              <Tooltip
                title={
                  <div>
                    <p>VERIFIKASI : {notif.verif}</p>
                    <p>SLIK : {notif.slik}</p>
                    <p>APPROVAL : {notif.approv}</p>
                    <p>AKAD : {notif.akad}</p>
                    <p>SI : {notif.si}</p>
                    <p>DROPPING : {notif.dropping}</p>
                  </div>
                }
              >
                <Badge
                  count={
                    notif.verif +
                    notif.slik +
                    notif.approv +
                    notif.akad +
                    notif.si +
                    notif.dropping
                  }
                  showZero
                >
                  <Button icon={<BellOutlined />}></Button>
                </Badge>
              </Tooltip>
            )}
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

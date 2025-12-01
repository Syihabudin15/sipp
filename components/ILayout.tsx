"use client";
import { Layout, Menu, theme, Typography } from "antd";
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
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

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
            {process.env.NEXT_PUBLIC_APP_SHORTNAME || "GEMA SIPP"}
          </Title>
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={menuItems}
          onClick={(e) => router.push(e.key)}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{ padding: 0, background: colorBgContainer, height: 60 }}
        >
          <Title level={3} style={{ margin: "0 20px", lineHeight: "60px" }}>
            {process.env.NEXT_PUBLIC_APP_FULLNAME || "GEMA SIPP"}
          </Title>
        </Header>

        {/* Konten Utama */}
        <Content style={{ margin: "10px 14px" }}>
          <div
            style={{
              padding: 10,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;

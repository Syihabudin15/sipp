"use client";
import { theme, Row, Col, Card, Statistic, Divider, Tag, Space } from "antd";
import {
  UsergroupAddOutlined,
  ClockCircleOutlined,
  StockOutlined,
  CreditCardOutlined,
  UserOutlined,
  BankFilled,
  FileDoneOutlined,
} from "@ant-design/icons";

const PensionCreditDashboard = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const totalCreditDisbursed = 10000000000;
  const pendingCreditValue = 1128000000;
  const monthlyDisbursementValue = 85000000;

  return (
    <div
      style={{
        padding: 5,
        minHeight: 360,
        // background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      {/* 📊 Baris 1: Ringkasan KPI Kredit */}
      <Row gutter={[16, 16]}>
        {/* Metrik 1: Total Kredit Disalurkan */}
        <Col xs={24} lg={8}>
          <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <Statistic
              title="Total Kredit Yang Disalurkan"
              value={totalCreditDisbursed}
              precision={0}
              styles={{ content: { color: "#3f8600" } }}
              prefix={
                <>
                  <BankFilled /> Rp.{" "}
                </>
              }
            />
            <Divider style={{ margin: "8px 0" }} />
            <Space>
              <Statistic
                title="Pengajuan Pending (Rp)"
                value={pendingCreditValue}
                precision={0}
                styles={{ content: { color: "orange", fontSize: 14 } }}
                prefix={<ClockCircleOutlined />}
              />
            </Space>
          </Card>
        </Col>

        {/* Metrik 2: Debitur Aktif */}
        <Col xs={24} lg={8}>
          <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <Statistic
              title="Jumlah Debitur Aktif"
              value={125000}
              styles={{ content: { color: "#faad14" } }}
              prefix={<UsergroupAddOutlined />}
            />
            <Divider style={{ margin: "8px 0" }} />
            <Statistic
              title="Debitur Baru Bulan Ini"
              value={520}
              styles={{ content: { color: "#0050b3", fontSize: 14 } }}
              prefix={<UsergroupAddOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <Statistic
              title="Total Oustanding Keseluruhan "
              value={monthlyDisbursementValue}
              styles={{
                content: {
                  color: "#0050b3",
                },
              }}
              prefix={"Rp"}
            />
            <Divider style={{ margin: "8px 0" }} />
            <Statistic
              title="Sisa OS Pokok"
              value={520}
              styles={{ content: { color: "#0050b3", fontSize: 14 } }}
              prefix={<CreditCardOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <Statistic
              title="Total Pencairan Bulan Ini"
              value={monthlyDisbursementValue}
              styles={{ content: { color: "#0050b3" } }}
              prefix={"Rp"}
            />
            <Divider style={{ margin: "8px 0" }} />
            <Statistic
              title="Total Permohonan Bulan Ini"
              value={`${520} Permohonan`}
              styles={{ content: { color: "#0050b3", fontSize: 14 } }}
              prefix={<FileDoneOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <Statistic
              title="Total User Aktif"
              value={50}
              prefix={<UserOutlined />}
              suffix="Users"
              styles={{
                content: {
                  color: "#0050b3",
                },
              }}
            />
            <Divider style={{ margin: "8px 0" }} />
            <div className="flex gap-2">
              <Tag color="blue">MASTER 1</Tag>
              <Tag color="blue">OPS 1</Tag>
              <Tag color="blue">SPV 1</Tag>
              <Tag color="blue">MARKETING 1</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* 📈 Baris 2: Visualisasi Risiko & Proses */}
      <Row gutter={[16, 16]}>
        {/* Kolom Kiri: Distribusi Pinjaman */}
        <Col xs={24} lg={16}>
          <Card title="Distribusi Kredit per Sumber Dana">
            {/* Placeholder untuk Grafik Bar/Pie */}
            <div
              style={{
                height: 300,
                backgroundColor: "#f9f9f9",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "1px dashed #ccc",
                borderRadius: 8,
              }}
            >
              [Placeholder: Grafik Bar - Distribusi Pinjaman Jangka Pendek,
              Menengah, Panjang]
            </div>
          </Card>
        </Col>

        {/* Kolom Kanan: Status Proses Kunci */}
        <Col xs={24} lg={8}>
          <Card title="Status Proses Pengajuan Kredit">
            <p>Antrian Verifikasi</p>
            <div className="flex gap-4">
              <Tag color="orange">NOA 50</Tag>
              <Tag color="orange">Rp. 50.000.000</Tag>
            </div>
            <Divider style={{ margin: 10 }} />
            <p>Antrian SLIK & APPROVAL</p>
            <div className="flex gap-4">
              <Tag color="green">NOA 50</Tag>
              <Tag color="green">Rp. 50.000.000</Tag>
            </div>
            <Divider style={{ margin: 10 }} />
            <p>Proses Akad / Pencairan</p>
            <div className="flex gap-4">
              <Tag color="blue">NOA 50</Tag>
              <Tag color="blue">Rp. 50.000.000</Tag>
            </div>
            <Divider style={{ margin: 10 }} />
            <p>Request Pelunasan</p>
            <div className="flex gap-4">
              <Tag color="red">NOA 50</Tag>
              <Tag color="red">Rp. 50.000.000</Tag>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PensionCreditDashboard;

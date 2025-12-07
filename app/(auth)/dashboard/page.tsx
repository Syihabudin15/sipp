"use client";
import {
  theme,
  Row,
  Col,
  Card,
  Statistic,
  Divider,
  Tag,
  Space,
  Spin,
} from "antd";
import {
  UsergroupAddOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  UserOutlined,
  BankFilled,
  FileDoneOutlined,
  PayCircleOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { IRole } from "@/components/IInterfaces";
import { Dapem, Pelunasan } from "@prisma/client";
import { use, useEffect, useState } from "react";
import { IDRFormat } from "@/components/Utils";
import { useUser } from "@/components/contexts/UserContext";

interface IDashboard {
  kyd: number;
  kyp: number;
  alldeb: number;
  debmonth: number;
  kydmonth: number;
  noamonth: number;
  osall: number;
  ospokok: number;
  roles: IRole[];
  verif: Dapem[];
  slikapprov: Dapem[];
  akad: Dapem[];
  pelunasan: Pelunasan[];
  pelunasanreq: Pelunasan[];
  sumdan: { name: string; total: number }[];
  produk: { name: string; noa: number; total: number }[];
}

const PensionCreditDashboard = () => {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  const [data, setData] = useState<IDashboard>({
    kyd: 0,
    kyp: 0,
    alldeb: 0,
    debmonth: 0,
    kydmonth: 0,
    noamonth: 0,
    osall: 0,
    ospokok: 0,
    roles: [],
    verif: [],
    slikapprov: [],
    akad: [],
    pelunasan: [],
    pelunasanreq: [],
    sumdan: [],
    produk: [],
  });
  const [loading, setLoading] = useState(false);
  const user = useUser();

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetch("/api")
        .then((res) => res.json())
        .then((res) => setData(res));
      setLoading(false);

      setInterval(async () => {
        setLoading(true);
        await fetch("/api")
          .then((res) => res.json())
          .then((res) => setData(res));
        setLoading(false);
      }, 60000);
    })();
  }, []);

  return (
    <Spin spinning={loading}>
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
                value={data.kyd}
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
                  value={data.kyp}
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
                value={data.alldeb}
                styles={{ content: { color: "#faad14" } }}
                prefix={<UsergroupAddOutlined />}
              />
              <Divider style={{ margin: "8px 0" }} />
              <Statistic
                title="Debitur Baru Bulan Ini"
                value={data.debmonth}
                styles={{ content: { color: "#0050b3", fontSize: 14 } }}
                prefix={<UsergroupAddOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <Statistic
                title="Total OS Keseluruhan "
                value={data.osall}
                styles={{
                  content: {
                    color: "#0050b3",
                  },
                }}
                prefix={"Rp"}
              />
              <Divider style={{ margin: "8px 0" }} />
              <Statistic
                title="Total OS Pokok"
                value={data.ospokok}
                styles={{ content: { color: "#0050b3", fontSize: 14 } }}
                prefix={<CreditCardOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <Statistic
                title="Total Pencairan Bulan Ini"
                value={data.kydmonth}
                styles={{ content: { color: "#0050b3" } }}
                prefix={"Rp"}
              />
              <Divider style={{ margin: "8px 0" }} />
              <Statistic
                title="Total Permohonan Bulan Ini"
                value={`${data.noamonth} Permohonan`}
                styles={{ content: { color: "#0050b3", fontSize: 14 } }}
                prefix={<FileDoneOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <Statistic
                title="Total User Aktif"
                value={data.roles.flatMap((r) => r.User).length}
                prefix={<UserOutlined />}
                suffix="Users"
                styles={{
                  content: {
                    color: "#0050b3",
                  },
                }}
              />
              <Divider style={{ margin: "8px 0" }} />
              <div className="flex gap-2 flex-wrap">
                {data.roles.map((r) => (
                  <Tag color="blue" key={r.id}>
                    {r.name} {r.User.length}
                  </Tag>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <Statistic
                title="Total Pelunasan"
                value={data.pelunasan.reduce(
                  (acc, curr) => acc + curr.nominal,
                  0
                )}
                styles={{ content: { color: "#0050b3" } }}
                prefix={"Rp"}
              />
              <Divider style={{ margin: "8px 0" }} />
              <Statistic
                title="NOA Pelunasan"
                value={`${data.pelunasan.length} `}
                styles={{ content: { color: "#0050b3", fontSize: 14 } }}
                prefix={<PayCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
        <Divider />

        {/* 📈 Baris 2: Visualisasi Risiko & Proses */}
        <Row gutter={[16, 16]}>
          {/* Kolom Kiri: Distribusi Pinjaman */}
          <Col xs={24} lg={16}>
            <Card
              title={
                user && user.sumdanId
                  ? "Distribusi Kredir per Produk"
                  : "Distribusi Kredit per Sumber Dana"
              }
            >
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={user && user.sumdanId ? data.produk : data.sumdan}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(_, __, item) => {
                        const { noa, total } = item.payload;

                        return [
                          `${new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(total)}`,
                          `${noa} Debitur`,
                        ];
                      }}
                    />
                    <Bar dataKey="total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Kolom Kanan: Status Proses Kunci */}
          <Col xs={24} lg={8}>
            <Card title="Status Proses Pengajuan Kredit">
              <p>Antrian Verifikasi</p>
              <div className="flex gap-4">
                <Tag color="orange">NOA {data.verif.length}</Tag>
                <Tag color="orange">
                  Rp.{" "}
                  {IDRFormat(
                    data.verif.reduce((acc, curr) => acc + curr.plafond, 0)
                  )}
                </Tag>
              </div>
              <Divider style={{ margin: 10 }} />
              <p>Antrian SLIK & APPROVAL</p>
              <div className="flex gap-4">
                <Tag color="green">NOA {data.slikapprov.length}</Tag>
                <Tag color="green">
                  Rp.{" "}
                  {IDRFormat(
                    data.slikapprov.reduce((acc, curr) => acc + curr.plafond, 0)
                  )}
                </Tag>
              </div>
              <Divider style={{ margin: 10 }} />
              <p>Proses Akad / Pencairan</p>
              <div className="flex gap-4">
                <Tag color="blue">NOA {data.akad.length}</Tag>
                <Tag color="blue">
                  Rp.{" "}
                  {IDRFormat(
                    data.akad.reduce((acc, curr) => acc + curr.plafond, 0)
                  )}
                </Tag>
              </div>
              <Divider style={{ margin: 10 }} />
              <p>Request Pelunasan</p>
              <div className="flex gap-4">
                <Tag color="red">NOA {data.pelunasanreq.length}</Tag>
                <Tag color="red">
                  Rp.{" "}
                  {IDRFormat(
                    data.pelunasanreq.reduce(
                      (acc, curr) => acc + curr.nominal,
                      0
                    )
                  )}
                </Tag>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default PensionCreditDashboard;

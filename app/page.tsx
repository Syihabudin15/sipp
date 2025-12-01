"use client";
import { Form, Input, Button, Layout, Row, Col, Card } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
const { Content } = Layout;

export default function Page() {
  const onFinish = (values: any) => {
    console.log("Nilai yang diterima dari formulir: ", values);
    // Di sini Anda akan menambahkan logika otentikasi (misalnya, memanggil API)
    alert(`Berhasil Login! Username: ${values.username}`);
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "blue" }}>
      <Content style={{ padding: "0 50px" }}>
        {/* Row dan Col untuk menempatkan formulir di tengah halaman */}
        <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
          <Col xs={24} lg={8}>
            <Card
              title={
                <div
                  style={{
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <img
                    src="/globe.svg"
                    alt="Logo"
                    style={{ height: "40px", marginBottom: "8px" }}
                  />
                  <h2 className="font-bold text-xl mb-4">
                    {process.env.NEXT_PUBLIC_APP_FULLNAME || "GEMA"}
                  </h2>
                </div>
              }
              style={{
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                padding: 20,
              }}
            >
              <Form name="normal_login" onFinish={onFinish}>
                {/* Input Username */}
                <Form.Item
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Tolong masukkan Username Anda!",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    placeholder="Username"
                    size="large"
                  />
                </Form.Item>

                {/* Input Password */}
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Tolong masukkan Password Anda!",
                    },
                  ]}
                >
                  <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Password"
                    size="large"
                  />
                </Form.Item>
                {/* Tombol Submit */}
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: "100%", marginTop: 10 }}
                    size="large"
                    icon={<LoginOutlined />}
                  >
                    Log in
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

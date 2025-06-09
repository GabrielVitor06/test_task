"use client";

import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const onFinish = async (values: unknown) => {
    try {
      const res = await axios.post<{ name: string; userId: number }>(
        "http://localhost:4000/login",
        values
      );
      localStorage.setItem("userId", String(res.data.userId));

      message.success(`Bem-vindo, ${res.data.name}!`);
      router.push("/");
    } catch {
      message.error("Login inválido");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Login</h2>
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Senha" name="password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Entrar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

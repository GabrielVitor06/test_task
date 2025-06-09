"use client";

import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const onFinish = async (values: unknown) => {
    try {
      await axios.post("http://localhost:4000/register", values);
      message.success("Cadastro realizado com sucesso!");
      router.push("/login");
    } catch {
      message.error("Erro ao cadastrar");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Cadastro</h2>
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
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
            Cadastrar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

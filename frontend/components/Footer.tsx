import React from "react";
import { Layout, Typography } from "antd";

const { Footer: AntFooter } = Layout;
const { Title } = Typography;

const Footer = () => {
  return (
    <AntFooter
      style={{
        textAlign: "center",
        padding: "24px 16px",
        backgroundColor: "#f0f2f5",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          © {new Date().getFullYear()} Teste Task. Todos os direitos reservados.
        </Title>
        <p style={{ margin: 0 }}>
          Feito com Next.js, Ant Design, Express.js, Prisma ORM
        </p>
      </div>
    </AntFooter>
  );
};

export default Footer;

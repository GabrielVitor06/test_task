"use client";

import React, { useState } from "react";
import { Layout, Menu, Button, Drawer, Typography, Grid } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const menuItems = [
  { label: "Início", key: "home" },
  { label: "Sobre", key: "about" },
  { label: "Projetos", key: "projects" },
  { label: "Contato", key: "contact" },
];

const Navbar = () => {
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = !screens.md;

  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingInline: 24,
        backgroundColor: "#001529",
      }}
    >
      <Title level={4} style={{ color: "#fff", margin: 0 }}>
        Teste Task
      </Title>

      {isMobile ? (
        <>
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: "#fff", fontSize: 20 }} />}
            onClick={() => setDrawerOpen(true)}
          />
          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
          >
            <Menu
              mode="vertical"
              items={menuItems}
              onClick={() => setDrawerOpen(false)}
            />
          </Drawer>
        </>
      ) : (
        <Menu
          mode="horizontal"
          items={menuItems}
          theme="dark"
          style={{ backgroundColor: "transparent" }}
        />
      )}
    </Header>
  );
};

export default Navbar;

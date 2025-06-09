"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  message,
  Layout,
  List,
  Button,
  Typography,
  Divider,
  Popconfirm,
  Space,
  Tooltip,
  Empty,
  Skeleton,
} from "antd";
import { DownloadOutlined, CopyOutlined } from "@ant-design/icons";
import UploadPlano from "@/components/UploadPlano";
import PlanoPreviewModal from "@/components/PlanoPreviewModal";
import GerarPadrao from "@/components/GerarPdfPadronizado";
import { Plano } from "@/types/types";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";

const { Title } = Typography;
const { Content } = Layout;

export default function Home() {
  const router = useRouter();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      router.push("/login");
    } else {
      setUserId(storedUserId);
    }
  }, [router]);

  const fetchPlanos = useCallback(async () => {
    if (!userId) {
      message.error("Usuário não autenticado.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get<Plano[]>(
        `http://localhost:4000/planos?userId=${userId}`
      );
      setPlanos(data);
    } catch (error) {
      message.error("Erro ao carregar planos.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPlanos();
  }, [fetchPlanos]);

  const handlePreview = (plano: Plano) => {
    setSelectedPlano(plano);
    setPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
    setSelectedPlano(null);
  };

  const handleDelete = async (planoId: number) => {
    if (!userId) return;
    try {
      await axios.delete(
        `http://localhost:4000/planos/${planoId}?userId=${userId}`
      );
      message.success("Plano deletado com sucesso!");
      fetchPlanos();
      if (selectedPlano?.id === planoId) handleClosePreview();
    } catch (error) {
      message.error("Erro ao deletar plano.");
      console.error(error);
    }
  };

  const handleDuplicate = async (planoId: number) => {
    if (!userId) return;
    try {
      await axios.post(`http://localhost:4000/planos/${planoId}/duplicar`, {
        userId,
      });
      message.success("Plano duplicado com sucesso!");
      fetchPlanos();
    } catch (error) {
      message.error("Erro ao duplicar plano.");
      console.error(error);
    }
  };

  const handleDownloadPDF = (planoId: number) => {
    if (!userId) return;
    const url = `http://localhost:4000/planos/${planoId}/pdf?userId=${userId}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `plano_${planoId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Navbar />

      <Layout
        style={{
          flex: 1,
          padding: "40px 16px",
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Content
          style={{
            background: "#fff",
            borderRadius: 8,
            padding: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Title level={3}>Upload de Plano</Title>
          <Space style={{ marginBottom: 24 }}>
            <UploadPlano onUploadSuccess={fetchPlanos} />
            <GerarPadrao />
          </Space>

          <Divider />

          <Title level={3}>Planos Cadastrados</Title>

          {loading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : planos.length === 0 ? (
            <Empty description="Nenhum plano cadastrado." />
          ) : (
            <div style={{ maxHeight: "800px", overflowY: "auto" }}>
              <List
                bordered
                dataSource={planos}
                renderItem={(plano) => (
                  <List.Item
                    key={plano.id}
                    style={{ padding: "16px 24px", cursor: "pointer" }}
                    onClick={() => handlePreview(plano)}
                    actions={[
                      <Tooltip title="Visualizar" key="view">
                        <Button
                          type="link"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(plano);
                          }}
                        >
                          Visualizar
                        </Button>
                      </Tooltip>,

                      <Tooltip title="Gerar PDF" key="pdf">
                        <Button
                          type="link"
                          icon={<DownloadOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF(Number(plano.id));
                          }}
                        />
                      </Tooltip>,

                      <Tooltip title="Duplicar" key="duplicate">
                        <Button
                          type="link"
                          icon={<CopyOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(Number(plano.id));
                          }}
                        />
                      </Tooltip>,

                      <Popconfirm
                        key="delete"
                        title="Tem certeza que deseja deletar este plano?"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          handleDelete(Number(plano.id));
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Sim"
                        cancelText="Não"
                      >
                        <Button
                          type="link"
                          danger
                          onClick={(e) => e.stopPropagation()}
                        >
                          Deletar
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ wordBreak: "break-word" }}>
                          {plano.originalName}
                        </div>
                      }
                      description={`Objetivos: ${
                        plano.objetivos?.slice(0, 40) ?? "—"
                      }`}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          <PlanoPreviewModal
            plano={selectedPlano}
            visible={previewVisible}
            onClose={handleClosePreview}
            onUpdated={fetchPlanos}
          />
        </Content>
      </Layout>

      <Footer />
    </div>
  );
}

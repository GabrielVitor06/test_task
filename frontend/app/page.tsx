"use client";

import { useState, useCallback, useEffect } from "react";
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
} from "antd";
import { DownloadOutlined, CopyOutlined } from "@ant-design/icons";
import UploadPlano from "@/components/UploadPlano";
import PlanoPreviewModal from "@/components/PlanoPreviewModal";
import GerarPadrao from "@/components/GerarPdfPadronizado";
import { Plano } from "@/types/types";

const { Title } = Typography;
const { Content } = Layout;

export default function Home() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const fetchPlanos = useCallback(async () => {
    try {
      const { data } = await axios.get<Plano[]>("http://localhost:4000/planos");
      setPlanos(data);
    } catch (error) {
      message.error("Erro ao carregar planos.");
      console.error(error);
    }
  }, []);

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
    try {
      await axios.delete(`http://localhost:4000/planos/${planoId}`);
      message.success("Plano deletado com sucesso!");
      fetchPlanos();
      if (selectedPlano?.id === planoId) {
        handleClosePreview();
      }
    } catch (error) {
      message.error("Erro ao deletar plano.");
      console.error(error);
    }
  };

  const handleDuplicate = async (planoId: number) => {
    try {
      await axios.post(`http://localhost:4000/planos/${planoId}/duplicar`);
      message.success("Plano duplicado com sucesso!");
      fetchPlanos();
    } catch (error) {
      message.error("Erro ao duplicar plano.");
      console.error(error);
    }
  };

  return (
    <Layout
      style={{ padding: 24, maxWidth: 1100, margin: "auto", width: "100%" }}
    >
      <Content style={{ padding: "0 16px" }}>
        <Title level={3}>Upload de Plano</Title>
        <Space>
          <UploadPlano onUploadSuccess={fetchPlanos} />
          <GerarPadrao />
        </Space>

        <Divider />

        <Title level={3}>Planos Cadastrados</Title>

        <List
          bordered
          dataSource={planos}
          locale={{ emptyText: "Nenhum plano cadastrado." }}
          renderItem={(plano) => (
            <List.Item
              key={plano.id}
              onClick={() => handlePreview(plano)}
              actions={[
                <Button
                  key="view"
                  type="link"
                  onClick={() => handlePreview(plano)}
                >
                  Visualizar
                </Button>,
                <Button
                  key="pdf"
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = `http://localhost:4000/planos/${plano.id}/pdf`;
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `plano_${plano.id}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Gerar PDF
                </Button>,
                <Button
                  key="duplicate"
                  type="link"
                  icon={<CopyOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(Number(plano.id));
                  }}
                >
                  Duplicar
                </Button>,
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

        <PlanoPreviewModal
          plano={selectedPlano}
          visible={previewVisible}
          onClose={handleClosePreview}
          onUpdated={fetchPlanos}
        />
      </Content>
    </Layout>
  );
}

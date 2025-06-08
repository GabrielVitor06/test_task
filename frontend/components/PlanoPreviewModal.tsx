"use client";

import { useState, useCallback, useEffect } from "react";
import { Modal, Button, Form, Input, message, Row, Col } from "antd";
import axios from "axios";
import mammoth from "mammoth";
import { Plano } from "@/types/types";

interface PlanoPreviewModalProps {
  plano: Plano | null;
  visible: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function PlanoPreviewModal({
  plano,
  visible,
  onClose,
  onUpdated,
}: PlanoPreviewModalProps) {
  const [docxHtml, setDocxHtml] = useState("");
  const [form] = Form.useForm();

  const loadDocx = useCallback(async (filePath: string) => {
    try {
      const response = await fetch(`http://localhost:4000/uploads/${filePath}`);
      const arrayBuffer = await response.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
      setDocxHtml(html);
    } catch (error) {
      setDocxHtml("Erro ao carregar o arquivo DOCX.");
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (plano) {
      form.setFieldsValue({
        objetivos: plano.objetivos,
        atividades: plano.atividades,
        avaliacao: plano.avaliacao,
      });
      setDocxHtml("");

      if (plano.filePath.endsWith(".docx")) {
        loadDocx(plano.filePath);
      }
    }
  }, [plano, form, loadDocx]);

  const onFinish = async (values: {
    objetivos: string;
    atividades: string;
    avaliacao: string;
  }) => {
    if (!plano) return;
    try {
      await axios.put(`http://localhost:4000/planos/${plano.id}`, values);
      message.success("Plano atualizado com sucesso!");
      onUpdated();
      onClose();
    } catch (error) {
      message.error("Erro ao atualizar plano.");
      console.error(error);
    }
  };

  return (
    <Modal
      open={visible}
      title={`Plano: ${plano?.originalName}`}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <Row gutter={24} wrap={true}>
        <Col xs={24} lg={12}>
          {plano?.filePath.endsWith(".pdf") ? (
            <iframe
              src={`http://localhost:4000/uploads/${plano.filePath}`}
              width="100%"
              height="600px"
              style={{ border: "1px solid #ccc", borderRadius: 4 }}
            />
          ) : plano?.filePath.endsWith(".docx") ? (
            <div
              style={{
                border: "1px solid #ccc",
                padding: 10,
                maxHeight: 600,
                overflowY: "auto",
                borderRadius: 4,
              }}
              dangerouslySetInnerHTML={{ __html: docxHtml }}
            />
          ) : (
            <p>Visualização para esse tipo de arquivo não implementada.</p>
          )}
        </Col>

        <Col xs={24} lg={12}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            preserve={false}
          >
            <Form.Item
              label="Objetivos"
              name="objetivos"
              rules={[{ required: true, message: "Informe os objetivos" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              label="Atividades"
              name="atividades"
              rules={[{ required: true, message: "Informe as atividades" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              label="Avaliação"
              name="avaliacao"
              rules={[{ required: true, message: "Informe a avaliação" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Salvar
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
}

"use client";

import { List, Button } from "antd";
import { Plano } from "@/types/types";

interface PlanoListProps {
  planos: Plano[];
  onPreview: (plano: Plano) => void;
}

export default function PlanoList({ planos, onPreview }: PlanoListProps) {
  return (
    <List
      header={<div>Planos de Aula</div>}
      dataSource={planos}
      renderItem={(item) => (
        <List.Item
          key={item.id}
          actions={[
            <Button key="preview" onClick={() => onPreview(item)}>
              Visualizar/Editar
            </Button>,
            <Button
              key="pdf"
              onClick={() =>
                window.open(
                  `http://localhost:4000/planos/${item.id}/pdf`,
                  "_blank",
                  "noopener noreferrer"
                )
              }
            >
              Gerar PDF
            </Button>,
          ]}
        >
          {item.originalName}
        </List.Item>
      )}
    />
  );
}

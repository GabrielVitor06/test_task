"use client";

import { Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import axios from "axios";

export default function GerarPadrao() {
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:4000/convert-pdf",
        formData,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data as BlobPart])
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "plano_padronizado.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      message.error("Erro ao gerar PDF padronizado.");
    }
  };

  const props: UploadProps = {
    customRequest: ({ file, onSuccess }) => {
      handleUpload(file as File);
      setTimeout(() => onSuccess?.("ok" as unknown), 0);
    },
    showUploadList: false,
  };

  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />} color="default" variant="solid">
        Gerar PDF Padronizado
      </Button>
    </Upload>
  );
}

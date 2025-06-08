"use client";

import { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

interface UploadPlanoProps {
  onUploadSuccess: () => void;
}

export default function UploadPlano({ onUploadSuccess }: UploadPlanoProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:4000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success(`${file.name} enviado com sucesso!`);
      onUploadSuccess();
    } catch (error) {
      message.error("Erro ao enviar arquivo.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Upload
      customRequest={({ file }) => handleUpload(file as File)}
      accept=".pdf,.docx"
      showUploadList={false}
      disabled={uploading}
    >
      <Button icon={<UploadOutlined />} loading={uploading}>
        Upload PDF ou DOCX
      </Button>
    </Upload>
  );
}

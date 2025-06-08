// backend/routes/convertPdf.ts
import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import fs from "fs";
import path from "path";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/convert-pdf", upload.single("file"), async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: "Arquivo ausente" });

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const texto = pdfData.text;

    // Extração simulada por regex (ajuste conforme seu padrão)
    const objetivo = texto.match(/Objetivo:(.*?)(\n|$)/)?.[1]?.trim() || "N/A";
    const atividades =
      texto.match(/Atividades:(.*?)(\n|$)/)?.[1]?.trim() || "N/A";
    const avaliacao =
      texto.match(/Avaliação:(.*?)(\n|$)/)?.[1]?.trim() || "N/A";

    // Geração com pdfmake
    const PdfPrinter = require("pdfmake");
    const fonts = {
      Roboto: {
        normal: "node_modules/pdfmake/fonts/Roboto-Regular.ttf",
        bold: "node_modules/pdfmake/fonts/Roboto-Medium.ttf",
        italics: "node_modules/pdfmake/fonts/Roboto-Italic.ttf",
        bolditalics: "node_modules/pdfmake/fonts/Roboto-MediumItalic.ttf",
      },
    };

    const printer = new PdfPrinter(fonts);
    const docDefinition = {
      content: [
        { text: "Plano de Aula Padronizado", style: "header" },
        { text: `Objetivo: ${objetivo}` },
        { text: `Atividades: ${atividades}` },
        { text: `Avaliação: ${avaliacao}` },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const outputPath = path.join("outputs", `${Date.now()}-plano.pdf`);
    const writeStream = fs.createWriteStream(outputPath);

    pdfDoc.pipe(writeStream);
    pdfDoc.end();

    writeStream.on("finish", () => {
      res.download(outputPath, () => {
        fs.unlinkSync(filePath);
        fs.unlinkSync(outputPath);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar PDF" });
  }
});

export default router;

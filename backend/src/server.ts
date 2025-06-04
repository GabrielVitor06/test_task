import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import PDFDocument from "pdfkit";

const prisma = new PrismaClient();
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "Arquivo é obrigatório" });

  const oldPath = path.join(req.file.destination, req.file.filename);
  const extension = path.extname(req.file.originalname); // pegar a extensão
  const newFilename = req.file.filename + extension;
  const newPath = path.join(req.file.destination, newFilename);

  fs.renameSync(oldPath, newPath);

  const plano = await prisma.planoAula.create({
    data: {
      originalName: req.file.originalname,
      filePath: newFilename, // salva o nome com extensão!
      objetivos: "",
      atividades: "",
      avaliacao: "",
    },
  });

  res.json(plano);
});

app.get("/planos", async (req, res) => {
  const planos = await prisma.planoAula.findMany();
  res.json(planos);
});

app.get("/planos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const plano = await prisma.planoAula.findUnique({ where: { id } });
  if (!plano) return res.status(404).json({ error: "Plano não encontrado" });
  res.json(plano);
});

app.put("/planos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { objetivos, atividades, avaliacao } = req.body;

  const plano = await prisma.planoAula.update({
    where: { id },
    data: { objetivos, atividades, avaliacao },
  });

  res.json(plano);
});

app.get("/planos/:id/pdf", async (req, res) => {
  const id = Number(req.params.id);
  const plano = await prisma.planoAula.findUnique({ where: { id } });
  if (!plano) return res.status(404).json({ error: "Plano não encontrado" });

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=plano_${id}.pdf`);

  doc.pipe(res);

  doc.fontSize(20).text("Plano de Aula Padronizado", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Objetivos:\n${plano.objetivos}\n\n`);
  doc.text(`Atividades:\n${plano.atividades}\n\n`);
  doc.text(`Avaliação:\n${plano.avaliacao}\n\n`);
  doc.end();
});

// Rota para deletar plano
app.delete("/planos/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const plano = await prisma.planoAula.findUnique({ where: { id } });

    if (!plano) {
      return res.status(404).json({ error: "Plano não encontrado" });
    }

    await prisma.planoAula.delete({ where: { id } });

    const filePath = path.join(__dirname, "..", "uploads", plano.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Plano deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar plano:", error);
    res.status(500).json({ error: "Erro ao deletar plano" });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});

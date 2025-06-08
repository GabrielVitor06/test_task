import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import PDFDocument from "pdfkit";
import pdfParse from "pdf-parse";
import bcrypt from "bcrypt";

dotenv.config();
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

// Upload de arquivo
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "Arquivo é obrigatório" });

  const oldPath = path.join(req.file.destination, req.file.filename);
  const extension = path.extname(req.file.originalname);
  const newFilename = req.file.filename + extension;
  const newPath = path.join(req.file.destination, newFilename);

  fs.renameSync(oldPath, newPath);

  const plano = await prisma.planoAula.create({
    data: {
      originalName: req.file.originalname,
      filePath: newFilename,
      objetivos: "",
      atividades: "",
      avaliacao: "",
      user: {
        connect: { id: 1 }, // Replace 1 with the actual user ID
      },
    },
  });

  res.json(plano);
});

// Listar todos os planos
app.get("/planos", async (req, res) => {
  const planos = await prisma.planoAula.findMany();
  res.json(planos);
});

// Obter um plano específico
app.get("/planos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const plano = await prisma.planoAula.findUnique({ where: { id } });
  if (!plano) return res.status(404).json({ error: "Plano não encontrado" });
  res.json(plano);
});

// Atualizar plano
app.put("/planos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { objetivos, atividades, avaliacao } = req.body;

  const plano = await prisma.planoAula.update({
    where: { id },
    data: { objetivos, atividades, avaliacao },
  });

  res.json(plano);
});

// Gerar PDF
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

// Deletar plano
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

// Duplicar plano
app.post("/planos/:id/duplicar", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const planoOriginal = await prisma.planoAula.findUnique({ where: { id } });

    if (!planoOriginal) {
      return res.status(404).json({ error: "Plano não encontrado" });
    }

    const planoDuplicado = await prisma.planoAula.create({
      data: {
        originalName: planoOriginal.originalName + " (cópia)",
        filePath: planoOriginal.filePath,
        objetivos: planoOriginal.objetivos,
        atividades: planoOriginal.atividades,
        avaliacao: planoOriginal.avaliacao,
        user: {
          connect: { id: 1 }, // Replace 1 with the actual user ID
        },
      },
    });

    res.status(201).json(planoDuplicado);
  } catch (error) {
    console.error("Erro ao duplicar plano:", error);
    res.status(500).json({ error: "Erro interno ao duplicar o plano." });
  }
});

app.post("/convert-pdf", upload.single("file"), async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: "Arquivo ausente" });

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const texto = (await pdfParse(dataBuffer)).text;

    const linhas = texto.split(/\r?\n/);

    function ehTitulo(linha: string) {
      linha = linha.trim();
      if (linha.length < 3 || linha.length > 50) return false;
      if (linha === linha.toUpperCase() && /[A-Z0-9]/.test(linha)) return true;

      const palavras = linha.split(" ");
      return (
        linha[0] === linha[0].toUpperCase() &&
        palavras.some((p) => p === p.toUpperCase() && p.length > 2)
      );
    }

    interface Secao {
      titulo: string;
      conteudo: string;
    }

    const secoes: Secao[] = [];
    let secaoAtual: Secao | null = null;

    for (let linha of linhas) {
      linha = linha.trim();
      if (!linha) continue;

      if (ehTitulo(linha)) {
        secaoAtual = { titulo: linha, conteudo: "" };
        secoes.push(secaoAtual);
      } else {
        if (secaoAtual) {
          secaoAtual.conteudo += (secaoAtual.conteudo ? "\n" : "") + linha;
        } else {
          secaoAtual = { titulo: "Introdução", conteudo: linha };
          secoes.push(secaoAtual);
        }
      }
    }

    const outputPath = path.join("uploads", `${Date.now()}-plano.pdf`);
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Plano de Aula Padronizado", { align: "center", underline: true });
    doc.moveDown(2);

    function adicionarSecao(titulo: string, conteudo: string) {
      doc.fontSize(14).font("Helvetica-Bold").fillColor("#333").text(titulo);
      doc.moveDown(0.3);
      doc.fontSize(12).font("Helvetica").fillColor("#000").text(conteudo, {
        align: "justify",
        indent: 20,
        lineGap: 4,
      });
      doc.moveDown(1);

      const posX = doc.page.margins.left;
      const posY = doc.y;
      doc
        .strokeColor("#aaa")
        .lineWidth(0.5)
        .moveTo(posX, posY)
        .lineTo(doc.page.width - doc.page.margins.right, posY)
        .stroke();
      doc.moveDown(1);
    }

    secoes.forEach(({ titulo, conteudo }) => adicionarSecao(titulo, conteudo));
    doc.end();

    writeStream.on("finish", () => {
      res.download(outputPath, () => {
        fs.unlinkSync(filePath);
        fs.unlinkSync(outputPath);
      });
    });

    writeStream.on("error", () =>
      res.status(500).json({ error: "Erro ao gerar arquivo PDF" })
    );
  } catch (err) {
    console.error("Erro no /convert-pdf:", err);
    res.status(500).json({ error: "Erro ao processar PDF" });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });
    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (error) {
    res.status(400).json({ error: "Erro ao cadastrar" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ error: "Senha incorreta" });

  res.status(200).json({ userId: user.id, name: user.name });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});

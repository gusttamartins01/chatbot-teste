import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/ask", async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Mensagem não pode ser vazia." });
  }

  try {
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-pro" },
      { apiVersion: "v1" } // versão estável da API
    );

    const result = await model.generateContent(message);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Erro ao usar o Gemini:", error);
    res.status(500).json({
      reply: "Erro ao se comunicar com a IA. Tente novamente mais tarde."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor rodando na porta ${PORT}`)
);
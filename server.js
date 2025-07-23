// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai'; // Para OpenAI
import { GoogleGenerativeAI } from '@google/generative-ai'; // Para Gemini
import dotenv from 'dotenv';

dotenv.config();

// ADICIONADO: console.log para verificar a chave do Gemini
console.log("DEBUG: GEMINI_API_KEY lida:", process.env.GEMINI_API_KEY ? "Sim (com valor)" : "Não (vazia ou indefinida)");
console.log("DEBUG: OPENAI_API_KEY lida:", process.env.OPENAI_API_KEY ? "Sim (com valor)" : "Não (vazia ou indefinida)");


const app = express();
// MANTIDO: CORS temporariamente aberto para facilitar o teste.
// Lembre-se de VOLTAR para app.use(cors({ origin: 'SUA_ORIGEM' })); em produção!
app.use(cors());


app.use(bodyParser.json());

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ADICIONADO: Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Usamos "gemini-pro" como modelo padrão. Você pode testar outros se tiver acesso, como "gemini-1.5-flash"
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); app.post('/ask', async (req, res) => { // ADICIONADO: Recebe 'apiType' do frontend, padrão é 'openai'
  const { message, apiType = 'openai' } = req.body;

  // ADICIONADO: Log para qual API está sendo usada
  console.log(`DEBUG: Requisição recebida para /ask com mensagem: "${message}" usando API: ${apiType}`);

  let aiResponse = "Desculpe, não consegui obter uma resposta agora. Tente novamente mais tarde.";

  try {
    if (apiType === 'gemini') {
      // Lógica para Gemini
      const result = await geminiModel.generateContent(message);
      const response = await result.response;
      aiResponse = response.text();
      console.log("DEBUG: Resposta do Gemini recebida com sucesso.");

    } else { // apiType é 'openai' ou não especificado
      // Lógica para OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Seu modelo GPT-4o
        messages: [{ role: "user", content: message }],
      });
      aiResponse = response.choices[0].message.content;
      console.log("DEBUG: Resposta da OpenAI recebida com sucesso.");
    }

    res.json({ reply: aiResponse });

  } catch (err) {
    // MANTIDO E MELHORADO: Log de erro mais detalhado
    console.error(`DEBUG: Erro na API (${apiType}):`, err.response ? err.response.data : err.message);
    res.status(500).json({ error: aiResponse }); // Envia a mensagem de erro padrão
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
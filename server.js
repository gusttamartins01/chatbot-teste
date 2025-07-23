// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // Adicionado: para fazer requisições HTTP

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
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ADICIONADO: Variável para armazenar o qaBank carregado dinamicamente
let dynamicQaBank = {};

// ADICIONADO: URL da sua API do Google Apps Script
const GOOGLE_SHEETS_API_URL = 'https://script.google.com/a/macros/unifametro.edu.br/s/AKfycbyLwTEnK_BCR3qikpUgIbuuSDyQN2IQhCf4pxiDCk22OSFBzuPOupmMAOsreWg8YDGW/exec';

// ADICIONADO: Função para carregar o qaBank do Google Sheets
async function loadQaBank() {
  try {
    console.log("DEBUG: Carregando qaBank do Google Sheets...");
    const response = await fetch(GOOGLE_SHEETS_API_URL);
    const data = await response.json();

    const newQaBank = {};
    data.forEach(item => {
      // Assumindo que suas colunas na planilha são 'Pergunta' e 'Resposta'
      if (item.Pergunta && item.Resposta) {
        newQaBank[item.Pergunta.toLowerCase().trim()] = item.Resposta;
      }
    });
    dynamicQaBank = newQaBank;
    console.log("DEBUG: qaBank carregado com sucesso do Google Sheets.");
    // console.log("DEBUG: Conteúdo do qaBank carregado:", dynamicQaBank); // Descomente para depurar
  } catch (error) {
    console.error("ERRO: Falha ao carregar qaBank do Google Sheets:", error.message);
    console.warn("AVISO: Usando qaBank vazio devido à falha no carregamento. Verifique sua planilha e URL do Apps Script.");
    dynamicQaBank = {}; // Garante que o qaBank esteja vazio em caso de erro
  }
}

// Chame a função para carregar o qaBank quando o servidor iniciar
loadQaBank();

// ADICIONADO: Instrução de sistema e Conhecimento da Faculdade
const systemInstruction = `Você é um assistente virtual da **Faculdade Alfa**. Seu objetivo principal é fornecer informações **precisas, oficiais e úteis** sobre os seguintes tópicos da Faculdade Alfa:
- **Cursos:** graduação, pós-graduação, extensões (especificando nomes e áreas se possível).
- **Processos Acadêmicos:** matrícula, rematrícula, trancamento, transferência, emissão de documentos (histórico, declaração), colação de grau.
- **Serviços ao Aluno:** Portal do Aluno, Secretaria, Financeiro, Biblioteca, Suporte Técnico, Núcleo de Estágios, Ouvidoria.
- **Eventos e Calendário:** datas importantes, workshops, palestras, semanas acadêmicas.
- **Infraestrutura:** localização dos campi, blocos, cantina, segurança.

**Regras Essenciais:**
1.  **Prioridade:** Sempre priorize as informações oficiais da Faculdade Alfa.
2.  **Limite de Conhecimento:** Sua base de conhecimento é limitada aos dados da Faculdade Alfa.
3.  **Encaminhamento:** Se uma pergunta for **fora do escopo** da Faculdade Alfa, ou se você **não tiver a informação exata**, direcione o usuário para os canais oficiais (site: www.faculdadealfa.com.br, e-mail da secretaria: secretaria@faculdadealfa.com.br, telefone: (XX) XXXX-XXXX).
4.  **Linguagem:** Use uma linguagem profissional, clara, objetiva e amigável.
5.  **Não Alucinar:** Nunca invente informações. Se não souber, diga que não sabe e encaminhe.`;

const FACULDADE_CONHECIMENTO = `
# Informações da Faculdade Alfa

**Cursos de Graduação:**
* **Engenharia de Software:** 8 semestres, turno noturno. Foco em desenvolvimento de sistemas, metodologias ágeis e inteligência artificial.
* **Administração:** 8 semestres, turnos diurno e noturno. Abrange gestão, finanças, marketing e recursos humanos.
* **Direito:** 10 semestres, turno diurno. Preparação para carreiras jurídicas com ênfase em ética e prática.
* **Arquitetura e Urbanismo:** 10 semestres, turno diurno. Projetos, urbanismo sustentável e história da arquitetura.

**Processos de Matrícula:**
* **Calouros:** Inscrições abertas de 1º de agosto a 15 de setembro. Documentos necessários: RG, CPF, Histórico Escolar do Ensino Médio, Certificado de Conclusão, comprovante de residência. Inscrição online no portal do aluno.
* **Veteranos:** Rematrícula de 20 a 30 de julho através do Portal do Aluno.

**Horários de Atendimento:**
* **Secretaria Acadêmica:** Segunda a sexta, das 8h às 18h.
* **Setor Financeiro:** Segunda a sexta, das 9h às 17h.
* **Biblioteca:** Segunda a sexta, das 8h às 20h; Sábados, das 9h às 13h.

**Contato:**
* **Site Oficial:** www.faculdadealfa.com.br
* **E-mail Secretaria:** secretaria@faculdadealfa.com.br
* **Telefone Geral:** (85) 3212-3456
* **Endereço:** Rua das Pedras, 123, Bairro Centro, Fortaleza-CE. CEP: 60000-000.

**Eventos Próximos:**
* **Semana de Engenharia de Software:** 22 a 26 de agosto. Palestras e workshops sobre tendências em TI.
* **Feira de Carreiras:** 10 de setembro. Empresas parceiras com vagas de estágio e emprego.

**Estrutura da Faculdade:**
* **Bloco A:** Salas de aula de Administração e Direito.
* **Bloco B:** Laboratórios de informática e Engenharia de Software.
* **Bloco C:** Biblioteca e salas de estudo.
* **Cantina:** Próximo à entrada principal.
* **Estacionamento:** Disponível para alunos e visitantes.

**Ouvidoria:** Canal para sugestões, reclamações e elogios no site oficial.
`;


app.post('/ask', async (req, res) => {
  const { message, apiType = 'gemini' } = req.body; // Padrão agora é 'gemini'
  const lowerCaseQuestion = message.toLowerCase().trim();

  console.log(`DEBUG: Requisição recebida para /ask com mensagem: "${message}" usando API: ${apiType}`);

  let aiResponse = "Desculpe, não consegui obter uma resposta agora. Por favor, tente novamente mais tarde ou entre em contato com a secretaria da faculdade para informações mais detalhadas.";
  let foundLocalResponse = false; // Flag para verificar se a resposta foi local

  // 1. Tentar encontrar uma resposta direta no qaBank dinâmico
  if (dynamicQaBank[lowerCaseQuestion]) {
      aiResponse = dynamicQaBank[lowerCaseQuestion];
      foundLocalResponse = true;
      console.log("DEBUG: Resposta encontrada no qaBank dinâmico (correspondência exata).");
  } else {
      // 2. Procurar por palavras-chave no qaBank dinâmico (regex)
      for (const key in dynamicQaBank) {
          // Criar regex para buscar palavras inteiras e ignorar maiúsculas/minúsculas
          // O `key` da planilha pode ser 'horarios' ou 'oi|ola'.
          // Usamos 'oi|ola' para o regex, mas a resposta é o valor associado a 'oi|ola' na planilha.
          const regex = new RegExp(`\\b(${key.split('|').join('|')})\\b`, 'i');
          if (regex.test(lowerCaseQuestion)) {
              aiResponse = dynamicQaBank[key];
              foundLocalResponse = true;
              console.log("DEBUG: Resposta por palavra-chave encontrada no qaBank dinâmico.");
              break; // Encontrou uma resposta, parar de procurar
          }
      }
  }

  // Se uma resposta local foi encontrada, envia e termina
  if (foundLocalResponse) {
      res.json({ reply: aiResponse });
      return;
  }

  // 3. Se nenhuma resposta for encontrada no banco de dados local, consultar a IA
  try {
    const fullPrompt = `${systemInstruction}\n\n${FACULDADE_CONHECIMENTO}\n\nPergunta do Aluno: ${message}`;

    if (apiType === 'gemini') {
      const result = await geminiModel.generateContent(fullPrompt); // Enviando o fullPrompt
      const response = await result.response;
      aiResponse = response.text();
      console.log("DEBUG: Resposta do Gemini recebida com sucesso.");

    } else { // apiType é 'openai' ou não especificado
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemInstruction }, // Instrução separada
          { role: "user", content: `Contexto da Faculdade:\n${FACULDADE_CONHECIMENTO}\n\nPergunta do Aluno: ${message}` } // Conhecimento e pergunta no user role
        ],
      });
      aiResponse = response.choices[0].message.content;
      console.log("DEBUG: Resposta da OpenAI recebida com sucesso.");
    }

    res.json({ reply: aiResponse });

  } catch (err) {
    console.error(`DEBUG: Erro na API (${apiType}):`, err.response ? err.response.data : err.message);
    res.status(500).json({ error: aiResponse }); // Envia a mensagem de erro padrão
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
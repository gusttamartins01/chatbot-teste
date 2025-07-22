// script.js
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const faqButtons = document.getElementById('faq-buttons');

    // Banco de Perguntas e Respostas (FAQ e Dúvidas Gerais)
    const qaBank = {
        // Perguntas Frequentes (FAQs) - Mapeadas pelo data-question nos botões
        "horarios": "Os horários de aula para o semestre atual podem ser consultados diretamente no Portal do Aluno, na seção 'Minhas Disciplinas' ou no calendário acadêmico disponível no site da faculdade.",
        "matricula": "O processo de matrícula para calouros e veteranos envolve inscrição online, envio de documentos digitais e, em alguns casos, comparecimento presencial na secretaria. Consulte o edital de matrícula no site oficial para o cronograma e detalhes específicos.",
        "financeiro": "Para dúvidas financeiras como boletos, mensalidades, parcelamentos, bolsas de estudo ou informações sobre FIES/Prouni, por favor, entre em contato com o Setor Financeiro da faculdade através do telefone (XX) XXXX-XXXX (horário comercial) ou pelo e-mail financeiro@faculdade.com. Você também pode acessar a área financeira no Portal do Aluno.",
        "suporte": "Se você precisa de suporte técnico para problemas com o Portal do Aluno, ambiente virtual de aprendizagem (AVA), acesso ao e-mail institucional ou outras plataformas digitais, envie um e-mail para suporte@faculdade.com.br ou ligue para (XX) YYYY-YYYY.",
        "biblioteca": "Nossa biblioteca oferece um vasto acervo físico e digital. Para acesso, empréstimos, renovações ou pesquisa, visite a seção da biblioteca no site da faculdade ou entre em contato pelo telefone (XX) ZZZZ-ZZZZ. O horário de funcionamento é de segunda a sexta, das 8h às 20h.",
        "estagio": "Para informações sobre oportunidades de estágio, convênios com empresas, documentos e requisitos, procure o Núcleo de Estágios da faculdade. Eles podem ser contatados por e-mail (estagios@faculdade.com) ou presencialmente na sala X.",
        "secretaria": "A Secretaria Acadêmica é responsável por emissão de declarações, históricos, diplomas, trancamento e transferência. Você pode solicitar muitos serviços online pelo Portal do Aluno ou agendar um atendimento presencial. O e-mail para contato é secretaria@faculdade.com.",
        "eventos": "Mantenha-se atualizado sobre os próximos eventos, workshops, palestras e atividades acadêmicas consultando o calendário de eventos no site da faculdade ou acompanhando nossas redes sociais.",
        "bolsas": "Temos diversas opções de bolsas de estudo e convênios. Para saber mais sobre os critérios de elegibilidade e como se candidatar, acesse a página de Bolsas e Financiamentos em nosso site. Nosso setor financeiro também pode te auxiliar.",
        "transferencia": "Para solicitar transferência interna ou externa, verifique os requisitos e a documentação necessária na Secretaria Acadêmica. O processo e os prazos estão detalhados no edital de transferências.",

        // Dúvidas Gerais (palavras-chave separadas por '|')
        "oi|ola|olá|bom dia|boa tarde|boa noite": "Olá! Seja bem-vindo(a) ao nosso chat de dúvidas. Como posso te ajudar hoje?",
        "localizacao|endereco|onde fica": "Nosso campus principal está localizado na Rua Exemplo, 123, Bairro Central, Fortaleza - CE. Temos também polos de apoio em outras regiões, que podem ser consultados em nosso site.",
        "cursos|graduacao|pos-graduacao|faculdade|quais cursos": "Oferecemos uma ampla gama de cursos de graduação e pós-graduação nas mais diversas áreas. Você pode explorar nosso catálogo completo de cursos com ementas e informações sobre o corpo docente em nosso site oficial.",
        "professores|docentes|quem são os professores": "Nosso corpo docente é altamente qualificado, composto por mestres e doutores com vasta experiência de mercado. As informações detalhadas sobre os professores de cada curso estão disponíveis na página do curso em nosso site.",
        "portal do aluno": "O Portal do Aluno é sua principal ferramenta para acesso a notas, faltas, materiais de aula, boletos e solicitações acadêmicas. Se tiver dificuldades de login, use a opção 'Esqueci minha senha' ou entre em contato com o suporte técnico.",
        "metodologia|ensino": "Nossa metodologia de ensino é focada na prática e inovação, combinando teoria com projetos aplicados, estudos de caso e uso de tecnologias avançadas, preparando você para o mercado de trabalho.",
        "restaurante|cantina|lanchonete": "Sim, temos opções de alimentação no campus, incluindo cantina e lanchonetes com variedade de refeições e lanches. Verifique os horários de funcionamento no local.",
        "seguranca": "A segurança de nossos alunos é prioridade. Contamos com equipe de segurança 24h, monitoramento por câmeras e controle de acesso nas dependências da faculdade.",
        "ouvidoria|reclamacao|sugestao|elogio": "Para registrar uma reclamação, sugestão, elogio ou solicitar informações gerais, utilize nosso canal da Ouvidoria, disponível no site da faculdade. Sua manifestação é muito importante para nós.",
        "calendario academico": "O calendário acadêmico completo, com datas de matrículas, provas, recessos e feriados, está disponível para consulta e download no site oficial da faculdade.",
        "como entrar|inscricao|vestibular|matricule-se": "As formas de ingresso em nossa faculdade incluem vestibular tradicional, vestibular agendado, uso da nota do ENEM, transferência externa e portador de diploma. Visite nossa página 'Como Ingressar' para mais detalhes.",
        "certificado|diploma": "A emissão de certificados e diplomas é feita pela Secretaria Acadêmica após a conclusão de todos os requisitos do curso. O prazo e o procedimento para retirada são informados no Portal do Aluno.",
        "monitoria": "Programas de monitoria estão disponíveis em diversas disciplinas. Alunos interessados devem consultar os editais específicos e os professores das disciplinas para participar.",
        "trancamento": "O trancamento de matrícula pode ser solicitado na Secretaria Acadêmica dentro dos prazos estabelecidos pelo calendário. Verifique os requisitos e implicações antes de solicitar.",
        "aulas online|ead|online": "Alguns de nossos cursos possuem componentes ou são totalmente na modalidade de Educação a Distância (EAD). O acesso é feito pela plataforma AVA. Para mais informações, consulte a página do curso desejado.",
        "cancelar matricula|cancelamento": "Para o cancelamento da matrícula, é necessário formalizar o pedido na Secretaria Acadêmica, observando as políticas e os prazos estabelecidos em contrato e regimento interno."
    };

    // Funções de utilidade
    const addMessage = (text, type) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        messageDiv.innerHTML = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Rolar para a última mensagem
    };

    // ADICIONADO: Nova função para chamar a API de IA (OpenAI ou Gemini)
    const callAI = async (question, apiType) => {
        // Adiciona uma mensagem de "digitando..."
        const typingMessageDiv = document.createElement('div');
        typingMessageDiv.classList.add('message', 'received', 'typing-indicator');
        typingMessageDiv.innerHTML = 'Digitando...';
        chatMessages.appendChild(typingMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('http://localhost:3000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // ENVIAR apiType JUNTO COM A MENSAGEM
                body: JSON.stringify({ message: question, apiType: apiType })
            });
            const data = await response.json();

            // Remove o indicador de digitação
            chatMessages.removeChild(typingMessageDiv);

            if (data.reply) {
                addMessage(data.reply, 'received');
            } else {
                addMessage("Desculpe, não consegui obter uma resposta da IA. Tente novamente mais tarde.", 'received');
            }
        } catch (error) {
            console.error('Erro ao buscar resposta da IA:', error);
            // Remove o indicador de digitação mesmo em erro
            chatMessages.removeChild(typingMessageDiv);
            addMessage("Ocorreu um erro ao tentar responder sua pergunta. Tente novamente mais tarde.", 'received');
        }
    };


    const handleBotResponse = async (question) => {
        const lowerCaseQuestion = question.toLowerCase().trim(); // Limpa espaços em branco
        let foundResponse = false;

        // 1. Tentar encontrar uma resposta direta (para FAQs dos botões)
        if (qaBank[lowerCaseQuestion]) {
            addMessage(qaBank[lowerCaseQuestion], 'received');
            foundResponse = true;
        } else {
            // 2. Procurar por palavras-chave (regex para múltiplos termos ou palavra única)
            for (const key in qaBank) {
                // Criar regex para buscar palavras inteiras e ignorar maiúsculas/minúsculas
                const regex = new RegExp(`\\b(${key.split('|').join('|')})\\b`, 'i');
                if (regex.test(lowerCaseQuestion)) {
                    addMessage(qaBank[key], 'received');
                    foundResponse = true;
                    break; // Encontrou uma resposta, parar de procurar
                }
            }
        }

        // 3. Se nenhuma resposta for encontrada no banco de dados local, consultar o backend
        if (!foundResponse) {
            // ALTERADO: Agora chama a nova função callAI e especifica 'gemini'
            // Você pode mudar 'gemini' para 'openai' se quiser testar a OpenAI novamente
            // ou adicionar uma forma de o usuário escolher a API.
            callAI(question, 'gemini');
        }
    };

    // Função para enviar a mensagem
    const sendMessage = () => {
        const messageText = userInput.value.trim();
        if (messageText) {
            addMessage(messageText, 'sent');
            userInput.value = ''; // Limpa o input
            handleBotResponse(messageText);
        }
    };

    // Event Listeners
    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    faqButtons.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const questionKey = event.target.dataset.question;
            if (questionKey) {
                addMessage(event.target.textContent, 'sent'); // Adiciona o texto do botão como mensagem enviada
                handleBotResponse(questionKey); // Usa a chave do data-question para a resposta
            }
        }
    });
});
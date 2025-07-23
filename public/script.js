// script.js
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const faqButtons = document.getElementById('faq-buttons');

    // REMOVIDO: const qaBank = { ... };
    // A lógica do qaBank agora está no backend (server.js)

    // Funções de utilidade
    const addMessage = (text, type) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        messageDiv.innerHTML = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Rolar para a última mensagem
    };

    // Função para chamar a API de IA (ou backend que decide a IA/qaBank)
    const callBackend = async (question) => { // Renomeado para ser mais genérico
        // Adiciona uma mensagem de "digitando..."
        const typingMessageDiv = document.createElement('div');
        typingMessageDiv.classList.add('message', 'received', 'typing-indicator');
        typingMessageDiv.innerHTML = 'Digitando...';
        chatMessages.appendChild(typingMessageDiv);
        chatMessages.scrollTop = chatMessages.classList.add('message', 'received', 'typing-indicator');

        try {
            const response = await fetch('http://localhost:3000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // O backend agora decide se usa qaBank ou IA, e qual IA.
                // Não precisamos enviar apiType aqui, a menos que você queira
                // permitir ao usuário escolher qual IA usar no frontend.
                // Mantive 'gemini' como padrão para testes, mas o backend pode ignorar.
                body: JSON.stringify({ message: question, apiType: 'gemini' })
            });
            const data = await response.json();

            // Remove o indicador de digitação
            chatMessages.removeChild(typingMessageDiv);

            if (data.reply) {
                addMessage(data.reply, 'received');
            } else {
                addMessage("Desculpe, não consegui obter uma resposta. Tente novamente mais tarde.", 'received');
            }
        } catch (error) {
            console.error('Erro ao buscar resposta do backend:', error);
            // Remove o indicador de digitação mesmo em erro
            chatMessages.removeChild(typingMessageDiv);
            addMessage("Ocorreu um erro ao tentar responder sua pergunta. Por favor, tente novamente mais tarde.", 'received');
        }
    };


    const handleBotResponse = async (question) => {
        // A lógica de verificar o qaBank ou chamar a IA está agora totalmente no backend.
        // Apenas enviamos a pergunta para o backend.
        callBackend(question);
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
            const questionText = event.target.textContent; // O texto visível no botão
            const questionKey = event.target.dataset.question; // A chave real associada (ex: "horarios")

            addMessage(questionText, 'sent'); // Adiciona o texto do botão como mensagem enviada

            // Enviamos a chave do data-question para o backend.
            // O backend a usará para tentar uma correspondência exata no qaBank (planilha).
            handleBotResponse(questionKey);
        }
    });

    // Mensagem de boas-vindas inicial do bot
    addMessage("Olá! Seja bem-vindo(a) ao nosso chat de dúvidas. Como posso te ajudar hoje?", 'received');
});
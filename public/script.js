document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const faqButtons = document.getElementById('faq-buttons');

    const addMessage = (text, type) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        messageDiv.innerHTML = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const callAI = async (question) => {
        // Indicador "Digitando..."
        const typingMessageDiv = document.createElement('div');
        typingMessageDiv.classList.add('message', 'received', 'typing-indicator');
        typingMessageDiv.innerHTML = 'Digitando...';
        chatMessages.appendChild(typingMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('http://localhost:3000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question })
            });
            const data = await response.json();

            chatMessages.removeChild(typingMessageDiv);

            if (data.reply) {
                addMessage(data.reply, 'received');
            } else {
                addMessage("Desculpe, não consegui obter uma resposta agora.", 'received');
            }
        } catch (error) {
            console.error('Erro ao buscar resposta do servidor:', error);
            chatMessages.removeChild(typingMessageDiv);
            addMessage("Erro ao se comunicar com o servidor. Tente mais tarde.", 'received');
        }
    };

    const sendMessage = () => {
        const messageText = userInput.value.trim();
        if (messageText) {
            addMessage(messageText, 'sent');
            userInput.value = '';
            callAI(messageText);
        }
    };

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') sendMessage();
    });

    faqButtons.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const questionKey = event.target.dataset.question;
            if (questionKey) {
                addMessage(event.target.textContent, 'sent');
                callAI(questionKey);
            }
        }
    });
});

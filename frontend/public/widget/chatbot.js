/**
 * AI Chatbot Widget - Embeddable Chat Interface
 * This script creates and initializes the chat widget on external websites
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.ChatWidgetInitialized) {
    console.warn('Chat widget already initialized');
    return;
  }

  window.ChatWidgetInitialized = true;

  // Default configuration
  const defaultConfig = {
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Outfit, system-ui, -apple-system, sans-serif'
    },
    welcomeMessage: 'Hi! How can I help you today?',
    botName: 'AI Assistant',
    botAvatar: '/bot-avatar.png',
    displayMode: 'popup',
    position: 'bottom-right',
    size: 'medium',
    voiceEnabled: true,
    ragEnabled: true,
    defaultVoiceEngine: 'openai',
    defaultTextModel: 'gpt',
    temperature: 0.7,
    maxTokens: 1024
  };

  // Widget initialization function
  window.initChatWidget = function(userConfig = {}) {
    const config = { ...defaultConfig, ...userConfig };

    // Load Outfit font from Google Fonts
    if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Outfit"]')) {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(fontLink);
    }

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'ai-chatbot-widget-root';
    widgetContainer.setAttribute('data-widget', 'true');
    document.body.appendChild(widgetContainer);

    // Create widget structure
    createWidget(widgetContainer, config);

    console.log('Chat widget initialized successfully', config);
  };

  function createWidget(container, config) {
    // Widget state
    let isOpen = false;
    let messages = [
      {
        id: generateId(),
        role: 'assistant',
        content: config.welcomeMessage,
        timestamp: new Date()
      }
    ];

    // Get position classes for floating button
    const getPositionClass = () => {
      const positions = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4'
      };
      return positions[config.position] || 'bottom-4 right-4';
    };

    // Get position classes for chat window (with more spacing from bottom)
    const getChatWindowPosition = () => {
      const positions = {
        'bottom-right': 'bottom-20 right-4',
        'bottom-left': 'bottom-20 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4'
      };
      return positions[config.position] || 'bottom-20 right-4';
    };

    // Create floating button
    const createFloatingButton = () => {
      const button = document.createElement('button');
      button.id = 'chat-widget-button';
      button.className = `fixed ${getPositionClass()} p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-[9999]`;
      button.style.background = `linear-gradient(135deg, ${config.theme.primaryColor}, ${config.theme.secondaryColor})`;
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;

      button.addEventListener('click', toggleWidget);
      return button;
    };

    // Create chat window
    const createChatWindow = () => {
      const chatWindow = document.createElement('div');
      chatWindow.id = 'chat-widget-window';
      chatWindow.className = `fixed ${getChatWindowPosition()} w-96 bg-white rounded-xl shadow-2xl flex-col overflow-hidden z-[9999] hidden`;
      chatWindow.style.height = '70vh';
      chatWindow.style.backgroundColor = config.theme.backgroundColor;

      chatWindow.innerHTML = `
        <div class="flex items-center justify-between p-4 border-b" style="background: linear-gradient(135deg, ${config.theme.primaryColor}, ${config.theme.secondaryColor})">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${config.theme.primaryColor}" stroke-width="2">
                <rect width="18" height="10" x="3" y="11" rx="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
                <line x1="8" x2="8" y1="16" y2="16"/>
                <line x1="16" x2="16" y1="16" y2="16"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-white">${config.botName}</h3>
              <p class="text-xs text-white/80">Online</p>
            </div>
          </div>
          <button id="close-widget" class="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <line x1="18" x2="6" y1="6" y2="18"></line>
              <line x1="6" x2="18" y1="6" y2="18"></line>
            </svg>
          </button>
        </div>

        <div id="messages-container" class="flex-1 overflow-y-auto p-4 space-y-4" style="font-family: ${config.theme.fontFamily}">
          <!-- Messages will be added here -->
        </div>

        <div class="border-t p-4">
          <div class="flex gap-2">
            <input
              id="message-input"
              type="text"
              placeholder="Type your message..."
              class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style="border-color: ${config.theme.primaryColor}20; color: ${config.theme.textColor}"
            />
            <button
              id="send-button"
              class="p-2 rounded-lg text-white transition-colors"
              style="background: ${config.theme.primaryColor}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <line x1="22" x2="11" y1="2" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      `;

      // Add event listeners
      const closeButton = chatWindow.querySelector('#close-widget');
      const sendButton = chatWindow.querySelector('#send-button');
      const input = chatWindow.querySelector('#message-input');

      closeButton.addEventListener('click', toggleWidget);
      sendButton.addEventListener('click', sendMessage);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
      });

      return chatWindow;
    };

    // Toggle widget visibility
    function toggleWidget() {
      isOpen = !isOpen;
      const button = document.getElementById('chat-widget-button');
      const window = document.getElementById('chat-widget-window');

      if (isOpen) {
        // Hide button and show chat window
        button.style.setProperty('display', 'none', 'important');
        window.style.setProperty('display', 'flex', 'important');
        renderMessages();
      } else {
        // Show button and hide chat window
        button.style.setProperty('display', 'flex', 'important');
        window.style.setProperty('display', 'none', 'important');
      }
    }

    // Send message
    function sendMessage() {
      const input = document.getElementById('message-input');
      const content = input.value.trim();

      if (!content) return;

      // Add user message
      messages.push({
        id: generateId(),
        role: 'user',
        content: content,
        timestamp: new Date()
      });

      input.value = '';
      renderMessages();

      // Simulate AI response
      setTimeout(() => {
        messages.push({
          id: generateId(),
          role: 'assistant',
          content: 'This is a demo response. In production, this would connect to your AI backend.',
          timestamp: new Date()
        });
        renderMessages();
      }, 1000);
    }

    // Render messages
    function renderMessages() {
      const container = document.getElementById('messages-container');
      container.innerHTML = messages.map(msg => {
        const isUser = msg.role === 'user';
        return `
          <div class="flex ${isUser ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[80%] p-3 rounded-lg ${isUser ? 'text-white' : 'bg-gray-100'}" style="${isUser ? `background: ${config.theme.primaryColor}` : ''}">
              <p class="text-sm">${escapeHtml(msg.content)}</p>
            </div>
          </div>
        `;
      }).join('');

      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
    }

    // Initialize widget
    const floatingButton = createFloatingButton();
    const chatWindow = createChatWindow();

    container.appendChild(floatingButton);
    container.appendChild(chatWindow);

    // Render initial messages
    renderMessages();
  }

  // Helper functions
  function generateId() {
    return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Auto-initialize if config is provided
  if (window.chatWidgetConfig) {
    window.initChatWidget(window.chatWidgetConfig);
  }
})();

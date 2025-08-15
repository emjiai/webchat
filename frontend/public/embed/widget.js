/**
 * AI Chatbot Widget Embed Script
 * This script loads and initializes the chatbot widget on any webpage
 */

(function() {
    'use strict';
  
    // Default configuration
    const defaultConfig = {
      theme: 'light',
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      fontFamily: 'Outfit, system-ui, sans-serif',
      borderRadius: 16,
      mode: 'popup',
      position: 'bottom-right',
      size: 'medium',
      welcomeMessage: "Hello! I'm your AI assistant. How can I help you today?",
      placeholder: 'Type a message or click the mic to speak...',
      avatarUrl: '',
      botName: 'AI Assistant',
      enableVoice: true,
      defaultVoiceEngine: 'openai',
      voiceAutoPlay: false,
      speechRate: 1.0,
      defaultLLM: 'gpt',
      temperature: 0.7,
      maxTokens: 1000,
      enableRAG: true,
      maxRetrievalResults: 5,
      minRelevanceScore: 0.7,
      streamResponses: true,
      enableTypingIndicator: true,
      enableSoundEffects: true,
      persistConversation: true,
      conversationTimeout: 3600000
    };
  
    // Widget class
    class AIChatWidget {
      constructor(config) {
        this.config = { ...defaultConfig, ...config };
        this.container = null;
        this.iframe = null;
        this.isOpen = false;
        this.messageHandlers = new Map();
        this.init();
      }
  
      init() {
        // Create container
        this.createContainer();
        
        // Create iframe
        this.createIframe();
        
        // Create toggle button for popup mode
        if (this.config.mode === 'popup') {
          this.createToggleButton();
        }
        
        // Set up message listeners
        this.setupMessageListeners();
        
        // Apply custom styles
        this.applyStyles();
        
        // Initialize widget state
        this.loadState();
      }
  
      createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'ai-chatbot-widget-container';
        this.container.className = 'ai-chatbot-widget';
        document.body.appendChild(this.container);
      }
  
      createIframe() {
        this.iframe = document.createElement('iframe');
        this.iframe.id = 'ai-chatbot-widget-iframe';
        this.iframe.src = this.getIframeSrc();
        this.iframe.style.cssText = this.getIframeStyles();
        this.container.appendChild(this.iframe);
      }
  
      getIframeSrc() {
        const params = new URLSearchParams({
          config: JSON.stringify(this.config)
        });
        return `${window.location.origin}/embed?${params}`;
      }
  
      getIframeStyles() {
        const styles = {
          popup: `
            position: fixed;
            ${this.getPositionStyles()}
            width: ${this.getSizeWidth()}px;
            height: 600px;
            border: none;
            border-radius: ${this.config.borderRadius}px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 99999;
            display: ${this.isOpen ? 'block' : 'none'};
            transition: all 0.3s ease;
          `,
          inline: `
            width: 100%;
            height: 100%;
            min-height: 400px;
            border: none;
            border-radius: ${this.config.borderRadius}px;
          `,
          fullscreen: `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            z-index: 99999;
            display: ${this.isOpen ? 'block' : 'none'};
          `
        };
  
        return styles[this.config.mode] || styles.popup;
      }
  
      getPositionStyles() {
        const positions = {
          'bottom-right': 'bottom: 20px; right: 20px;',
          'bottom-left': 'bottom: 20px; left: 20px;',
          'top-right': 'top: 20px; right: 20px;',
          'top-left': 'top: 20px; left: 20px;',
          'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
        };
        return positions[this.config.position] || positions['bottom-right'];
      }
  
      getSizeWidth() {
        const sizes = {
          small: 350,
          medium: 400,
          large: 450
        };
        return sizes[this.config.size] || sizes.medium;
      }
  
      createToggleButton() {
        const button = document.createElement('button');
        button.id = 'ai-chatbot-toggle-button';
        button.innerHTML = this.getChatIcon();
        button.style.cssText = `
          position: fixed;
          ${this.getPositionStyles()}
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.config.secondaryColor});
          border: none;
          cursor: pointer;
          z-index: 99998;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        `;
        
        button.addEventListener('click', () => this.toggle());
        button.addEventListener('mouseenter', () => {
          button.style.transform = 'scale(1.1)';
        });
        button.addEventListener('mouseleave', () => {
          button.style.transform = 'scale(1)';
        });
        
        this.container.appendChild(button);
        this.toggleButton = button;
      }
  
      getChatIcon() {
        return `
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      }
  
      setupMessageListeners() {
        window.addEventListener('message', (event) => {
          if (event.origin !== window.location.origin) return;
          
          const { type, data } = event.data;
          
          switch (type) {
            case 'widget-ready':
              this.onReady();
              break;
            case 'widget-message':
              this.onMessage(data);
              break;
            case 'widget-close':
              this.close();
              break;
            case 'widget-resize':
              this.resize(data);
              break;
            case 'widget-error':
              this.onError(data);
              break;
          }
        });
      }
  
      applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
          .ai-chatbot-widget {
            font-family: ${this.config.fontFamily};
          }
          
          #ai-chatbot-toggle-button {
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% {
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            50% {
              box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
            }
            100% {
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
          }
          
          @media (max-width: 480px) {
            #ai-chatbot-widget-iframe {
              width: calc(100vw - 40px) !important;
              max-width: 400px !important;
            }
          }
        `;
        document.head.appendChild(style);
      }
  
      loadState() {
        const savedState = localStorage.getItem('ai-chatbot-state');
        if (savedState) {
          const state = JSON.parse(savedState);
          this.isOpen = state.isOpen || false;
          if (this.config.persistConversation) {
            this.sendMessage('load-conversation', state.conversation);
          }
        }
      }
  
      saveState() {
        const state = {
          isOpen: this.isOpen,
          timestamp: Date.now()
        };
        localStorage.setItem('ai-chatbot-state', JSON.stringify(state));
      }
  
      sendMessage(type, data) {
        if (this.iframe && this.iframe.contentWindow) {
          this.iframe.contentWindow.postMessage({ type, data }, window.location.origin);
        }
      }
  
      open() {
        this.isOpen = true;
        this.iframe.style.display = 'block';
        if (this.toggleButton) {
          this.toggleButton.style.display = 'none';
        }
        this.saveState();
        this.sendMessage('widget-opened', {});
      }
  
      close() {
        this.isOpen = false;
        this.iframe.style.display = 'none';
        if (this.toggleButton) {
          this.toggleButton.style.display = 'flex';
        }
        this.saveState();
        this.sendMessage('widget-closed', {});
      }
  
      toggle() {
        if (this.isOpen) {
          this.close();
        } else {
          this.open();
        }
      }
  
      resize(dimensions) {
        if (this.config.mode === 'popup') {
          this.iframe.style.width = `${dimensions.width}px`;
          this.iframe.style.height = `${dimensions.height}px`;
        }
      }
  
      updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.sendMessage('update-config', this.config);
        this.iframe.src = this.getIframeSrc();
      }
  
      on(event, handler) {
        if (!this.messageHandlers.has(event)) {
          this.messageHandlers.set(event, []);
        }
        this.messageHandlers.get(event).push(handler);
      }
  
      off(event, handler) {
        if (this.messageHandlers.has(event)) {
          const handlers = this.messageHandlers.get(event);
          const index = handlers.indexOf(handler);
          if (index > -1) {
            handlers.splice(index, 1);
          }
        }
      }
  
      onReady() {
        const handlers = this.messageHandlers.get('ready') || [];
        handlers.forEach(handler => handler());
      }
  
      onMessage(data) {
        const handlers = this.messageHandlers.get('message') || [];
        handlers.forEach(handler => handler(data));
      }
  
      onError(error) {
        const handlers = this.messageHandlers.get('error') || [];
        handlers.forEach(handler => handler(error));
        console.error('AI Chatbot Widget Error:', error);
      }
  
      destroy() {
        if (this.container) {
          this.container.remove();
        }
        this.messageHandlers.clear();
      }
    }
  
    // Auto-initialize if config is provided
    window.addEventListener('DOMContentLoaded', () => {
      const script = document.currentScript || document.querySelector('script[src*="widget.js"]');
      if (script) {
        const configId = script.getAttribute('data-config-id');
        const configStr = script.getAttribute('data-config');
        
        let config = {};
        
        if (configId) {
          // Load config from server (in production)
          fetch(`/api/widget-config/${configId}`)
            .then(res => res.json())
            .then(data => {
              config = data;
              window.AIChat = new AIChatWidget(config);
            })
            .catch(err => {
              console.error('Failed to load widget config:', err);
              window.AIChat = new AIChatWidget({});
            });
        } else if (configStr) {
          try {
            config = JSON.parse(configStr);
          } catch (e) {
            console.error('Invalid widget config:', e);
          }
          window.AIChat = new AIChatWidget(config);
        } else {
          window.AIChat = new AIChatWidget({});
        }
      }
    });
  
    // Export for manual initialization
    window.AIChatWidget = AIChatWidget;
  })();
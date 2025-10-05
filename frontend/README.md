# AI Chatbot Widget

An embeddable, customizable AI chatbot widget with voice and text capabilities, multi-language support, and RAG (Retrieval-Augmented Generation) integration.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Platform Integration Guides](#platform-integration-guides)
  - [Next.js / React](#nextjs--react)
  - [WordPress](#wordpress)
  - [Django](#django)
  - [HTML / Static Sites](#html--static-sites)
  - [Vue.js](#vuejs)
  - [Angular](#angular)
  - [PHP](#php)
- [Configuration](#configuration)
- [Customization](#customization)
- [Development](#development)
- [API Integration](#api-integration)

## Overview

This is a Next.js-based AI chatbot widget application that can be embedded into any website or web application. It provides a complete solution for interactive conversational AI with support for multiple LLM providers, voice input/output, and knowledge base integration through RAG.

**Tech Stack:**
- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, Framer Motion, Custom CSS
- **UI Components:** Radix UI, Lucide Icons
- **Voice:** OpenAI Whisper/TTS, Eleven Labs
- **LLM Support:** GPT, Gemini, Claude, Grok, DeepSeek
- **Embedding:** Vanilla JavaScript (works everywhere)

## Features

### 🎙️ Voice Capabilities
- Real-time voice input using speech-to-text
- Text-to-speech responses with natural voices
- Multiple voice engines: OpenAI and Eleven Labs
- Configurable voice speed and style
- Auto-play responses option

### 💬 Text Chat
- Multi-model support (GPT, Gemini, Claude, Grok, DeepSeek)
- Streaming responses
- Typing indicators
- Message history
- Customizable temperature and token limits

### 🌍 Multi-Language Support
- Support for multiple languages (English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, Portuguese, Russian)
- Language selector UI
- Localized interface and messages
- Language-aware responses

### 📚 RAG Integration
- Retrieval-Augmented Generation for accurate responses
- Source citations with relevance scores
- Configurable similarity thresholds
- Knowledge base integration

### 🎨 Customization
- Fully customizable themes and colors (including Outfit font support)
- Multiple display modes: popup, inline, fullscreen
- Configurable positioning (bottom-right, bottom-left, top-right, top-left)
- Custom welcome messages and bot names
- Responsive design for all devices (70vh adaptive height)
- Custom CSS and JavaScript injection

### 🔧 Widget Display
- **Popup Mode:** Floating chat button that expands on click
- **Inline Mode:** Embedded directly in page content
- **Fullscreen Mode:** Full-page chat experience
- **Smart Positioning:** Chat window positioned above button to avoid overlap

## Quick Start

### Step 1: Start the Widget Server

```bash
cd frontend
npm install
npm run dev
# Server starts on http://localhost:3001
```

### Step 2: Add to Your Website

Add this code before the closing `</body>` tag of your website:

```html
<!-- AI Chatbot Widget -->
<script>
  (function() {
    // Widget Configuration
    const widgetConfig = {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Outfit, system-ui, sans-serif'
      },
      welcomeMessage: 'Hi! How can I help you today?',
      botName: 'AI Assistant',
      displayMode: 'popup',
      position: 'bottom-right',
      voiceEnabled: true,
      ragEnabled: true
    };

    // Load Widget Script
    const script = document.createElement('script');
    script.src = 'http://localhost:3001/widget/chatbot.js';
    script.async = true;
    script.onload = function() {
      if (window.initChatWidget) {
        window.initChatWidget(widgetConfig);
      }
    };
    document.head.appendChild(script);

    // Load Widget Styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'http://localhost:3001/widget/chatbot.css';
    document.head.appendChild(link);
  })();
</script>
```

### Step 3: See It in Action

Refresh your website and you'll see a floating chat button in the bottom-right corner! 🎉

---

## Platform Integration Guides

### Next.js / React

#### Method 1: Using Script Injection (Recommended)

**Step 1:** Create a client component wrapper

Create `app/components/ChatWidgetWrapper.tsx`:

```tsx
'use client'

import { useEffect } from 'react'

export default function ChatWidgetWrapper() {
  useEffect(() => {
    // Widget configuration
    const widgetConfig = {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Outfit, system-ui, sans-serif'
      },
      welcomeMessage: 'Hi! How can I help you?',
      botName: 'AI Assistant',
      displayMode: 'popup',
      position: 'bottom-right',
      voiceEnabled: true,
      ragEnabled: true,
      allowedDomains: ['localhost:3000', 'yourdomain.com']
    }

    // Load widget script
    const script = document.createElement('script')
    script.src = 'http://localhost:3001/widget/chatbot.js'
    script.async = true
    script.onload = () => {
      if ((window as any).initChatWidget) {
        (window as any).initChatWidget(widgetConfig)
      }
    }
    document.head.appendChild(script)

    // Load widget styles
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'http://localhost:3001/widget/chatbot.css'
    document.head.appendChild(link)

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
      const widgetRoot = document.getElementById('ai-chatbot-widget-root')
      if (widgetRoot) widgetRoot.remove()
      ;(window as any).ChatWidgetInitialized = false
    }
  }, [])

  return null
}
```

**Step 2:** Add to your layout

Update `app/layout.tsx`:

```tsx
import ChatWidgetWrapper from './components/ChatWidgetWrapper'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* AI Chatbot Widget */}
        <ChatWidgetWrapper />
      </body>
    </html>
  )
}
```

#### Method 2: NPM Package (Future)

```bash
npm install @your-org/ai-chatbot-widget
```

```tsx
import { ChatWidget } from '@your-org/ai-chatbot-widget'
import '@your-org/ai-chatbot-widget/dist/styles.css'

export default function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatWidget config={widgetConfig} />
    </div>
  )
}
```

---

### WordPress

#### Method 1: Using Plugin (Custom Code)

1. **Install "Insert Headers and Footers" plugin** or similar
2. **Go to Settings → Insert Headers and Footers**
3. **Add this code to the Footer section:**

```html
<!-- AI Chatbot Widget -->
<script>
  (function() {
    const widgetConfig = {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Outfit, system-ui, sans-serif'
      },
      welcomeMessage: 'Hi! How can I help you with <?php bloginfo('name'); ?>?',
      botName: '<?php bloginfo('name'); ?> Assistant',
      displayMode: 'popup',
      position: 'bottom-right',
      voiceEnabled: true,
      ragEnabled: true
    };

    const script = document.createElement('script');
    script.src = 'https://your-widget-server.com/widget/chatbot.js';
    script.async = true;
    script.onload = function() {
      if (window.initChatWidget) {
        window.initChatWidget(widgetConfig);
      }
    };
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://your-widget-server.com/widget/chatbot.css';
    document.head.appendChild(link);
  })();
</script>
```

#### Method 2: Using functions.php

Add to your theme's `functions.php`:

```php
function add_chatbot_widget() {
    ?>
    <script>
      (function() {
        const widgetConfig = {
          theme: {
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            fontFamily: 'Outfit, system-ui, sans-serif'
          },
          welcomeMessage: 'Hi! How can I help you?',
          botName: '<?php echo get_bloginfo('name'); ?> Assistant',
          displayMode: 'popup',
          position: 'bottom-right',
          voiceEnabled: true,
          ragEnabled: true
        };

        const script = document.createElement('script');
        script.src = 'https://your-widget-server.com/widget/chatbot.js';
        script.async = true;
        script.onload = function() {
          if (window.initChatWidget) {
            window.initChatWidget(widgetConfig);
          }
        };
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://your-widget-server.com/widget/chatbot.css';
        document.head.appendChild(link);
      })();
    </script>
    <?php
}
add_action('wp_footer', 'add_chatbot_widget');
```

---

### Django

#### Method 1: Base Template

Add to your base template (e.g., `templates/base.html`):

```html
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}My Django App{% endblock %}</title>
    {% block extra_head %}{% endblock %}
</head>
<body>
    {% block content %}{% endblock %}

    <!-- AI Chatbot Widget -->
    <script>
      (function() {
        const widgetConfig = {
          theme: {
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            fontFamily: 'Outfit, system-ui, sans-serif'
          },
          welcomeMessage: 'Hi! How can I help you?',
          botName: 'Django Assistant',
          displayMode: 'popup',
          position: 'bottom-right',
          voiceEnabled: true,
          ragEnabled: true,
          allowedDomains: ['{{ request.get_host }}']
        };

        const script = document.createElement('script');
        script.src = '{% if DEBUG %}http://localhost:3001{% else %}https://your-widget-server.com{% endif %}/widget/chatbot.js';
        script.async = true;
        script.onload = function() {
          if (window.initChatWidget) {
            window.initChatWidget(widgetConfig);
          }
        };
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '{% if DEBUG %}http://localhost:3001{% else %}https://your-widget-server.com{% endif %}/widget/chatbot.css';
        document.head.appendChild(link);
      })();
    </script>
</body>
</html>
```

#### Method 2: Context Processor + Template Tag

**Create context processor** (`myapp/context_processors.py`):

```python
def chatbot_config(request):
    return {
        'chatbot_config': {
            'welcome_message': 'Hi! How can I help you?',
            'bot_name': 'Django Assistant',
            'widget_server_url': 'http://localhost:3001' if settings.DEBUG else 'https://your-widget-server.com',
        }
    }
```

**Add to settings.py:**

```python
TEMPLATES = [
    {
        'OPTIONS': {
            'context_processors': [
                # ... other processors
                'myapp.context_processors.chatbot_config',
            ],
        },
    },
]
```

**Create template tag** (`myapp/templatetags/chatbot_tags.py`):

```python
from django import template

register = template.Library()

@register.inclusion_tag('chatbot_widget.html')
def chatbot_widget():
    return {}
```

**Create template** (`templates/chatbot_widget.html`):

```html
<script>
  (function() {
    const widgetConfig = {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Outfit, system-ui, sans-serif'
      },
      welcomeMessage: '{{ chatbot_config.welcome_message }}',
      botName: '{{ chatbot_config.bot_name }}',
      displayMode: 'popup',
      position: 'bottom-right',
      voiceEnabled: true,
      ragEnabled: true
    };

    const script = document.createElement('script');
    script.src = '{{ chatbot_config.widget_server_url }}/widget/chatbot.js';
    script.async = true;
    script.onload = function() {
      if (window.initChatWidget) {
        window.initChatWidget(widgetConfig);
      }
    };
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '{{ chatbot_config.widget_server_url }}/widget/chatbot.css';
    document.head.appendChild(link);
  })();
</script>
```

**Use in templates:**

```html
{% load chatbot_tags %}

<!DOCTYPE html>
<html>
<body>
    {% block content %}{% endblock %}
    {% chatbot_widget %}
</body>
</html>
```

---

### HTML / Static Sites

Simply add this code before the closing `</body>` tag:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>
<body>
    <!-- Your website content -->
    <h1>Welcome to My Website</h1>

    <!-- AI Chatbot Widget -->
    <script>
      (function() {
        const widgetConfig = {
          theme: {
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            fontFamily: 'Outfit, system-ui, sans-serif'
          },
          welcomeMessage: 'Hi! How can I help you today?',
          botName: 'AI Assistant',
          displayMode: 'popup',
          position: 'bottom-right',
          voiceEnabled: true,
          ragEnabled: true
        };

        const script = document.createElement('script');
        script.src = 'https://your-widget-server.com/widget/chatbot.js';
        script.async = true;
        script.onload = function() {
          if (window.initChatWidget) {
            window.initChatWidget(widgetConfig);
          }
        };
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://your-widget-server.com/widget/chatbot.css';
        document.head.appendChild(link);
      })();
    </script>
</body>
</html>
```

---

### Vue.js

#### Vue 3 Composition API

Create a composable `composables/useChatWidget.ts`:

```typescript
import { onMounted, onBeforeUnmount } from 'vue'

export function useChatWidget(config = {}) {
  const defaultConfig = {
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Outfit, system-ui, sans-serif'
    },
    welcomeMessage: 'Hi! How can I help you?',
    botName: 'AI Assistant',
    displayMode: 'popup',
    position: 'bottom-right',
    voiceEnabled: true,
    ragEnabled: true,
    ...config
  }

  let scriptElement: HTMLScriptElement | null = null
  let linkElement: HTMLLinkElement | null = null

  onMounted(() => {
    // Load script
    scriptElement = document.createElement('script')
    scriptElement.src = 'http://localhost:3001/widget/chatbot.js'
    scriptElement.async = true
    scriptElement.onload = () => {
      if ((window as any).initChatWidget) {
        (window as any).initChatWidget(defaultConfig)
      }
    }
    document.head.appendChild(scriptElement)

    // Load styles
    linkElement = document.createElement('link')
    linkElement.rel = 'stylesheet'
    linkElement.href = 'http://localhost:3001/widget/chatbot.css'
    document.head.appendChild(linkElement)
  })

  onBeforeUnmount(() => {
    // Cleanup
    if (scriptElement && document.head.contains(scriptElement)) {
      document.head.removeChild(scriptElement)
    }
    if (linkElement && document.head.contains(linkElement)) {
      document.head.removeChild(linkElement)
    }
    const widgetRoot = document.getElementById('ai-chatbot-widget-root')
    if (widgetRoot) widgetRoot.remove()
    ;(window as any).ChatWidgetInitialized = false
  })
}
```

**Use in your component:**

```vue
<script setup lang="ts">
import { useChatWidget } from '@/composables/useChatWidget'

useChatWidget({
  welcomeMessage: 'Welcome to our Vue app!',
  botName: 'Vue Assistant'
})
</script>

<template>
  <div>
    <!-- Your app content -->
  </div>
</template>
```

#### Vue 2 Options API

```vue
<template>
  <div id="app">
    <!-- Your app content -->
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.loadChatWidget()
  },
  beforeDestroy() {
    this.cleanupChatWidget()
  },
  methods: {
    loadChatWidget() {
      const widgetConfig = {
        theme: {
          primaryColor: '#3b82f6',
          secondaryColor: '#8b5cf6',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          fontFamily: 'Outfit, system-ui, sans-serif'
        },
        welcomeMessage: 'Hi! How can I help you?',
        botName: 'Vue Assistant',
        displayMode: 'popup',
        position: 'bottom-right',
        voiceEnabled: true,
        ragEnabled: true
      }

      const script = document.createElement('script')
      script.src = 'http://localhost:3001/widget/chatbot.js'
      script.async = true
      script.onload = () => {
        if (window.initChatWidget) {
          window.initChatWidget(widgetConfig)
        }
      }
      document.head.appendChild(script)
      this.chatWidgetScript = script

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'http://localhost:3001/widget/chatbot.css'
      document.head.appendChild(link)
      this.chatWidgetLink = link
    },
    cleanupChatWidget() {
      if (this.chatWidgetScript && document.head.contains(this.chatWidgetScript)) {
        document.head.removeChild(this.chatWidgetScript)
      }
      if (this.chatWidgetLink && document.head.contains(this.chatWidgetLink)) {
        document.head.removeChild(this.chatWidgetLink)
      }
      const widgetRoot = document.getElementById('ai-chatbot-widget-root')
      if (widgetRoot) widgetRoot.remove()
      window.ChatWidgetInitialized = false
    }
  }
}
</script>
```

---

### Angular

#### Create a Service

Create `services/chat-widget.service.ts`:

```typescript
import { Injectable } from '@angular/core';

interface WidgetConfig {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
  };
  welcomeMessage?: string;
  botName?: string;
  displayMode?: 'popup' | 'inline' | 'fullscreen';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  voiceEnabled?: boolean;
  ragEnabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatWidgetService {
  private scriptElement: HTMLScriptElement | null = null;
  private linkElement: HTMLLinkElement | null = null;

  constructor() { }

  loadWidget(config: WidgetConfig = {}) {
    const defaultConfig: WidgetConfig = {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Outfit, system-ui, sans-serif'
      },
      welcomeMessage: 'Hi! How can I help you?',
      botName: 'Angular Assistant',
      displayMode: 'popup',
      position: 'bottom-right',
      voiceEnabled: true,
      ragEnabled: true,
      ...config
    };

    // Load script
    this.scriptElement = document.createElement('script');
    this.scriptElement.src = 'http://localhost:3001/widget/chatbot.js';
    this.scriptElement.async = true;
    this.scriptElement.onload = () => {
      if ((window as any).initChatWidget) {
        (window as any).initChatWidget(defaultConfig);
      }
    };
    document.head.appendChild(this.scriptElement);

    // Load styles
    this.linkElement = document.createElement('link');
    this.linkElement.rel = 'stylesheet';
    this.linkElement.href = 'http://localhost:3001/widget/chatbot.css';
    document.head.appendChild(this.linkElement);
  }

  unloadWidget() {
    if (this.scriptElement && document.head.contains(this.scriptElement)) {
      document.head.removeChild(this.scriptElement);
    }
    if (this.linkElement && document.head.contains(this.linkElement)) {
      document.head.removeChild(this.linkElement);
    }
    const widgetRoot = document.getElementById('ai-chatbot-widget-root');
    if (widgetRoot) widgetRoot.remove();
    (window as any).ChatWidgetInitialized = false;
  }
}
```

#### Use in App Component

Update `app.component.ts`:

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatWidgetService } from './services/chat-widget.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'my-angular-app';

  constructor(private chatWidgetService: ChatWidgetService) {}

  ngOnInit() {
    this.chatWidgetService.loadWidget({
      welcomeMessage: 'Welcome to our Angular app!',
      botName: 'Angular Assistant'
    });
  }

  ngOnDestroy() {
    this.chatWidgetService.unloadWidget();
  }
}
```

---

### PHP

#### Standalone PHP Site

Add to your PHP template (e.g., `footer.php` or main template):

```php
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?php echo $pageTitle ?? 'My PHP Site'; ?></title>
</head>
<body>
    <?php include 'content.php'; ?>

    <!-- AI Chatbot Widget -->
    <script>
      (function() {
        const widgetConfig = {
          theme: {
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            fontFamily: 'Outfit, system-ui, sans-serif'
          },
          welcomeMessage: 'Hi! How can I help you with <?php echo $_ENV['SITE_NAME'] ?? 'our website'; ?>?',
          botName: '<?php echo $_ENV['BOT_NAME'] ?? 'AI Assistant'; ?>',
          displayMode: 'popup',
          position: 'bottom-right',
          voiceEnabled: true,
          ragEnabled: true
        };

        const baseUrl = '<?php echo $_ENV['WIDGET_SERVER_URL'] ?? 'http://localhost:3001'; ?>';

        const script = document.createElement('script');
        script.src = baseUrl + '/widget/chatbot.js';
        script.async = true;
        script.onload = function() {
          if (window.initChatWidget) {
            window.initChatWidget(widgetConfig);
          }
        };
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = baseUrl + '/widget/chatbot.css';
        document.head.appendChild(link);
      })();
    </script>
</body>
</html>
```

#### Laravel

**Method 1: Blade Component**

Create `resources/views/components/chatbot-widget.blade.php`:

```blade
<script>
  (function() {
    const widgetConfig = {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Outfit, system-ui, sans-serif'
      },
      welcomeMessage: '{{ $welcomeMessage ?? "Hi! How can I help you?" }}',
      botName: '{{ $botName ?? "Laravel Assistant" }}',
      displayMode: '{{ $displayMode ?? "popup" }}',
      position: '{{ $position ?? "bottom-right" }}',
      voiceEnabled: {{ $voiceEnabled ?? 'true' }},
      ragEnabled: {{ $ragEnabled ?? 'true' }}
    };

    const baseUrl = '{{ config("chatbot.widget_server_url", "http://localhost:3001") }}';

    const script = document.createElement('script');
    script.src = baseUrl + '/widget/chatbot.js';
    script.async = true;
    script.onload = function() {
      if (window.initChatWidget) {
        window.initChatWidget(widgetConfig);
      }
    };
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = baseUrl + '/widget/chatbot.css';
    document.head.appendChild(link);
  })();
</script>
```

**Use in layout:**

```blade
<!DOCTYPE html>
<html>
<body>
    @yield('content')

    <x-chatbot-widget
        welcome-message="Welcome to {{ config('app.name') }}!"
        bot-name="{{ config('app.name') }} Assistant"
    />
</body>
</html>
```

---

## Configuration

### Complete Configuration Options

```typescript
const widgetConfig = {
  // Appearance Theme
  theme: {
    primaryColor: '#3b82f6',          // Main brand color (buttons, accents)
    secondaryColor: '#8b5cf6',        // Secondary/gradient color
    backgroundColor: '#ffffff',       // Widget background color
    textColor: '#1f2937',            // Text color
    fontFamily: 'Outfit, system-ui, sans-serif'  // Font (Outfit loaded automatically)
  },

  // Bot Identity
  welcomeMessage: 'Hi! How can I help you today?',  // First message shown
  botName: 'AI Assistant',                          // Bot display name
  botAvatar: '/bot-avatar.png',                     // Avatar image URL

  // Display Settings
  displayMode: 'popup',              // 'popup' | 'inline' | 'fullscreen'
  position: 'bottom-right',          // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size: 'medium',                    // 'small' | 'medium' | 'large' (or use custom width/height)

  // Voice Settings
  voiceEnabled: true,                // Enable voice features
  defaultVoiceEngine: 'openai',      // 'openai' | 'elevenlabs'
  voiceSpeed: 1.0,                   // 0.5 - 2.0
  voiceStyle: 'friendly',            // Voice style/personality
  autoPlayResponses: false,          // Auto-play voice responses

  // LLM Settings
  defaultTextModel: 'gpt',           // 'gpt' | 'gemini' | 'claude' | 'grok' | 'deepseek'
  temperature: 0.7,                  // 0.0 - 1.0 (creativity level)
  maxTokens: 1024,                   // Max response length
  streamingEnabled: true,            // Stream responses in real-time

  // RAG Settings
  ragEnabled: true,                  // Enable knowledge base search
  showCitations: true,               // Show source citations
  maxRetrievedDocs: 3,              // Number of documents to retrieve
  minRelevanceScore: 0.5,           // Minimum relevance threshold (0.0 - 1.0)

  // Security
  allowedDomains: ['yourdomain.com', 'localhost:3000']  // Allowed domains
}
```

### Widget Dimensions

The widget now uses responsive sizing:
- **Height:** 70vh (70% of viewport height) - adapts to screen size
- **Width:** 384px (24rem) - fixed width for consistency
- **Position:** Chat window is positioned 5rem from bottom to avoid overlapping the floating button

---

## Customization

### Change Colors

```javascript
theme: {
  primaryColor: '#10b981',      // Green
  secondaryColor: '#3b82f6',    // Blue
  backgroundColor: '#f9fafb',   // Light gray
  textColor: '#111827'          // Dark gray
}
```

### Change Position

```javascript
position: 'bottom-left'  // Move to bottom-left corner
// Options: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
```

### Change Font

The widget now supports custom fonts. By default, it loads **Outfit** from Google Fonts:

```javascript
fontFamily: 'Outfit, system-ui, sans-serif'  // Uses Outfit font
```

To use a different font:

```javascript
fontFamily: 'Roboto, sans-serif'  // Or any web font
```

### Disable Voice

```javascript
voiceEnabled: false
```

### Disable RAG

```javascript
ragEnabled: false
```

---

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
cd frontend
npm install

# Run development server (port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Project Structure

```
frontend/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Landing page
│   ├── dashboard/               # Configuration dashboard
│   └── demo/                    # Demo page
├── components/
│   ├── ChatWidget/              # Main widget components
│   ├── dashboard/               # Dashboard components
│   └── common/                  # Reusable UI components
├── lib/
│   ├── i18n/                    # Translation system
│   ├── llm/                     # LLM integration
│   ├── rag/                     # RAG retrieval
│   └── voice/                   # Voice management
├── public/
│   └── widget/                  # Widget bundle files
│       ├── chatbot.js          # Widget JavaScript
│       └── chatbot.css         # Widget styles
├── types/                       # TypeScript definitions
└── package.json                # Changed to run on port 3001
```

### Key Files

- **Widget Bundle:** `public/widget/chatbot.js` - Standalone widget script
- **Widget Styles:** `public/widget/chatbot.css` - Standalone styles
- **Config:** `package.json` - Server runs on port 3001
- **CORS:** `next.config.js` - Already configured for cross-origin

### Testing

1. **Start widget server:** `npm run dev` (port 3001)
2. **Test URLs:**
   - Widget script: http://localhost:3001/widget/chatbot.js
   - Widget styles: http://localhost:3001/widget/chatbot.css
   - Dashboard: http://localhost:3001/dashboard
   - Demo: http://localhost:3001/demo

---

## API Integration

### Expected Backend Endpoints

For production use, implement these API endpoints:

```
POST /api/chat
- Body: { message, context?, config }
- Response: { content, citations? }

POST /api/voice/transcribe
- Body: FormData with audio file
- Response: { text }

POST /api/voice/synthesize
- Body: { text, engine, voice, speed }
- Response: Audio file or URL

POST /api/rag/retrieve
- Body: { query, maxResults, minScore }
- Response: { documents: Citation[] }
```

### Demo Mode

Currently, the widget runs in demo mode with simulated responses. To connect to a real backend:

1. Update the widget configuration with your API endpoint:
   ```javascript
   apiEndpoint: 'https://your-api.com/api'
   ```

2. Implement the backend API endpoints listed above

3. Update the widget script to use the real API instead of demo responses

---

## Production Deployment

### Step 1: Deploy Widget Server

Deploy the Next.js app to Vercel, Netlify, or your hosting provider:

```bash
npm run build
npm start
```

### Step 2: Update Widget URLs

Change the widget URLs in your integration code from:
```javascript
script.src = 'http://localhost:3001/widget/chatbot.js'
```

To:
```javascript
script.src = 'https://your-widget-domain.com/widget/chatbot.js'
```

### Step 3: Configure CORS

Ensure your production domain is allowed in `next.config.js`:

```javascript
headers: [
  { key: 'Access-Control-Allow-Origin', value: '*' }, // Or specific domains
]
```

### Step 4: Environment Variables

Set up environment variables for production:
- `NEXT_PUBLIC_WIDGET_SERVER_URL`
- `API_ENDPOINT`
- API keys for LLM providers
- Voice service credentials

---

## Troubleshooting

### Widget not appearing?

1. **Check widget server is running** on port 3001
2. **Check browser console** for errors (F12)
3. **Verify URLs are accessible:**
   - http://localhost:3001/widget/chatbot.js
   - http://localhost:3001/widget/chatbot.css
4. **Check CORS** - Make sure cross-origin requests are allowed
5. **Hard refresh** the page (Ctrl+Shift+R)

### Button not hiding when chat opens?

This is now fixed - the chat window is positioned higher (bottom: 5rem) to avoid overlapping the floating button.

### Font not loading?

The Outfit font is automatically loaded from Google Fonts when the widget initializes. If it's not working:
1. Check network tab to ensure font is loading
2. Verify no ad blockers are blocking Google Fonts
3. Check browser console for font loading errors

### Widget covering other elements?

Adjust the z-index or position:
```javascript
position: 'bottom-left'  // Move to different corner
```

The widget uses `z-index: 9999` by default.

---

## Support

For issues, questions, or contributions:
- Check documentation at `/demo`
- Configure and test at `/dashboard`
- Review integration examples in this README

## License

[Add your license here]

---

## Recent Updates

### Version 1.1.0 (Latest)

✅ **New Features:**
- Outfit font support with automatic Google Fonts loading
- Responsive height (70vh) that adapts to screen size
- Improved positioning - chat window now positioned above floating button
- Enhanced visibility controls for button show/hide

✅ **Improvements:**
- Widget server now runs on port 3001 (avoiding conflicts)
- Better CSS organization with utility classes
- Improved script injection for all platforms
- Comprehensive platform integration guides

✅ **Bug Fixes:**
- Fixed floating button not hiding when chat opens
- Fixed button covering send button issue
- Fixed font loading in embedded environments
- Improved cleanup on component unmount

### Version 1.0.0

- Initial release with voice and text chat
- Multi-language support
- RAG integration
- Customizable themes
- Multiple LLM providers

# AI Integration Prompt Instructions for Chatbot Widget

## 📝 CONFIGURATION - Set Once, Use Everywhere

**IMPORTANT**: Replace these values with your actual chatbot details:

```
CHATBOT_NAME: [Enter your chatbot name here, e.g., "ShopSmart Assistant"]
CHATBOT_ID: [Enter your chatbot ID here, e.g., "ecom_bot_001"]
PRODUCTION_DOMAIN: [Enter your production domain, e.g., "https://your-chatbot-domain.com"]
```

**PRE-BUILT CHATBOTS AVAILABLE (Ready to Use):**
- **ShopSmart Assistant** (ecom_bot_001) - Red theme, e-commerce focused
- **TechCorp Support** (support_bot_002) - Blue theme, technical support  
- **EduLearn Tutor** (edu_bot_003) - Green theme, education
- **WellCare Assistant** (health_bot_004) - Purple theme, health (inactive)
- **Wanderlust Guide** (travel_bot_005) - Orange theme, travel

**For AI Assistants**: Before providing any code, automatically replace ALL instances of:
- `[CHATBOT_NAME]` → Use the CHATBOT_NAME value above
- `[CHATBOT_ID]` → Use the CHATBOT_ID value above  
- `localhost:3001` → Use `localhost:3005` for development (Updated port!)
- `localhost:3001` → Use PRODUCTION_DOMAIN for production

---

## 🤖 For AI Assistants: How to Integrate the Chatbot Widget

This file contains everything an AI assistant needs to know to properly integrate the multi-chatbot widget system into any website or application.

---

## 📋 System Overview

**Complete Dummy Data System**: 5 pre-built chatbots with unique themes, analytics, and chat examples

**Dashboard**: `http://localhost:3005/dashboard` - Manage chatbots with real data
**API Endpoints**: 
- `http://localhost:3005/api/chatbots` - List all chatbots
- `http://localhost:3005/api/embed/[chatbotId]` - Get chatbot config for embedding
- `http://localhost:3005/api/analytics/[chatbotId]` - Get chatbot-specific analytics
**Widget Files**: 
- `http://localhost:3005/widget/chatbot.js` - Enhanced widget script
- `http://localhost:3005/widget/chatbot.css` - Widget styles

---

## 🎯 Step 1: Choose Pre-built Chatbot (Recommended)

**5 chatbots are already created with full data!**

1. Go to `http://localhost:3005/dashboard`
2. **Pre-built chatbots available**:
   - **ecom_bot_001** - ShopSmart Assistant (red theme, e-commerce)
   - **support_bot_002** - TechCorp Support (blue theme, technical)
   - **edu_bot_003** - EduLearn Tutor (green theme, education)
   - **health_bot_004** - WellCare Assistant (purple theme, health)
   - **travel_bot_005** - Wanderlust Guide (orange theme, travel)

3. **Each has unique**:
   - Analytics data (different conversation counts, users)
   - Chat conversation examples 
   - Theme configurations and styling
   - AI model preferences

4. **Create new chatbot** (Optional):
   - Click "Chatbots" tab → "New Chatbot"
   - All new chatbots get default analytics automatically
   - Changes persist in dummy data system

---

## 📝 Integration Methods

### Method 1: Script Tag (Universal - Works Everywhere)

**Use this for**: Any HTML website, WordPress, Shopify, static sites, etc.

```html
<!-- [CHATBOT_NAME] - AI Chatbot Widget -->
<script>
  (function() {
    // Minimal Configuration - All settings loaded from webchat server
    window.chatWidgetConfig = {
      chatbotId: '[CHATBOT_ID]',
      apiUrl: 'http://localhost:3005/api/embed/[CHATBOT_ID]'
    };

    // Load Widget Script
    const script = document.createElement('script');
    script.src = 'http://localhost:3005/widget/chatbot.js';
    script.async = true;
    script.onload = function() {
      if (window.initChatWidget) {
        window.initChatWidget(window.chatWidgetConfig);
      }
    };
    document.head.appendChild(script);

    // Load Widget Styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'http://localhost:3005/widget/chatbot.css';
    document.head.appendChild(link);
  })();
</script>
<!-- End [CHATBOT_NAME] Widget -->
```

**Instructions for AI**:
1. Replace `[CHATBOT_ID]` with the actual chatbot ID from configuration
2. Replace `[CHATBOT_NAME]` with the chatbot name from configuration
3. **Use pre-built IDs**: ecom_bot_001, support_bot_002, edu_bot_003, travel_bot_005
4. Place before closing `</body>` tag
5. For production, replace `localhost:3005` with PRODUCTION_DOMAIN

**Key Updates**:
- **Minimal configuration** - only chatbot ID and API URL needed
- **Updated port** from 3001 → 3005
- **API endpoint** for external configuration loading
- **All settings** (theme, messages, behavior) loaded from server

---

### Method 2: NPM Package Integration

**Use this for**: Node.js applications, build systems, modern web apps

```javascript
// Install the package
npm install @your-org/ai-chatbot-widget

// Import and initialize
import { ChatWidget } from '@your-org/ai-chatbot-widget';
import '@your-org/ai-chatbot-widget/dist/styles.css';

// [CHATBOT_NAME] Configuration
const config = {
  chatbotId: '[CHATBOT_ID]',
  apiBaseUrl: 'http://localhost:3005',
  
  // Optional: Override specific settings for this instance
  position: 'bottom-right',
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
  },
  
  // Event callbacks (optional)
  onOpen: () => console.log('[CHATBOT_NAME] opened'),
  onClose: () => console.log('[CHATBOT_NAME] closed'),
  onMessage: (message) => console.log('New message:', message),
  
  // The widget will automatically fetch the full configuration from your server
  // based on the chatbotId, so you only need to override what's necessary
};

// Initialize the [CHATBOT_NAME] widget
const widget = ChatWidget.init(config);

// Widget control methods (optional)
// widget.open();     // Programmatically open the widget
// widget.close();    // Programmatically close the widget
// widget.destroy();  // Remove the widget from the page
```

---

### Method 3: React Component Integration

**Use this for**: React applications, Gatsby, Create React App

```jsx
import React, { useState, useCallback } from 'react';
import { ChatWidget } from '@your-org/ai-chatbot-widget';
import '@your-org/ai-chatbot-widget/dist/styles.css';

function App() {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  // [CHATBOT_NAME] Configuration
  const widgetConfig = {
    chatbotId: '[CHATBOT_ID]',
    apiBaseUrl: 'http://localhost:3005',
    
    // Optional: Override specific settings
    position: 'bottom-right',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
    },
    
    // Event handlers
    onOpen: useCallback(() => {
      console.log('[CHATBOT_NAME] opened');
      setIsWidgetOpen(true);
    }, []),
    
    onClose: useCallback(() => {
      console.log('[CHATBOT_NAME] closed');
      setIsWidgetOpen(false);
    }, []),
    
    onMessage: useCallback((message) => {
      console.log('New message from [CHATBOT_NAME]:', message);
      // You can integrate with analytics, state management, etc.
    }, []),
    
    // The widget will automatically fetch the full configuration from your server
    // based on the chatbotId, so you only need to override what's necessary
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your app content */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            My Website
          </h1>
          {isWidgetOpen && (
            <p className="text-sm text-green-600 mt-2">
              [CHATBOT_NAME] is active
            </p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Your page content here */}
        <div className="px-4 py-6 sm:px-0">
          <p>Your website content goes here...</p>
        </div>
      </main>
      
      {/* [CHATBOT_NAME] Widget - renders as floating widget */}
      <ChatWidget config={widgetConfig} />
    </div>
  );
}

export default App;

// Advanced usage: Inline widget component
export function InlineChatWidget() {
  const inlineConfig = {
    chatbotId: '[CHATBOT_ID]',
    apiBaseUrl: 'http://localhost:3005',
    displayMode: 'inline',
    size: 'large',
  };

  return (
    <div className="w-full h-96 border rounded-lg">
      <ChatWidget config={inlineConfig} />
    </div>
  );
}
```

---

### Method 4: Next.js Integration (Special Considerations)

**Use this for**: Next.js applications (handles SSR/hydration properly)

#### Option A: Client Component (Recommended)

```jsx
'use client'; // Important: Mark as client component

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const ChatWidget = dynamic(
  () => import('@your-org/ai-chatbot-widget').then((mod) => mod.ChatWidget),
  { 
    ssr: false,
    loading: () => <div>Loading chat...</div>
  }
);

export default function ChatbotWrapper({ chatbotId = '[CHATBOT_ID]' }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side
    setIsLoaded(true);
  }, []);

  const widgetConfig = {
    chatbotId,
    apiBaseUrl: process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:3005',
    
    // Event handlers
    onOpen: useCallback(() => {
      console.log('[CHATBOT_NAME] opened');
      setIsWidgetOpen(true);
    }, []),
    
    onClose: useCallback(() => {
      console.log('[CHATBOT_NAME] closed');
      setIsWidgetOpen(false);
    }, []),
    
    onMessage: useCallback((message) => {
      console.log('New message from [CHATBOT_NAME]:', message);
    }, []),
  };

  if (!isLoaded) {
    return null; // Don't render during SSR
  }

  return <ChatWidget config={widgetConfig} />;
}
```

#### Option B: Script Injection (Alternative)

```jsx
'use client';

import { useEffect } from 'react';

export default function ChatbotScript({ chatbotId = '[CHATBOT_ID]' }) {
  useEffect(() => {
    // Inject chatbot script
    if (typeof window !== 'undefined') {
      window.chatWidgetConfig = {
        chatbotId,
      };

      const script = document.createElement('script');
      script.src = process.env.NEXT_PUBLIC_CHATBOT_API_URL 
        ? `${process.env.NEXT_PUBLIC_CHATBOT_API_URL}/widget/chatbot.js`
        : 'http://localhost:3005/widget/chatbot.js';
      script.async = true;
      script.onload = function() {
        if (window.initChatWidget) {
          window.initChatWidget(window.chatWidgetConfig);
        }
      };
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = process.env.NEXT_PUBLIC_CHATBOT_API_URL 
        ? `${process.env.NEXT_PUBLIC_CHATBOT_API_URL}/widget/chatbot.css`
        : 'http://localhost:3005/widget/chatbot.css';
      document.head.appendChild(link);

      return () => {
        // Cleanup on unmount
        document.head.removeChild(script);
        document.head.removeChild(link);
      };
    }
  }, [chatbotId]);

  return null;
}
```

#### Usage in Next.js Layout or Page:

```jsx
// app/layout.tsx
import ChatbotWrapper from '@/components/ChatbotWrapper';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatbotWrapper chatbotId="[CHATBOT_ID]" />
      </body>
    </html>
  );
}
```

---

## 🔧 Environment Configuration

### Development URLs:
- API Base: `http://localhost:3005`
- Widget Script: `http://localhost:3005/widget/chatbot.js`
- Widget Styles: `http://localhost:3005/widget/chatbot.css`

### Production URLs (Replace in production):
- API Base: `[PRODUCTION_DOMAIN]`
- Widget Script: `[PRODUCTION_DOMAIN]/widget/chatbot.js`
- Widget Styles: `[PRODUCTION_DOMAIN]/widget/chatbot.css`

### Next.js Environment Variables:
```bash
# .env.local
NEXT_PUBLIC_CHATBOT_API_URL=http://localhost:3005
# or for production:
# NEXT_PUBLIC_CHATBOT_API_URL=[PRODUCTION_DOMAIN]
```

---

## 🎨 Customization Options

The widget automatically loads full configuration from the server based on chatbot ID. You can override specific settings:

```javascript
const customConfig = {
  chatbotId: '[CHATBOT_ID]',
  
  // Override position
  position: 'bottom-left',  // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  
  // Override theme
  theme: {
    primaryColor: '#your-brand-color',
    secondaryColor: '#your-accent-color',
  },
  
  // Override behavior
  autoOpenDelay: 5000,  // Auto-open after 5 seconds
  enableVoice: false,   // Disable voice features
  
  // Event callbacks
  onOpen: () => analytics.track('chatbot_opened'),
  onMessage: (msg) => analytics.track('chatbot_message_sent', { message: msg }),
}
```

---

## 📱 Multiple Chatbots Example

Different chatbots for different pages:

```html
<!-- Support page -->
<script>
  window.chatWidgetConfig = { chatbotId: 'support_bot_123' };
  // Load widget...
</script>

<!-- Sales page -->
<script>
  window.chatWidgetConfig = { chatbotId: 'sales_bot_456' };
  // Load widget...
</script>

<!-- FAQ page -->
<script>
  window.chatWidgetConfig = { chatbotId: 'faq_bot_789' };
  // Load widget...
</script>
```

---

## 🚨 Important Notes for AI Assistants

1. **Always Replace Placeholders**:
   - Use the CONFIGURATION section at the top of this file
   - `[CHATBOT_ID]` → Use CHATBOT_ID from configuration
   - `[CHATBOT_NAME]` → Use CHATBOT_NAME from configuration
   - `localhost:3005` → Use PRODUCTION_DOMAIN for production deployments

2. **Next.js Specific**:
   - Always use `'use client'` directive for components using the widget
   - Use `dynamic` imports with `ssr: false` to avoid hydration issues
   - Check `typeof window !== 'undefined'` before accessing window object

3. **Configuration Loading**:
   - Widget automatically fetches configuration from server using chatbot ID
   - Only override settings that need to be different for specific implementation
   - Dashboard changes automatically sync to embedded widgets

4. **Error Handling**:
   - Widget has built-in fallbacks if configuration loading fails
   - Always include error callbacks for production applications

5. **Production Deployment**:
   - Update all `localhost:3005` URLs to PRODUCTION_DOMAIN from configuration
   - Set proper CORS policies for cross-domain embedding
   - Use environment variables for API URLs

---

## ✅ Success Criteria

After integration, verify:
- [ ] Floating chat icon appears in correct position
- [ ] Chat icon has the correct theme colors from dashboard
- [ ] Clicking icon opens chat window with all features
- [ ] Voice, AI models, RAG features work as configured
- [ ] Dashboard changes reflect in embedded widget
- [ ] No console errors
- [ ] Widget works across different devices/browsers

---

## 🔗 Quick Reference

**Dashboard**: `http://localhost:3005/dashboard`
**Create Chatbot**: Dashboard → Chatbots → New Chatbot
**Get Embed Code**: Dashboard → Select Chatbot → Embed Tab
**Test Config**: `http://localhost:3005/api/embed/[ID]`
**Widget Features**: Voice, Multiple AI Models, RAG, Themes, Languages, Analytics
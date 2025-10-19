# AI Chatbot Widget Integration Instructions

## 🎯 Goal
Embed named AI chatbots with full features (voice, multiple AI models, RAG, etc.) on any website.

## ✅ What's Been Done

1. **Multi-Chatbot System**:
   - Create multiple named chatbots for different websites/purposes
   - Each chatbot has independent configuration (theme, AI models, voice, etc.)
   - Dashboard management interface for all chatbots
   - Real-time configuration sync between dashboard and embedded widgets

2. **Advanced Widget Features**:
   - Full React component with all preview features
   - Voice input/output (OpenAI, Eleven Labs)
   - Multiple AI models (GPT, Claude, Gemini, Grok, DeepSeek)
   - RAG integration with citations
   - Multi-language support
   - Advanced theming and customization

3. **API & Integration**:
   - RESTful API for chatbot configurations
   - Cross-origin embedding support
   - Dynamic configuration loading
   - Automatic fallback mechanisms

## 📋 Steps to Complete Integration

### Step 1: Create Your Chatbots

1. **Start the webchat server**:
   ```bash
   cd webchat/frontend
   npm run dev
   # Will start on http://localhost:3001
   ```

2. **Open the Dashboard**:
   - Go to `http://localhost:3001/dashboard`
   - Click on the "Chatbots" tab

3. **Create Named Chatbots**:
   - Click "New Chatbot"
   - Name your chatbot (e.g., "Customer Support Bot", "Sales Assistant")
   - Add description and target website
   - Configure themes, AI models, voice settings, etc.

### Step 2: Get Embed Code for Each Chatbot

1. **Select a chatbot** from the Chatbots tab
2. **Go to "Embed" tab** to get the specific embed code
3. **Copy the generated script** for that chatbot

### Step 3: Embed on Your Website

1. **Paste the embed code** into your website's HTML:
   ```html
   <!-- Customer Support Bot -->
   <script>
     (function() {
       window.chatWidgetConfig = {
         chatbotId: 'chatbot_1699123456_abc123',
       };

       const script = document.createElement('script');
       script.src = 'http://localhost:3001/widget/chatbot.js';
       script.async = true;
       script.onload = function() {
         if (window.initChatWidget) {
           window.initChatWidget(window.chatWidgetConfig);
         }
       };
       document.head.appendChild(script);

       const link = document.createElement('link');
       link.rel = 'stylesheet';
       link.href = 'http://localhost:3001/widget/chatbot.css';
       document.head.appendChild(link);
     })();
   </script>
   ```

2. **Test the widget** on your website:
   - Look for the floating chat icon button
   - Click to open and test all features (voice, AI models, etc.)

### Step 4: Multiple Chatbots Example

You can embed different chatbots on different pages:

```html
<!-- On support page -->
<script>
  window.chatWidgetConfig = { chatbotId: 'support_bot_id' };
  // Load widget script...
</script>

<!-- On sales page -->
<script>
  window.chatWidgetConfig = { chatbotId: 'sales_bot_id' };
  // Load widget script...
</script>
```

## 🎨 Customization

All customization is now done through the **Dashboard interface**:

1. **Go to Dashboard** → Select your chatbot
2. **Theme Tab**: Colors, fonts, spacing, shadows
3. **Configuration Tab**: Basic settings, behavior, API endpoints
4. **Voice Tab**: Voice engines, speed, auto-play settings
5. **Customize Tab**: Advanced widget behavior

### **Real-time Updates**
- Changes in dashboard **automatically update** embedded widgets
- No need to re-deploy or change embed codes
- Test changes instantly in the **Preview tab**

### **Advanced Features Available**:
- ✅ **Voice Input/Output** (OpenAI, Eleven Labs)
- ✅ **Multiple AI Models** (GPT, Claude, Gemini, Grok, DeepSeek)
- ✅ **RAG with Citations** 
- ✅ **Multi-language Support**
- ✅ **Custom Themes & Branding**
- ✅ **Analytics & Conversation Tracking**
- ✅ **File Upload Support**
- ✅ **Custom CSS/JS Injection**

## 🔧 Troubleshooting

### Widget not loading?

1. **Check webchat server is running**:
   ```bash
   cd webchat/frontend
   npm run dev
   # Should see: ✓ Ready on http://localhost:3001
   ```

2. **Check browser console** (F12):
   - Should see: "Chat widget initialized successfully"
   - Check for JavaScript errors or network failures

3. **Check network tab** (F12):
   - Verify successful loads:
     - `http://localhost:3001/widget/chatbot.js` ✅
     - `http://localhost:3001/widget/chatbot.css` ✅
     - `http://localhost:3001/api/chatbots/[id]/config` ✅

4. **Check chatbot configuration**:
   - Ensure chatbot is **Active** in dashboard
   - Verify correct `chatbotId` in embed code
   - Test configuration loading: `http://localhost:3001/api/chatbots/your-id/config`

5. **Common Issues**:
   - **CORS errors**: Check if embedding from different domain
   - **Z-index conflicts**: Widget uses z-index: 9999
   - **Ad blockers**: May block widget scripts
   - **Cached files**: Try hard refresh (Ctrl+Shift+R)

### Widget opens but no response to messages?

- Check if chatbot is **Active** in dashboard
- Verify AI model configuration in chatbot settings
- Check backend connection and API endpoints
- Look for errors in browser console during message sending

### Features not working (voice, AI models, etc.)?

- Ensure your chatbot has these features **enabled** in dashboard
- Check browser permissions for microphone (voice features)
- Verify API keys are configured properly
- Test in Preview mode first before embedding

## 📁 Project Structure

Your webchat project now includes:

```
webchat/
├── frontend/
│   ├── app/
│   │   ├── dashboard/               ← Multi-chatbot management
│   │   ├── api/chatbots/            ← Chatbot configuration API
│   │   └── ...
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ChatbotManager.tsx   ← Create/manage chatbots
│   │   │   └── ...
│   │   ├── ChatWidget/              ← Full-featured widget
│   │   └── ...
│   ├── lib/
│   │   ├── chatbot-store.ts         ← Chatbot data management
│   │   └── ...
│   ├── public/
│   │   └── widget/
│   │       ├── chatbot.js           ← Enhanced widget with API integration
│   │       └── chatbot.css          ← Widget styles
│   └── types/
│       └── widget.ts                ← Updated types for multi-chatbot
```

## 🚀 Production Deployment

### 1. Update URLs for Production

Replace localhost URLs in your embed codes:

```javascript
// Development (localhost:3001)
script.src = 'http://localhost:3001/widget/chatbot.js'

// Production 
script.src = 'https://your-webchat-domain.com/widget/chatbot.js'
```

### 2. Environment Configuration

- Set up production database for chatbot storage
- Configure production API endpoints
- Set up proper CORS policies for your domains
- Add SSL certificates for HTTPS

### 3. Deployment Checklist

- [ ] Deploy webchat application to production server
- [ ] Update all embed codes with production URLs
- [ ] Test widget loading from external domains
- [ ] Verify all features work in production environment
- [ ] Set up monitoring and analytics

## ✨ What You Can Do Now

### **For Website Owners:**
1. **Create multiple chatbots** for different purposes
2. **Customize each chatbot** independently 
3. **Embed anywhere** with simple script tags
4. **Real-time updates** without code changes

### **For Different Use Cases:**
- 🎯 **Customer Support**: RAG-enabled support bot with knowledge base
- 💰 **Sales Assistant**: Product-focused bot with different AI model
- 📚 **FAQ Bot**: Simple Q&A bot for common questions  
- 🌍 **Multi-language Support**: Different language bots for global sites

### **Advanced Features:**
- **Voice Conversations** with multiple engines
- **AI Model Selection** per chatbot
- **Custom Themes** and branding
- **Citation-enabled RAG** for accurate responses
- **Analytics** and conversation tracking

## 🆘 Need Help?

### **Quick Diagnostic Steps:**
1. Visit `http://localhost:3001/dashboard` to manage chatbots
2. Check `http://localhost:3001/api/chatbots` to see active chatbots
3. Test config loading: `http://localhost:3001/api/chatbots/[your-id]/config`
4. Use browser devtools to inspect network requests
5. Check console for detailed error messages

---

## **Success Criteria:**
- ✅ **Multiple named chatbots** created and managed via dashboard
- ✅ **Full feature parity** between preview and embedded widgets
- ✅ **Real-time configuration sync** from dashboard to websites
- ✅ **Advanced features working**: voice, AI models, RAG, themes
- ✅ **Cross-domain embedding** with proper CORS support
- ✅ **API endpoints** serving chatbot configurations
- ✅ **Production-ready** embed codes with fallback mechanisms

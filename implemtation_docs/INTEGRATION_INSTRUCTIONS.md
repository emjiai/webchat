# AI Chatbot Widget Integration Instructions

## 🎯 Goal
Embed named AI chatbots with full features (voice, multiple AI models, RAG, etc.) on any website using a **comprehensive dummy data system**.

## ✅ What's Been Done

1. **Complete Dummy Data System**:
   - **5 pre-built chatbots** with unique themes, configs, and analytics
   - **Chatbot-specific analytics** - different conversation counts, users, performance
   - **Real chat examples** - unique conversation histories per chatbot
   - **Dynamic data persistence** - changes save to JSON file
   - **No more hardcoded data** - everything is chatbot-specific

2. **Multi-Chatbot System**:
   - Create and manage multiple named chatbots for different websites/purposes
   - Each chatbot has independent configuration (theme, AI models, voice, etc.)
   - **Real-time configuration sync** between dashboard and embedded widgets
   - **Comprehensive analytics** per chatbot with time-range filtering

3. **Advanced Widget Features**:
   - Full React component with all preview features
   - Voice input/output (OpenAI, Eleven Labs)
   - Multiple AI models (GPT, Claude, Gemini, Grok, DeepSeek)
   - RAG integration with citations
   - Multi-language support
   - Advanced theming and customization

4. **Enhanced API & Integration**:
   - **RESTful API** for chatbot configurations: `/api/chatbots`, `/api/chatbots/[id]`
   - **Analytics API** for real-time stats: `/api/analytics/[chatbotId]`
   - **Embed API** for external access: `/api/embed/[chatbotId]`
   - **Cross-origin embedding** support with proper CORS
   - **Minimal embed codes** - only chatbot ID needed
   - **Automatic configuration loading** from webchat server

## 📋 Steps to Complete Integration

### Step 1: Create Your Chatbots

1. **Start the webchat server**:
   ```bash
   cd webchat/frontend
   npm run dev
   # Will start on http://localhost:3005 (Updated port!)
   ```

2. **Open the Dashboard**:
   - Go to `http://localhost:3005/dashboard`
   - **5 chatbots are already created for you!**

3. **Pre-built Chatbots Available**:
   - **ShopSmart Assistant** (ecom_bot_001) - Red theme, e-commerce focused
   - **TechCorp Support** (support_bot_002) - Blue theme, technical support  
   - **EduLearn Tutor** (edu_bot_003) - Green theme, education
   - **WellCare Assistant** (health_bot_004) - Purple theme, health (inactive)
   - **Wanderlust Guide** (travel_bot_005) - Orange theme, travel

4. **Each has unique**:
   - **Different analytics** (conversation counts, users, performance)
   - **Different themes** and styling
   - **Chat conversation examples**
   - **Specific configurations** (AI models, voice settings, etc.)

5. **Create More Chatbots** (Optional):
   - Click "New Chatbot" to create additional ones
   - All new chatbots automatically get default analytics
   - Changes persist in the dummy data system

### Step 2: Get Embed Code for Each Chatbot

1. **Select a chatbot** from the Chatbots tab
2. **Go to "Embed" tab** to get the specific embed code
3. **Copy the generated script** for that chatbot

### Step 3: Embed on Your Website

1. **Paste the embed code** into your website's HTML:
   ```html
   <!-- ShopSmart Assistant - AI Chatbot Widget -->
   <script>
     (function() {
       // Minimal Configuration - All settings loaded from webchat server
       window.chatWidgetConfig = {
         chatbotId: 'ecom_bot_001',
         apiUrl: 'http://localhost:3005/api/embed/ecom_bot_001'
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
   <!-- End ShopSmart Assistant Widget -->
   ```

   **Key Changes**:
   - **Minimal config** - only chatbot ID and API URL
   - **Updated port** from 3001 → 3005
   - **API endpoint** for external configuration loading
   - **All settings** (theme, messages, behavior) loaded from webchat server

2. **Test the widget** on your website:
   - Look for the floating chat icon button
   - Click to open and test all features (voice, AI models, etc.)

### Step 4: Multiple Chatbots Example

You can embed different chatbots on different pages:

```html
<!-- On support page -->
<script>
  window.chatWidgetConfig = { 
    chatbotId: 'support_bot_002',
    apiUrl: 'http://localhost:3005/api/embed/support_bot_002'
  };
  // Load widget script...
</script>

<!-- On sales page -->
<script>
  window.chatWidgetConfig = { 
    chatbotId: 'ecom_bot_001',
    apiUrl: 'http://localhost:3005/api/embed/ecom_bot_001'
  };
  // Load widget script...
</script>

<!-- On education page -->
<script>
  window.chatWidgetConfig = { 
    chatbotId: 'edu_bot_003',
    apiUrl: 'http://localhost:3005/api/embed/edu_bot_003'
  };
  // Load widget script...
</script>
```

**Each chatbot loads completely different**:
- **Themes** (red vs blue vs green)
- **Welcome messages** and personality
- **AI model preferences** (GPT vs Claude vs Gemini)
- **Voice settings** and behavior
- **Analytics tracking** (separate stats per chatbot)

## 🎨 Customization

All customization is now done through the **Dashboard interface** at `http://localhost:3005/dashboard`:

1. **Select your chatbot** from the Chatbots tab
2. **Theme Tab**: Colors, fonts, spacing, shadows
3. **Configuration Tab**: Basic settings, behavior, messages
4. **Voice Tab**: Voice engines, speed, auto-play settings
5. **Customize Tab**: Advanced widget behavior
6. **Analytics Tab**: View real chatbot-specific data (NEW!)

### **Real-time Updates & Analytics**
- Changes in dashboard **automatically update** embedded widgets
- No need to re-deploy or change embed codes
- Test changes instantly in the **Preview tab**
- **Real analytics data** per chatbot with time-range filtering
- **Different conversation counts** and user stats per chatbot
- **Performance metrics** unique to each chatbot

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
   # Should see: ✓ Ready on http://localhost:3005
   ```

2. **Check browser console** (F12):
   - Should see: "Chat widget initialized successfully"
   - Check for JavaScript errors or network failures

3. **Check network tab** (F12):
   - Verify successful loads:
     - `http://localhost:3005/widget/chatbot.js` ✅
     - `http://localhost:3005/widget/chatbot.css` ✅
     - `http://localhost:3005/api/embed/[chatbotId]` ✅ (NEW!)
     - `http://localhost:3005/api/analytics/[chatbotId]` ✅ (NEW!)

4. **Check chatbot configuration**:
   - Ensure chatbot is **Active** in dashboard
   - Verify correct `chatbotId` in embed code (use one of the pre-built ones)
   - Test configuration loading: `http://localhost:3005/api/embed/ecom_bot_001`
   - Test analytics loading: `http://localhost:3005/api/analytics/ecom_bot_001?timeRange=7d`

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
1. Visit `http://localhost:3005/dashboard` to manage chatbots
2. Check `http://localhost:3005/api/chatbots` to see all chatbots
3. Test config loading: `http://localhost:3005/api/embed/ecom_bot_001` 
4. Test analytics: `http://localhost:3005/api/analytics/ecom_bot_001?timeRange=7d`
5. Use browser devtools to inspect network requests
6. Check console for detailed error messages

### **Available Pre-built Chatbot IDs to Test:**
- `ecom_bot_001` - ShopSmart Assistant (red theme)
- `support_bot_002` - TechCorp Support (blue theme)  
- `edu_bot_003` - EduLearn Tutor (green theme)
- `travel_bot_005` - Wanderlust Guide (orange theme)

---

## **Success Criteria:**
- ✅ **Pre-built chatbot system** with 5 ready-to-use chatbots
- ✅ **Chatbot-specific analytics** with real data and time-range filtering
- ✅ **Dynamic data persistence** - changes save to dummy data system
- ✅ **Multiple named chatbots** managed via dashboard interface
- ✅ **Full feature parity** between preview and embedded widgets
- ✅ **Real-time configuration sync** from dashboard to websites
- ✅ **Advanced features working**: voice, AI models, RAG, themes
- ✅ **Cross-domain embedding** with proper CORS support
- ✅ **Enhanced API endpoints**: `/api/chatbots`, `/api/embed/[id]`, `/api/analytics/[id]`
- ✅ **Minimal embed codes** with automatic configuration loading
- ✅ **Production-ready** system running on port 3005

# 🚀 Quick Start Guide

## Prerequisites

You now have a **complete dummy data system** with 5 pre-built chatbots ready to use!

## Start the Webchat Server

**Terminal 1:**
```bash
cd webchat/frontend
npm run dev
```
✅ Should say: `ready - started server on 0.0.0.0:3005` (Updated port!)

## Access the Dashboard

1. **Open Dashboard**: http://localhost:3005/dashboard
2. **See Pre-built Chatbots**: 5 different chatbots are already created:
   - **ShopSmart Assistant** (ecom_bot_001) - Red theme, e-commerce
   - **TechCorp Support** (support_bot_002) - Blue theme, technical support
   - **EduLearn Tutor** (edu_bot_003) - Green theme, education
   - **WellCare Assistant** (health_bot_004) - Purple theme, health (inactive)
   - **Wanderlust Guide** (travel_bot_005) - Orange theme, travel

## Test Different Chatbots

1. **Click on any chatbot** in the dashboard
2. **Go to "Preview" tab** to see it in action
3. **Go to "Analytics" tab** to see real chatbot-specific data
4. **Go to "Embed" tab** to get the embed code

## Embed in Your WorkerBull App

### Quick Integration:

**Update your layout.tsx:**
```jsx
// In your WorkerBull app's layout.tsx
import ChatWidgetWrapper from '@/components/chatwidget/ChatWidgetWrapper'

// In your return statement:
<ChatWidgetWrapper chatbotId="ecom_bot_001" />
```

**Make sure ChatWidgetWrapper.tsx is using:**
```jsx
// Minimal Configuration - All settings loaded from webchat server
window.chatWidgetConfig = {
  chatbotId,
  apiUrl: `${window.location.origin}/api/embed/${chatbotId}`,
};
```

## Test It

1. **Start WorkerBull**: http://localhost:3000  
2. **Start Webchat**: http://localhost:3005
3. **Visit WorkerBull app**: You'll see the ShopSmart Assistant (red theme)
4. **Change chatbot ID** in layout.tsx to test different bots

## That's It! ✨

You now have a **fully dynamic chatbot system** with real data!

---

## If You Don't See the Icon

### Quick Checks:

1. **Both servers running?**
   - Webchat on 3005 ✓ (Updated port!)
   - WorkerBull on 3000 ✓

2. **Chatbot exists in dashboard?**
   - Check http://localhost:3005/dashboard
   - Verify the chatbot ID exists ✓

3. **Browser console (F12) says?**
   - Should see: "Loading WorkerBull chatbot with ID: ecom_bot_001"
   - No CORS or network errors

4. **API endpoint working?**
   - Test: http://localhost:3005/api/embed/ecom_bot_001
   - Should return chatbot config JSON

---

## What You'll See Now

### **Different Chatbots = Different Themes:**

**ShopSmart (ecom_bot_001)**:
- 🔴 Red gradient button
- E-commerce focused messages
- "Hi! I'm your ShopSmart assistant..."

**TechCorp (support_bot_002)**:
- 🔵 Blue gradient button  
- Technical support theme
- "Hello! I'm TechCorp's support assistant..."

**EduLearn (edu_bot_003)**:
- 🟢 Green gradient button
- Education focused
- "Welcome to EduLearn! I'm your tutor..."

### **Real Analytics Per Chatbot:**
- Different conversation counts
- Unique user statistics  
- Chatbot-specific performance data

---

## Customization Options

**All customization now happens in the Dashboard UI!**

1. **Go to**: http://localhost:3005/dashboard
2. **Select your chatbot**
3. **Use the tabs**:
   - **Theme**: Colors, fonts, styling
   - **Configuration**: Messages, behavior
   - **Voice**: Voice settings
   - **Analytics**: View real data

**Changes apply instantly** to embedded widgets! 🎯

---

## Available Chatbot IDs

Use any of these in your ChatWidgetWrapper:

```jsx
// E-commerce theme (red)
<ChatWidgetWrapper chatbotId="ecom_bot_001" />

// Support theme (blue) 
<ChatWidgetWrapper chatbotId="support_bot_002" />

// Education theme (green)
<ChatWidgetWrapper chatbotId="edu_bot_003" />

// Travel theme (orange)
<ChatWidgetWrapper chatbotId="travel_bot_005" />
```

---

## Need Full Details?

See: `INTEGRATION_INSTRUCTIONS.md`

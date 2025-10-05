# AI Chatbot Widget Integration Instructions

## 🎯 Goal
Add the AI chatbot widget icon button to your WorkerBull app (running on localhost:3000).

## ✅ What's Been Done

1. **Webchat project updated**:
   - Changed to run on port 3001 (package.json updated)
   - Created widget bundle files in `frontend/public/widget/`:
     - `chatbot.js` - Widget JavaScript code
     - `chatbot.css` - Widget styles

2. **Files created for your WorkerBull app**:
   - `ChatWidgetWrapper.tsx` - Component to load the widget
   - `layout-fixed.tsx` - Example of fixed layout.tsx

## 📋 Steps to Complete Integration

### Step 1: Copy Files to WorkerBull App

1. **Copy `ChatWidgetWrapper.tsx`**:
   ```bash
   # Copy to your WorkerBull app's components directory
   # From: webchat/ChatWidgetWrapper.tsx
   # To: your-workerbull-app/app/components/ChatWidgetWrapper.tsx
   ```

### Step 2: Update Your WorkerBull App Layout

Replace your current `app/layout.tsx` with the content from `layout-fixed.tsx`:

**Key changes:**
- ✅ Removed duplicate `RootLayout` function
- ✅ Removed invalid `widgetConfig` object definition
- ✅ Kept metadata export (server component)
- ✅ Added `ChatWidgetWrapper` import
- ✅ Added `<ChatWidgetWrapper />` at the end of body

### Step 3: Start Both Servers

**Terminal 1 - Webchat Server (Widget Host):**
```bash
cd webchat/frontend
npm run dev
# Will start on http://localhost:3001
```

**Terminal 2 - WorkerBull App:**
```bash
cd your-workerbull-app
npm run dev
# Should start on http://localhost:3000
```

### Step 4: Test the Widget

1. Open your WorkerBull app: `http://localhost:3000`
2. Look for the **floating chat icon button** in the bottom-right corner
3. Click it to open the chat widget
4. Try sending a message

## 🎨 Customization

Edit the `widgetConfig` object in `ChatWidgetWrapper.tsx` to customize:

```typescript
const widgetConfig = {
  theme: {
    primaryColor: '#3b82f6',      // Change brand color
    secondaryColor: '#8b5cf6',    // Change accent color
  },
  welcomeMessage: 'Hi! How can I help you?',
  botName: 'WorkerBull Assistant',
  position: 'bottom-right',        // or 'bottom-left', 'top-right', 'top-left'
  voiceEnabled: true,              // Enable/disable voice
  ragEnabled: true,                // Enable/disable RAG
}
```

## 🔧 Troubleshooting

### Widget icon not showing?

1. **Check webchat server is running**:
   ```bash
   # Should see: ready - started server on 0.0.0.0:3001
   ```

2. **Check browser console** (F12):
   - Should see: "Chat widget initialized successfully"
   - If errors about loading files, webchat server might not be running

3. **Check network tab** (F12):
   - Should see successful loads of:
     - `http://localhost:3001/widget/chatbot.js`
     - `http://localhost:3001/widget/chatbot.css`

4. **Check z-index conflicts**:
   - Widget has z-index: 9999
   - Make sure no other elements have higher z-index

5. **Check for toast overlap**:
   - Toast notifications are in bottom-right
   - Widget is also in bottom-right
   - They should stack properly (widget on top)

### Widget button appears but doesn't open?

- Check browser console for JavaScript errors
- Make sure both servers are running
- Try hard refresh (Ctrl+Shift+R)

### TypeScript errors in WorkerBull app?

Make sure you:
- Copied `ChatWidgetWrapper.tsx` to `app/components/` directory
- Updated the import in `layout.tsx`
- The file has `'use client'` directive at the top

## 📁 File Structure

After integration, your WorkerBull app should have:

```
your-workerbull-app/
├── app/
│   ├── components/
│   │   └── ChatWidgetWrapper.tsx    ← NEW
│   ├── layout.tsx                    ← UPDATED
│   └── ...
└── ...
```

And your webchat project now has:

```
webchat/
├── frontend/
│   ├── public/
│   │   └── widget/
│   │       ├── chatbot.js           ← NEW
│   │       └── chatbot.css          ← NEW
│   ├── package.json                  ← UPDATED (port 3001)
│   └── ...
└── ...
```

## 🚀 Production Deployment

For production, update the URLs in `ChatWidgetWrapper.tsx`:

```typescript
// Change from:
script.src = 'http://localhost:3001/widget/chatbot.js'

// To:
script.src = 'https://your-webchat-domain.com/widget/chatbot.js'
```

## ✨ Next Steps

1. Copy the files to your WorkerBull app
2. Start both servers
3. Test the widget
4. Customize the configuration
5. Add to production when ready

## 🆘 Need Help?

If the widget still doesn't appear:
1. Check all files are in correct locations
2. Verify both servers are running
3. Clear browser cache
4. Check browser console for errors
5. Verify no ad blockers are interfering

---

**Success Criteria:**
- ✅ Floating chat icon button visible in bottom-right corner
- ✅ Icon has gradient blue/purple background
- ✅ Clicking icon opens chat window
- ✅ Can send and receive messages (demo responses)
- ✅ No TypeScript errors
- ✅ No console errors

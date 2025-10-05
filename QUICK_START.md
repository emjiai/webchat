# 🚀 Quick Start Guide

## Copy These 2 Files to Your WorkerBull App

### File 1: ChatWidgetWrapper.tsx
**Location:** Copy to `your-workerbull-app/app/components/ChatWidgetWrapper.tsx`

The file is ready at: `webchat/ChatWidgetWrapper.tsx`

### File 2: Update layout.tsx
**Location:** Replace `your-workerbull-app/app/layout.tsx`

Use the content from: `webchat/layout-fixed.tsx`

## Start Servers

**Terminal 1:**
```bash
cd webchat/frontend
npm run dev
```
✅ Should say: `ready - started server on 0.0.0.0:3001`

**Terminal 2:**
```bash
cd your-workerbull-app
npm run dev
```
✅ Should say: `ready - started server on 0.0.0.0:3000`

## Test It

1. Open: http://localhost:3000
2. Look bottom-right corner
3. You should see: 🔵 Blue/purple gradient circular button with chat icon
4. Click it to open chat

## That's It! ✨

The floating chat icon button should now be visible in your WorkerBull app.

---

## If You Don't See the Icon

### Quick Checks:

1. **Both servers running?**
   - Webchat on 3001 ✓
   - WorkerBull on 3000 ✓

2. **Files copied correctly?**
   - ChatWidgetWrapper.tsx in app/components/ ✓
   - layout.tsx updated ✓

3. **Browser console (F12) says?**
   - Should see: "Chat widget initialized successfully"
   - No errors

4. **Hard refresh**
   - Press: Ctrl + Shift + R (Windows)
   - Or: Cmd + Shift + R (Mac)

---

## What You'll See

### Before Clicking (Closed State):
```
┌────────────────────────┐
│                        │
│   Your WorkerBull      │
│   App Content          │
│                        │
│                        │
│                   🟣  │ ← Floating icon button
└────────────────────────┘
```

### After Clicking (Open State):
```
┌────────────────────────┐
│                        │
│   Your WorkerBull      │
│   App Content    ┌─────┤
│                  │Chat │
│                  │     │
│                  │     │
│                  └─────┤
└────────────────────────┘
```

---

## Customization Options

Edit `ChatWidgetWrapper.tsx` to change:

- **Colors**: `theme.primaryColor`, `theme.secondaryColor`
- **Position**: `position: 'bottom-right'` → try 'bottom-left', 'top-right', etc.
- **Welcome message**: `welcomeMessage: 'Your text here'`
- **Bot name**: `botName: 'Your Bot Name'`

Changes take effect after refreshing your browser.

---

## Need Full Details?

See: `INTEGRATION_INSTRUCTIONS.md`

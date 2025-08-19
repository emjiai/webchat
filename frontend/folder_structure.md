├── app/                                # Next.js 13+ App Directory
│   ├── layout.tsx                     # Root layout with Outfit font
│   ├── page.tsx                       # Home/Landing page
│   ├── globals.css                    # Global styles and Tailwind CSS
│   │
│   ├── dashboard/                     # Dashboard route
│   │   └── page.tsx                   # Dashboard page with config, preview, embed
│   │
│   └── demo/                          # Demo route
│       └── page.tsx                   # Live demo page with embedded widget
│
├── components/                         # React Components
│   ├── dashboard/                     # Dashboard-specific components
│   │   ├── ConfigurationPanel.tsx    # Widget configuration settings
│   │   ├── PreviewPanel.tsx          # Live preview with device views
│   │   └── EmbedCodeGenerator.tsx    # Generate embed codes
│   │
│   ├── widget/                        # Chat widget components
│   │   ├── ChatWidget.tsx            # Main widget component
│   │   ├── MessageList.tsx           # Message display with citations
│   │   ├── MessageInput.tsx          # Text/voice input interface
│   │   ├── VoiceControls.tsx         # Voice control panel
│   │   └── SettingsPanel.tsx         # Quick settings dropdown
│   │
│   └── ui/                            # Reusable UI components
│       ├── index.ts                   # UI components barrel export
│       ├── label.tsx                  # Label component
│       ├── input.tsx                  # Input component
│       ├── select.tsx                 # Select dropdown component
│       ├── switch.tsx                 # Toggle switch component
│       ├── slider.tsx                 # Slider component
│       └── tabs.tsx                   # Tabs component
│
├── lib/                               # Utility functions and services
│   ├── chat-service.ts               # Chat message processing logic
│   ├── voice-service.ts              # Voice STT/TTS services
│   └── rag-service.ts                # RAG retrieval and search
│
├── data/                              # Demo data files
│   └── demo-knowledge.json           # Sample knowledge base documents
│
├── types/                             # TypeScript type definitions
│   └── widget.ts                      # Widget config and message types
│
├── public/                            # Static assets
│   ├── bot-avatar.png                # Default bot avatar (to be added)
│   └── favicon.ico                   # Site favicon
│
├── config files (root)                # Configuration files
│   ├── package.json                  # Dependencies and scripts
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── next.config.js                # Next.js configuration
│   ├── tailwind.config.ts            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   └── .eslintrc.json                # ESLint configuration (auto-generated)

├── app/                                    # Next.js 14 App Router
│   ├── layout.tsx                         # Root layout with font and metadata
│   ├── page.tsx                           # Landing page with hero section
│   ├── globals.css                        # Global styles and Tailwind imports
│   ├── favicon.ico                        # App favicon
│   ├── dashboard/                         # Dashboard route
│   │   ├── page.tsx                       # Dashboard main page
│   │   ├── layout.tsx                     # Dashboard layout (optional)
│   │   └── loading.tsx                    # Loading state (optional)
│   ├── embed/                             # Embed route for iframe
│   │   ├── page.tsx                       # Embedded widget page
│   │   └── layout.tsx                     # Minimal layout for embed
│   ├── api/                               # API routes (if needed)
│   │   ├── widget-config/
│   │   │   └── [id]/
│   │   │       └── route.ts               # GET widget config by ID
│   │   ├── chat/
│   │   │   └── route.ts                   # POST chat endpoint
│   │   └── health/
│   │       └── route.ts                   # Health check endpoint
│   └── (auth)/                            # Auth group (optional)
│       ├── login/
│       └── register/
│
├── components/                             # React components
│   ├── ChatWidget/                        # Main chat widget components
│   │   ├── ChatWidget.tsx                 # Main widget component
│   │   ├── ChatMessage.tsx                # Individual message component
│   │   ├── VoiceControls.tsx              # Voice control panel
│   │   ├── TextInput.tsx                  # Text input with voice button
│   │   ├── SourceCitation.tsx             # RAG citation display
│   │   ├── LanguageSelector.tsx           # Language picker component
│   │   ├── TypingIndicator.tsx            # Typing animation
│   │   ├── MessageList.tsx                # Message container
│   │   ├── ChatHeader.tsx                 # Widget header
│   │   └── ChatWidget.module.css          # Widget-specific styles
│   │
│   ├── Dashboard/                         # Dashboard components
│   │   ├── WidgetCustomizer.tsx           # Configuration panel
│   │   ├── EmbedCodeGenerator.tsx         # Generate embed codes
│   │   ├── PreviewPane.tsx                # Live preview
│   │   ├── StatsPanel.tsx                 # Usage statistics
│   │   ├── ConfigurationTabs.tsx          # Tab navigation
│   │   ├── ThemeEditor.tsx                # Theme customization
│   │   ├── VoiceSettings.tsx              # Voice configuration
│   │   └── Dashboard.module.css           # Dashboard styles
│   │
│   ├── common/                            # Shared components
│   │   ├── Button.tsx                     # Reusable button
│   │   ├── Input.tsx                      # Form input
│   │   ├── Select.tsx                     # Dropdown select
│   │   ├── Switch.tsx                     # Toggle switch
│   │   ├── Slider.tsx                     # Range slider
│   │   ├── ColorPicker.tsx                # Color selection
│   │   ├── Modal.tsx                      # Modal dialog
│   │   ├── Tooltip.tsx                    # Tooltip component
│   │   ├── Card.tsx                       # Card container
│   │   ├── Badge.tsx                      # Status badge
│   │   ├── Spinner.tsx                    # Loading spinner
│   │   └── Toast.tsx                      # Toast notifications
│   │
│   └── layout/                            # Layout components
│       ├── Header.tsx                     # App header
│       ├── Footer.tsx                     # App footer
│       ├── Sidebar.tsx                    # Navigation sidebar
│       └── Container.tsx                  # Content container
│
├── lib/                                    # Core libraries and utilities
│   ├── i18n/                              # Internationalization
│   │   ├── translations.ts                # All translations
│   │   ├── language-utils.ts              # Language helpers
│   │   ├── locales/                       # Individual locale files
│   │   │   ├── en.json                    # English
│   │   │   ├── fr.json                    # French
│   │   │   ├── ig.json                    # Igbo
│   │   │   ├── de.json                    # German
│   │   │   ├── yo.json                    # Yoruba
│   │   │   └── ha.json                    # Hausa
│   │   └── index.ts                       # i18n exports
│   │
│   ├── voice/                             # Voice processing
│   │   ├── voice-manager.ts               # Main voice controller
│   │   ├── openai-voice.ts                # OpenAI Whisper integration
│   │   ├── elevenlabs-voice.ts            # Eleven Labs integration
│   │   ├── speech-recognition.ts          # STT utilities
│   │   ├── speech-synthesis.ts            # TTS utilities
│   │   ├── audio-processor.ts             # Audio processing
│   │   └── voice-utils.ts                 # Voice helpers
│   │
│   ├── llm/                               # LLM integrations
│   │   ├── llm-manager.ts                 # LLM orchestrator
│   │   ├── providers/
│   │   │   ├── openai.ts                  # OpenAI GPT
│   │   │   ├── anthropic.ts               # Claude
│   │   │   ├── google.ts                  # Gemini
│   │   │   ├── xai.ts                     # Grok
│   │   │   └── deepseek.ts                # DeepSeek
│   │   ├── prompt-templates.ts            # System prompts
│   │   ├── response-parser.ts             # Parse LLM responses
│   │   └── stream-handler.ts              # Handle streaming
│   │
│   ├── rag/                               # RAG implementation
│   │   ├── retrieval.ts                   # Document retrieval
│   │   ├── vector-search.ts               # Vector similarity
│   │   ├── document-processor.ts          # Process documents
│   │   ├── embedding-generator.ts         # Generate embeddings
│   │   ├── knowledge-base.ts              # KB management
│   │   └── citation-manager.ts            # Handle citations
│   │
│   ├── api/                               # API client utilities
│   │   ├── client.ts                      # API client setup
│   │   ├── endpoints.ts                   # API endpoints
│   │   ├── auth.ts                        # Authentication
│   │   └── error-handler.ts               # Error handling
│   │
│   ├── embed/                             # Widget embedding
│   │   ├── widget-loader.ts               # Load widget script
│   │   ├── iframe-manager.ts              # Iframe handling
│   │   ├── message-bridge.ts              # Cross-origin messaging
│   │   └── config-validator.ts            # Validate configs
│   │
│   └── utils/                             # General utilities
│       ├── config.ts                      # Configuration helpers
│       ├── storage.ts                     # Local storage utils
│       ├── validators.ts                  # Input validation
│       ├── formatters.ts                  # Data formatting
│       ├── constants.ts                   # App constants
│       ├── helpers.ts                     # Helper functions
│       ├── cn.ts                          # Class name utils
│       └── date.ts                        # Date utilities
│
├── hooks/                                  # Custom React hooks
│   ├── useTranslation.ts                  # Translation hook
│   ├── useLanguage.ts                     # Language state
│   ├── useVoice.ts                        # Voice controls
│   ├── useChat.ts                         # Chat state management
│   ├── useWebSocket.ts                    # WebSocket connection
│   ├── useLocalStorage.ts                 # Local storage hook
│   ├── useDebounce.ts                     # Debounce hook
│   ├── useThrottle.ts                     # Throttle hook
│   ├── useMediaQuery.ts                   # Responsive hook
│   └── useClickOutside.ts                 # Click outside detection
│
├── types/                                  # TypeScript definitions
│   ├── index.ts                           # Main type exports
│   ├── chat.types.ts                      # Chat-related types
│   ├── voice.types.ts                     # Voice-related types
│   ├── llm.types.ts                       # LLM-related types
│   ├── rag.types.ts                       # RAG-related types
│   ├── api.types.ts                       # API types
│   └── global.d.ts                        # Global type declarations
│
├── public/                                 # Static assets
│   ├── data/                              # Knowledge base data
│   │   ├── knowledge-base.json            # Main KB
│   │   ├── knowledge-base-fr.json         # French KB
│   │   ├── knowledge-base-ig.json         # Igbo KB
│   │   ├── knowledge-base-de.json         # German KB
│   │   ├── knowledge-base-yo.json         # Yoruba KB
│   │   ├── knowledge-base-ha.json         # Hausa KB
│   │   ├── faqs.json                      # FAQs
│   │   └── products.json                  # Product info
│   │
│   ├── embed/                             # Embed files
│   │   ├── widget.js                      # Widget loader script
│   │   ├── widget.min.js                  # Minified version
│   │   └── widget.css                     # Widget styles
│   │
│   ├── assets/                            # Media assets
│   │   ├── avatars/                       # Bot avatars
│   │   │   ├── default-bot.png
│   │   │   ├── assistant-1.png
│   │   │   └── assistant-2.png
│   │   ├── flags/                         # Language flags
│   │   │   ├── en.svg
│   │   │   ├── fr.svg
│   │   │   ├── ig.svg
│   │   │   ├── de.svg
│   │   │   ├── yo.svg
│   │   │   └── ha.svg
│   │   ├── sounds/                        # Sound effects
│   │   │   ├── notification.mp3
│   │   │   ├── send.mp3
│   │   │   └── receive.mp3
│   │   └── icons/                         # Custom icons
│   │       └── logo.svg
│   │
│   ├── fonts/                             # Custom fonts (if any)
│   ├── manifest.json                      # PWA manifest
│   └── robots.txt                         # SEO robots file
│
├── styles/                                 # Global styles
│   ├── themes/                            # Theme files
│   │   ├── default.css                    # Default theme
│   │   ├── dark.css                       # Dark theme
│   │   ├── light.css                      # Light theme
│   │   └── custom.css                     # Custom themes
│   ├── animations.css                     # Custom animations
│   └── variables.css                      # CSS variables
│
├── tests/                                  # Test files
│   ├── unit/                              # Unit tests
│   │   ├── components/
│   │   │   ├── ChatWidget.test.tsx
│   │   │   ├── LanguageSelector.test.tsx
│   │   │   └── VoiceControls.test.tsx
│   │   ├── lib/
│   │   │   ├── translations.test.ts
│   │   │   ├── voice-manager.test.ts
│   │   │   └── llm-manager.test.ts
│   │   └── hooks/
│   │       └── useTranslation.test.ts
│   │
│   ├── integration/                       # Integration tests
│   │   ├── chat-flow.test.ts
│   │   ├── voice-flow.test.ts
│   │   └── rag-flow.test.ts
│   │
│   ├── e2e/                               # End-to-end tests
│   │   ├── multilingual.test.ts
│   │   ├── embedding.test.ts
│   │   └── dashboard.test.ts
│
├── scripts/                                # Build and utility scripts
│   ├── generate-embeddings.js             # Generate embeddings
│   ├── translate-kb.js                    # Translate knowledge base
│   ├── build-widget.js                    # Build embed widget
│   └── seed-data.js                       # Seed demo data
├── .env.example                            # Environment variables example
├── .env.local                              # Local environment (gitignored)
├── .eslintrc.json                          # ESLint configuration
├── .gitignore                              # Git ignore file
├── next-env.d.ts                           # Next.js types
├── next.config.js                          # Next.js configuration
├── package.json                            # Dependencies and scripts
├── package-lock.json                       # Lock file (gitignored)
├── postcss.config.js                       # PostCSS configuration
├── README.md                               # Project documentation
├── LANGUAGES.md                            # Language support docs
├── tailwind.config.js                      # Tailwind configuration
└── tsconfig.json                           # TypeScript configuration
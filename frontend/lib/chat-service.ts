import { Message, Citation } from '@/types/widget'
import demoData from '@/data/demo-knowledge.json'
import { searchDocuments } from './rag-service'

interface ChatResponse {
  content: string
  citations?: Citation[]
}

// Simulate API calls to different AI models
export async function processMessage(
  message: string,
  model: string,
  ragEnabled: boolean
): Promise<ChatResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

  let context = ''
  let citations: Citation[] = []

  // Perform RAG retrieval if enabled
  if (ragEnabled) {
    const searchResults = await searchDocuments(message)
    if (searchResults.length > 0) {
      context = searchResults.map(doc => doc.snippet).join('\n\n')
      citations = searchResults
    }
  }

  // Generate response based on model
  const response = await generateModelResponse(message, model, context)

  return {
    content: response,
    citations: ragEnabled ? citations : undefined
  }
}

async function generateModelResponse(
  message: string,
  model: string,
  context: string
): Promise<string> {
  // In production, this would call the actual API
  // For demo, we'll return contextual responses based on keywords

  const lowerMessage = message.toLowerCase()
  
  // Check for specific queries that match our demo data
  if (lowerMessage.includes('product') || lowerMessage.includes('offer')) {
    return `Based on our offerings, we provide three main product tiers:

1. **Starter Plan** - Perfect for small businesses and individuals
   - Basic chatbot functionality
   - Up to 1,000 messages/month
   - Email support

2. **Professional Plan** - Ideal for growing companies
   - Advanced AI models including GPT-4 and Claude
   - Voice capabilities with multiple engines
   - Up to 10,000 messages/month
   - Priority support

3. **Enterprise Plan** - Comprehensive solution for large organizations
   - Unlimited messages
   - Custom integrations
   - Dedicated support team
   - Advanced analytics

${context ? `\nAdditional information from our knowledge base:\n${context}` : ''}

Would you like more details about any specific plan?`
  }

  if (lowerMessage.includes('voice') || lowerMessage.includes('speech')) {
    return `Our voice features include:

• **Real-time voice input** - Speak naturally and have your speech converted to text
• **Multiple voice engines** - Choose between OpenAI and Eleven Labs for the best quality
• **Text-to-speech** - All responses can be played back as natural-sounding speech
• **Adjustable settings** - Control voice speed, volume, and style
• **Auto-play option** - Automatically play voice responses

The voice feature works seamlessly with all supported AI models (GPT-4, Claude, Gemini, etc.).

${context ? `\n${context}` : ''}`
  }

  if (lowerMessage.includes('pricing') || lowerMessage.includes('cost')) {
    return `Our pricing is designed to be flexible and scalable:

**Starter Plan**: $29/month
- Perfect for getting started
- Includes core features

**Professional Plan**: $99/month
- Full feature set
- Priority support

**Enterprise Plan**: Custom pricing
- Tailored to your needs
- Volume discounts available

All plans include a 14-day free trial. No credit card required to start!

${context ? `\n${context}` : ''}`
  }

  if (lowerMessage.includes('customize') || lowerMessage.includes('appearance')) {
    return `You can fully customize the widget to match your brand:

🎨 **Visual Customization:**
- Primary and secondary colors
- Background and text colors
- Widget size (small, medium, large)
- Position on page (corners)
- Display mode (popup, inline, fullscreen)

⚙️ **Behavioral Customization:**
- Welcome message
- Bot name and avatar
- Default AI model
- Voice settings
- RAG configuration

All customizations can be done through our intuitive dashboard, and changes are reflected in real-time.

${context ? `\n${context}` : ''}`
  }

  if (lowerMessage.includes('install') || lowerMessage.includes('embed') || lowerMessage.includes('integrate')) {
    return `Installing the chat widget is simple:

1. **Configure** your widget in the dashboard
2. **Copy** the generated embed code
3. **Paste** it into your website's HTML

The widget supports multiple installation methods:
- Simple script tag (easiest)
- NPM package for React/Vue/Angular apps
- WordPress plugin
- Shopify app

The widget loads asynchronously and won't affect your page load speed. It's also mobile-responsive and works on all modern browsers.

${context ? `\n${context}` : ''}`
  }

  // Default response for general queries
  const modelResponses: Record<string, string> = {
    gpt: `[GPT-4] ${context || "I understand your question. Based on my training, here's what I can tell you about that..."}`,
    gemini: `[Gemini] ${context || "Let me help you with that. From my analysis..."}`,
    claude: `[Claude] ${context || "I'd be happy to help. Here's my perspective on your question..."}`,
    grok: `[Grok] ${context || "Interesting question! Let me break this down for you..."}`,
    deepseek: `[DeepSeek] ${context || "Based on my deep learning models, here's what I found..."}`
  }

  return modelResponses[model] || "I'm here to help! Could you please provide more details about what you're looking for?"
}

// Stream response simulation (for future implementation)
export async function* streamMessage(
  message: string,
  model: string,
  ragEnabled: boolean
): AsyncGenerator<string> {
  const response = await processMessage(message, model, ragEnabled)
  const words = response.content.split(' ')
  
  for (const word of words) {
    yield word + ' '
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}
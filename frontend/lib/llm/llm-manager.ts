import { LLMProvider } from '@/types'

// Stub LLM functionality
export const simulateLLMResponse = async (
  messages: any[],
  provider: LLMProvider = 'gpt',
  options?: any
) => {
  console.log('LLM simulation stub called with:', { messages, provider, options })
  return 'This is a simulated response from the LLM.'
}
import { Language } from '@/types'

// Simple translation stub - returns keys as-is for now
export const getTranslation = (language: Language) => {
  return (key: string, fallback?: string) => {
    // For now, just return the fallback or key
    return fallback || key
  }
}
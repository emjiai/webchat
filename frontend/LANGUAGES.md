# Language Support Documentation

## Supported Languages

The AI Chatbot Widget currently supports the following languages:

| Language | Code | Native Name | Flag | Status | Voice Support |
|----------|------|-------------|------|--------|---------------|
| English | `en` | English | 🇬🇧 | ✅ Full Support | ✅ Native |
| French | `fr` | Français | 🇫🇷 | ✅ Full Support | ✅ Native |
| Igbo | `ig` | Igbo | 🇳🇬 | ✅ Full Support | ⚡ Fallback |
| German | `de` | Deutsch | 🇩🇪 | ✅ Full Support | ✅ Native |
| Yoruba | `yo` | Yorùbá | 🇳🇬 | ✅ Full Support | ⚡ Fallback |
| Hausa | `ha` | Hausa | 🇳🇬 | ✅ Full Support | ⚡ Fallback |

## Implementation Details

### 1. Translation System

All translations are centralized in `/lib/i18n/translations.ts`. Each language has a complete set of UI strings.

```typescript
// Example usage in components
import { getTranslation } from '@/lib/i18n/translations';

const t = getTranslation(language);
console.log(t.welcomeMessage); // Returns welcome message in selected language
```

### 2. Language Selection

Users can select their preferred language:
- **Initial Setup**: Language selector shown on first load
- **Quick Switch**: Compact selector in widget header
- **Persistence**: Language preference saved to localStorage

### 3. Voice Integration

#### Speech-to-Text (STT)
```typescript
// OpenAI Whisper API supports all our languages
const formData = new FormData();
formData.append('file', audioBlob);
formData.append('model', 'whisper-1');
formData.append('language', languageCode); // e.g., 'fr', 'de', 'yo'
```

#### Text-to-Speech (TTS)
```typescript
// Browser TTS with language support
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = getLanguageCode(); // e.g., 'fr-FR', 'de-DE', 'yo-NG'
```

### 4. LLM Integration

The system passes language context to LLMs:

```typescript
const response = await llmManager.generateResponse({
  query: userMessage,
  language: selectedLanguage,
  systemPrompt: `Please respond in ${languageName}.`
});
```

## Adding New Languages

To add a new language, follow these steps:

### Step 1: Update Types
```typescript
// types/index.ts
export type Language = 'en' | 'fr' | 'ig' | 'de' | 'yo' | 'ha' | 'YOUR_LANG_CODE';
```

### Step 2: Add Translations
```typescript
// lib/i18n/translations.ts
export const translations: Record<Language, TranslationStrings> = {
  // ... existing languages
  'YOUR_LANG_CODE': {
    welcomeMessage: "Your translated welcome message",
    placeholder: "Your translated placeholder",
    // ... all other strings
  }
};
```

### Step 3: Update Language Selector
```typescript
// components/ChatWidget/LanguageSelector.tsx
const languages = [
  // ... existing languages
  { 
    code: 'YOUR_LANG_CODE', 
    name: 'English Name', 
    nativeName: 'Native Name', 
    flag: '🏳️' 
  }
];
```

### Step 4: Add Voice Support
```typescript
// lib/voice/voice-manager.ts
private getLanguageCode(): string {
  const languageCodes: Record<Language, string> = {
    // ... existing mappings
    'YOUR_LANG_CODE': 'lang-COUNTRY', // e.g., 'es-ES'
  };
  return languageCodes[this.language] || 'en-US';
}
```

### Step 5: Add LLM Response Templates
```typescript
// lib/llm/llm-manager.ts
const responses: Record<Language, string> = {
  // ... existing responses
  'YOUR_LANG_CODE': `Your response template in the new language`
};
```

## Language-Specific Considerations

### Nigerian Languages (Igbo, Yoruba, Hausa)

These languages may have limited TTS voice support in browsers. The system includes fallbacks:

1. **Primary**: Native voice if available
2. **Fallback**: Nigerian-accented English (en-NG)
3. **Final Fallback**: Standard English (en-US/en-GB)

### RTL Languages (Future Support)

For Arabic, Hebrew, or other RTL languages:

```css
/* Add to globals.css */
[dir="rtl"] .widget-container {
  direction: rtl;
  text-align: right;
}
```

## API Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,fr,ig,de,yo,ha
NEXT_PUBLIC_ENABLE_AUTO_DETECT=true
```

### FastAPI Integration

When integrating with FastAPI backend:

```python
# Example FastAPI endpoint
@app.post("/api/chat")
async def chat(
    message: str,
    language: str = "en",
    voice_enabled: bool = False
):
    # Process message with language context
    response = await process_with_language(message, language)
    return response
```

## Testing Languages

### Unit Tests
```typescript
// tests/lib/translations.test.ts
describe('Translations', () => {
  it('should have all keys for each language', () => {
    const languages: Language[] = ['en', 'fr', 'ig', 'de', 'yo', 'ha'];
    languages.forEach(lang => {
      const t = getTranslation(lang);
      expect(t.welcomeMessage).toBeDefined();
      expect(t.placeholder).toBeDefined();
      // ... test all keys
    });
  });
});
```

### E2E Tests
```typescript
// tests/e2e/multilingual.test.ts
test('Language switching works correctly', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="language-selector"]');
  await page.click('[data-language="fr"]');
  
  const welcomeMessage = await page.textContent('.welcome-message');
  expect(welcomeMessage).toContain('Bonjour');
});
```

## Localization Best Practices

1. **Always use translation keys** instead of hardcoded strings
2. **Provide context** for translators in comments
3. **Test with longest translations** to ensure UI doesn't break
4. **Use proper number/date formatting** for each locale
5. **Consider cultural differences** in colors, icons, and imagery
6. **Validate translations** with native speakers
7. **Implement fallbacks** for missing translations

## Known Limitations

1. **Voice Support**: Some languages may not have native TTS voices
2. **LLM Quality**: Response quality may vary by language
3. **RAG Documents**: Knowledge base needs translation for each language
4. **Character Encoding**: Ensure proper UTF-8 support throughout

## Resources

- [OpenAI Whisper Languages](https://platform.openai.com/docs/guides/speech-to-text)
- [Web Speech API Language Support](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [Eleven Labs Language Support](https://docs.elevenlabs.io/languages)
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
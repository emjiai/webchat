import { VoiceEngine, VoiceSettings, Language } from '@/types';

export class VoiceManager {
  private engine: VoiceEngine;
  private language: Language;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private isPlaying = false;
  private currentAudio: HTMLAudioElement | null = null;
  
  constructor(engine: VoiceEngine = 'openai', language: Language = 'en') {
    this.engine = engine;
    this.language = language;
    this.initializeAudioContext();
  }
  
  private initializeAudioContext() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }
  
  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording'));
        return;
      }
      
      this.mediaRecorder.onstop = async () => {
        this.isRecording = false;
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        try {
          // Convert audio to text based on engine
          const text = await this.speechToText(audioBlob);
          resolve(text);
        } catch (error) {
          reject(error);
        }
        
        // Clean up
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        this.mediaRecorder = null;
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  private async speechToText(audioBlob: Blob): Promise<string> {
    // For demo purposes, simulate STT
    // In production, this would call the actual APIs
    
    if (this.engine === 'openai') {
      return this.simulateOpenAIWhisper(audioBlob);
    } else {
      return this.simulateElevenLabsSTT(audioBlob);
    }
  }
  
  private async simulateOpenAIWhisper(audioBlob: Blob): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, include language parameter:
    // formData.append('language', this.getLanguageCode());
    
    // Demo responses based on language
    const demoResponses: Record<Language, string[]> = {
      en: [
        "What's the weather like today?",
        "Can you help me with a coding problem?",
        "Tell me about the AI chatbot features"
      ],
      fr: [
        "Quel temps fait-il aujourd'hui?",
        "Pouvez-vous m'aider avec un problème de codage?",
        "Parlez-moi des fonctionnalités du chatbot"
      ],
      ig: [
        "Kedu ka ihu igwe dị taa?",
        "Ị nwere ike inyere m aka na nsogbu nke koodu?",
        "Gwa m maka atụmatụ chatbot AI"
      ],
      de: [
        "Wie ist das Wetter heute?",
        "Können Sie mir bei einem Programmierproblem helfen?",
        "Erzählen Sie mir von den Chatbot-Funktionen"
      ],
      yo: [
        "Báwo ni ojú ọjọ́ ṣe rí lónìí?",
        "Ṣé ẹ lè ràn mí lọ́wọ́ pẹ̀lú ìṣòro kóòdù?",
        "Sọ fún mi nípa àwọn ẹ̀yà chatbot"
      ],
      ha: [
        "Yaya yanayi yake yau?",
        "Za ku iya taimaka mini da matsalar coding?",
        "Faɗa mini game da fasalolin chatbot"
      ]
    };
    
    const responses = demoResponses[this.language] || demoResponses.en;
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  private async simulateElevenLabsSTT(audioBlob: Blob): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Demo response for Eleven Labs
    const demoResponses = [
      "I need help with voice integration",
      "How does the RAG system work?",
      "Can I use multiple languages?",
      "What are the customization options?",
      "Is there an API available?"
    ];
    
    return demoResponses[Math.floor(Math.random() * demoResponses.length)];
  }
  
  async textToSpeech(text: string, settings?: Partial<VoiceSettings>): Promise<void> {
    if (this.engine === 'openai') {
      return this.openAITextToSpeech(text, settings);
    } else {
      return this.elevenLabsTextToSpeech(text, settings);
    }
  }
  
  private getVoiceForLanguage(): SpeechSynthesisVoice | null {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    
    // Language to voice mapping
    const languageMap: Record<Language, string[]> = {
      en: ['en-US', 'en-GB', 'en'],
      fr: ['fr-FR', 'fr'],
      ig: ['ig-NG', 'en-NG', 'en'], // Fallback to Nigerian English if Igbo not available
      de: ['de-DE', 'de'],
      yo: ['yo-NG', 'en-NG', 'en'], // Fallback to Nigerian English if Yoruba not available
      ha: ['ha-NG', 'en-NG', 'en']  // Fallback to Nigerian English if Hausa not available
    };
    
    const preferredLangs = languageMap[this.language] || languageMap.en;
    
    for (const lang of preferredLangs) {
      const voice = voices.find(v => v.lang.startsWith(lang));
      if (voice) return voice;
    }
    
    return voices[0]; // Return first available voice as last resort
  }
  
  private async openAITextToSpeech(text: string, settings?: Partial<VoiceSettings>): Promise<void> {
    // For demo, use browser's built-in TTS with language support
    
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = settings?.rate || 1.0;
        utterance.pitch = settings?.pitch || 1.0;
        utterance.volume = settings?.volume || 1.0;
        utterance.lang = this.getLanguageCode();
        
        // Select appropriate voice for the language
        const voice = this.getVoiceForLanguage();
        if (voice) {
          utterance.voice = voice;
        }
        
        utterance.onend = () => {
          this.isPlaying = false;
          resolve();
        };
        
        utterance.onerror = (error) => {
          this.isPlaying = false;
          reject(error);
        };
        
        this.isPlaying = true;
        speechSynthesis.speak(utterance);
      } else {
        reject(new Error('Speech synthesis not supported'));
      }
    });
    
    // Production implementation:
    // const response = await fetch('https://api.openai.com/v1/audio/speech', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     model: 'tts-1',
    //     voice: settings?.voiceId || 'alloy',
    //     input: text,
    //     speed: settings?.rate || 1.0
    //   })
    // });
    // 
    // const audioBlob = await response.blob();
    // await this.playAudio(audioBlob);
  }
  
  private async elevenLabsTextToSpeech(text: string, settings?: Partial<VoiceSettings>): Promise<void> {
    // For demo, use browser's built-in TTS with different settings
    // In production, use Eleven Labs API
    
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = settings?.rate || 0.9;
        utterance.pitch = settings?.pitch || 1.1;
        utterance.volume = settings?.volume || 1.0;
        
        // Try to use a different voice for variety
        const voices = speechSynthesis.getVoices();
        if (voices.length > 1) {
          utterance.voice = voices[1];
        }
        
        utterance.onend = () => {
          this.isPlaying = false;
          resolve();
        };
        
        utterance.onerror = (error) => {
          this.isPlaying = false;
          reject(error);
        };
        
        this.isPlaying = true;
        speechSynthesis.speak(utterance);
      } else {
        reject(new Error('Speech synthesis not supported'));
      }
    });
    
    // Production implementation:
    // const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    //   method: 'POST',
    //   headers: {
    //     'xi-api-key': apiKey,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     text,
    //     model_id: 'eleven_monolingual_v1',
    //     voice_settings: {
    //       stability: settings?.stability || 0.5,
    //       similarity_boost: settings?.similarityBoost || 0.5
    //     }
    //   })
    // });
    // 
    // const audioBlob = await response.blob();
    // await this.playAudio(audioBlob);
  }
  
  private async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudio = new Audio(audioUrl);
      
      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.isPlaying = false;
        this.currentAudio = null;
        resolve();
      };
      
      this.currentAudio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        this.isPlaying = false;
        this.currentAudio = null;
        reject(error);
      };
      
      this.isPlaying = true;
      this.currentAudio.play();
    });
  }
  
  stopPlayback(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    
    this.isPlaying = false;
  }
  
  private getLanguageCode(): string {
    const languageCodes: Record<Language, string> = {
      en: 'en-US',
      fr: 'fr-FR',
      ig: 'ig-NG',
      de: 'de-DE',
      yo: 'yo-NG',
      ha: 'ha-NG'
    };
    return languageCodes[this.language] || 'en-US';
  }
  
  setEngine(engine: VoiceEngine): void {
    this.engine = engine;
  }
  
  setLanguage(language: Language): void {
    this.language = language;
  }
  
  getEngine(): VoiceEngine {
    return this.engine;
  }
  
  getLanguage(): Language {
    return this.language;
  }
  
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
  
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
  
  cleanup(): void {
    this.stopPlayback();
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
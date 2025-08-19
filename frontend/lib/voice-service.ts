// Voice service for handling speech-to-text and text-to-speech
// In production, these would connect to actual OpenAI and Eleven Labs APIs

interface VoiceOptions {
    speed?: number
    style?: string
    voice?: string
  }
  
  // Speech-to-Text (STT)
  export async function processVoiceInput(engine: 'openai' | 'elevenlabs'): Promise<string> {
    // In production, this would use the actual APIs
    // For demo, we'll use the Web Speech API as a fallback
    
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'))
        return
      }
  
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
  
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1
  
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        resolve(transcript)
      }
  
      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`))
      }
  
      recognition.onend = () => {
        // Recognition ended
      }
  
      recognition.start()
  
      // Auto-stop after 10 seconds
      setTimeout(() => {
        recognition.stop()
      }, 10000)
    })
  }
  
  // Text-to-Speech (TTS)
  export async function synthesizeSpeech(
    text: string,
    engine: 'openai' | 'elevenlabs',
    options: VoiceOptions = {}
  ): Promise<string> {
    // In production, this would call the actual TTS APIs
    // For demo, we'll use the Web Speech API
    
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'))
        return
      }
  
      // Create a blob URL for audio playback simulation
      // In production, this would be the actual audio URL from the API
      const audioUrl = createAudioUrl(text, engine, options)
      
      // Use Web Speech API as fallback
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.speed || 1
      utterance.pitch = 1
      utterance.volume = 1
  
      // Select voice based on engine simulation
      const voices = speechSynthesis.getVoices()
      if (voices.length > 0) {
        // Try to select an appropriate voice
        const preferredVoice = voices.find(voice => 
          engine === 'openai' ? voice.name.includes('Google') : voice.name.includes('Microsoft')
        ) || voices[0]
        utterance.voice = preferredVoice
      }
  
      // Speak the text
      speechSynthesis.speak(utterance)
      
      // Return a mock audio URL for the audio element
      resolve(audioUrl)
    })
  }
  
  // Create a mock audio URL for demo purposes
  function createAudioUrl(text: string, engine: string, options: VoiceOptions): string {
    // In production, this would return the actual audio file URL from the API
    // For demo, we create a data URL with silence
    const silence = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
    return silence
  }
  
  // Get available voices
  export async function getAvailableVoices(engine: 'openai' | 'elevenlabs'): Promise<string[]> {
    // In production, this would fetch from the actual APIs
    if (engine === 'openai') {
      return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
    } else {
      return ['Rachel', 'Domi', 'Bella', 'Antoni', 'Elli', 'Josh']
    }
  }
  
  // Real-time voice streaming (for future WebRTC implementation)
  export class VoiceStream {
    private mediaStream: MediaStream | null = null
    private mediaRecorder: MediaRecorder | null = null
    private audioChunks: Blob[] = []
  
    async startRecording(): Promise<void> {
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.mediaRecorder = new MediaRecorder(this.mediaStream)
        
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data)
          }
        }
  
        this.mediaRecorder.start(100) // Collect data every 100ms
      } catch (error) {
        console.error('Error starting recording:', error)
        throw error
      }
    }
  
    stopRecording(): Promise<Blob> {
      return new Promise((resolve) => {
        if (!this.mediaRecorder) {
          resolve(new Blob())
          return
        }
  
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
          this.audioChunks = []
          resolve(audioBlob)
        }
  
        this.mediaRecorder.stop()
        this.mediaStream?.getTracks().forEach(track => track.stop())
      })
    }
  
    async processAudioChunk(chunk: Blob): Promise<string> {
      // In production, this would send audio chunks to the real-time API
      // For demo, we'll just return a placeholder
      return 'Processing audio...'
    }
  }
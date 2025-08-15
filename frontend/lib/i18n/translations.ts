import { Language } from '@/types';

export interface TranslationStrings {
  welcomeMessage: string;
  placeholder: string;
  selectLanguage: string;
  changeLanguage: string;
  typeMessage: string;
  listening: string;
  speaking: string;
  online: string;
  sendMessage: string;
  stopRecording: string;
  startRecording: string;
  thinking: string;
  sources: string;
  settings: string;
  voiceSettings: string;
  language: string;
  speed: string;
  stability: string;
  similarity: string;
  advancedVoiceSettings: string;
  lastUpdated: string;
  version: string;
  viewFullDocument: string;
  minimize: string;
  expand: string;
  fullscreen: string;
  mute: string;
  unmute: string;
  play: string;
  voice: string;
  text: string;
  source: string;
  error: {
    generic: string;
    microphone: string;
    connection: string;
  };
  languages: {
    en: string;
    fr: string;
    ig: string;
    de: string;
    yo: string;
    ha: string;
  };
}

export const translations: Record<Language, TranslationStrings> = {
  en: {
    welcomeMessage: "Hello! I'm your AI assistant. How can I help you today?",
    placeholder: "Type a message or click the mic to speak...",
    selectLanguage: "Select Language",
    changeLanguage: "Change Language",
    typeMessage: "Type a message",
    listening: "Listening...",
    speaking: "Speaking...",
    online: "Online",
    sendMessage: "Send message",
    stopRecording: "Stop recording",
    startRecording: "Start recording",
    thinking: "Thinking...",
    sources: "Sources",
    settings: "Settings",
    voiceSettings: "Voice Settings",
    language: "Language",
    speed: "Speed",
    stability: "Stability",
    similarity: "Similarity",
    advancedVoiceSettings: "Advanced Voice Settings",
    lastUpdated: "Last Updated",
    version: "Version",
    viewFullDocument: "View Full Document",
    minimize: "Minimize",
    expand: "Expand",
    fullscreen: "Fullscreen",
    mute: "Mute",
    unmute: "Unmute",
    play: "Play",
    voice: "Voice",
    text: "Text",
    source: "source",
    error: {
      generic: "Sorry, I encountered an error processing your request. Please try again.",
      microphone: "Failed to access microphone. Please check your permissions.",
      connection: "Connection error. Please check your internet connection."
    },
    languages: {
      en: "English",
      fr: "French",
      ig: "Igbo",
      de: "German",
      yo: "Yoruba",
      ha: "Hausa"
    }
  },
  
  fr: {
    welcomeMessage: "Bonjour! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui?",
    placeholder: "Tapez un message ou cliquez sur le micro pour parler...",
    selectLanguage: "Sélectionner la langue",
    changeLanguage: "Changer de langue",
    typeMessage: "Tapez un message",
    listening: "Écoute...",
    speaking: "Parle...",
    online: "En ligne",
    sendMessage: "Envoyer le message",
    stopRecording: "Arrêter l'enregistrement",
    startRecording: "Commencer l'enregistrement",
    thinking: "Réflexion...",
    sources: "Sources",
    settings: "Paramètres",
    voiceSettings: "Paramètres vocaux",
    language: "Langue",
    speed: "Vitesse",
    stability: "Stabilité",
    similarity: "Similarité",
    advancedVoiceSettings: "Paramètres vocaux avancés",
    lastUpdated: "Dernière mise à jour",
    version: "Version",
    viewFullDocument: "Voir le document complet",
    minimize: "Minimiser",
    expand: "Agrandir",
    fullscreen: "Plein écran",
    mute: "Muet",
    unmute: "Activer le son",
    play: "Jouer",
    voice: "Voix",
    text: "Texte",
    source: "source",
    error: {
      generic: "Désolé, j'ai rencontré une erreur. Veuillez réessayer.",
      microphone: "Impossible d'accéder au microphone. Veuillez vérifier vos autorisations.",
      connection: "Erreur de connexion. Veuillez vérifier votre connexion internet."
    },
    languages: {
      en: "Anglais",
      fr: "Français",
      ig: "Igbo",
      de: "Allemand",
      yo: "Yoruba",
      ha: "Haoussa"
    }
  },
  
  ig: {
    welcomeMessage: "Nnọọ! Abụ m onye enyemaka AI gị. Kedu ka m ga-esi nyere gị aka taa?",
    placeholder: "Pịnye ozi ma ọ bụ pịa igwe okwu ka ikwuo okwu...",
    selectLanguage: "Họrọ Asụsụ",
    changeLanguage: "Gbanwee Asụsụ",
    typeMessage: "Pịnye ozi",
    listening: "Na-ege ntị...",
    speaking: "Na-ekwu okwu...",
    online: "Nọ n'ịntanetị",
    sendMessage: "Zipu ozi",
    stopRecording: "Kwụsị ịdekọ",
    startRecording: "Malite ịdekọ",
    thinking: "Na-eche echiche...",
    sources: "Isi mmalite",
    settings: "Ntọala",
    voiceSettings: "Ntọala olu",
    language: "Asụsụ",
    speed: "Ọsọ",
    stability: "Nkwụsi ike",
    similarity: "Myirịta",
    advancedVoiceSettings: "Ntọala olu dị elu",
    lastUpdated: "Melite ikpeazụ",
    version: "Ụdị",
    viewFullDocument: "Lee akwụkwọ zuru ezu",
    minimize: "Belata",
    expand: "Gbasaa",
    fullscreen: "Ihuenyo zuru ezu",
    mute: "Mechie olu",
    unmute: "Mepee olu",
    play: "Kpọọ",
    voice: "Olu",
    text: "Ederede",
    source: "isi mmalite",
    error: {
      generic: "Ndo, enwere m nsogbu. Biko nwaa ọzọ.",
      microphone: "Enweghị ike ịnweta igwe okwu. Biko lelee ikike gị.",
      connection: "Njehie njikọ. Biko lelee njikọ ịntanetị gị."
    },
    languages: {
      en: "Bekee",
      fr: "French",
      ig: "Igbo",
      de: "German",
      yo: "Yoruba",
      ha: "Hausa"
    }
  },
  
  de: {
    welcomeMessage: "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?",
    placeholder: "Nachricht eingeben oder Mikrofon zum Sprechen anklicken...",
    selectLanguage: "Sprache auswählen",
    changeLanguage: "Sprache ändern",
    typeMessage: "Nachricht eingeben",
    listening: "Höre zu...",
    speaking: "Spreche...",
    online: "Online",
    sendMessage: "Nachricht senden",
    stopRecording: "Aufnahme stoppen",
    startRecording: "Aufnahme starten",
    thinking: "Denke nach...",
    sources: "Quellen",
    settings: "Einstellungen",
    voiceSettings: "Spracheinstellungen",
    language: "Sprache",
    speed: "Geschwindigkeit",
    stability: "Stabilität",
    similarity: "Ähnlichkeit",
    advancedVoiceSettings: "Erweiterte Spracheinstellungen",
    lastUpdated: "Zuletzt aktualisiert",
    version: "Version",
    viewFullDocument: "Vollständiges Dokument anzeigen",
    minimize: "Minimieren",
    expand: "Erweitern",
    fullscreen: "Vollbild",
    mute: "Stumm",
    unmute: "Ton ein",
    play: "Abspielen",
    voice: "Stimme",
    text: "Text",
    source: "Quelle",
    error: {
      generic: "Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
      microphone: "Kein Zugriff auf das Mikrofon. Bitte überprüfen Sie Ihre Berechtigungen.",
      connection: "Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung."
    },
    languages: {
      en: "Englisch",
      fr: "Französisch",
      ig: "Igbo",
      de: "Deutsch",
      yo: "Yoruba",
      ha: "Hausa"
    }
  },
  
  yo: {
    welcomeMessage: "Ẹ káàbọ̀! Èmi ni olùrànlọ́wọ́ AI yín. Báwo ni mo ṣe lè ràn yín lọ́wọ́ lónìí?",
    placeholder: "Tẹ ìfiránṣẹ́ tàbí tẹ gbohùngbohùn láti sọ̀rọ̀...",
    selectLanguage: "Yan Èdè",
    changeLanguage: "Yí Èdè Padà",
    typeMessage: "Tẹ ìfiránṣẹ́",
    listening: "Ń gbọ́...",
    speaking: "Ń sọ̀rọ̀...",
    online: "Wà lórí ayélujára",
    sendMessage: "Fi ìfiránṣẹ́ ránṣẹ́",
    stopRecording: "Dá ìgbàsílẹ̀ dúró",
    startRecording: "Bẹ̀rẹ̀ ìgbàsílẹ̀",
    thinking: "Ń ronú...",
    sources: "Àwọn orísun",
    settings: "Àwọn ètò",
    voiceSettings: "Àwọn ètò ohùn",
    language: "Èdè",
    speed: "Iyara",
    stability: "Ìdúróṣinṣin",
    similarity: "Ìjọra",
    advancedVoiceSettings: "Àwọn ètò ohùn tó ga",
    lastUpdated: "Ìmúdójúìwọ̀n tó kẹ́yìn",
    version: "Ẹ̀yà",
    viewFullDocument: "Wo ìwé kíkún",
    minimize: "Kéré sí",
    expand: "Fẹ̀",
    fullscreen: "Ojú ìbòjú kíkún",
    mute: "Dákẹ́",
    unmute: "Jẹ́ kó dún",
    play: "Ṣe",
    voice: "Ohùn",
    text: "Ọ̀rọ̀",
    source: "orísun",
    error: {
      generic: "Má bínú, mo ní ìṣòro. Ẹ jọ̀wọ́ gbìyànjú lẹ́ẹ̀kansi.",
      microphone: "Kò lè rí gbohùngbohùn. Ẹ jọ̀wọ́ yẹ àwọn ìgbàṣẹ yín wò.",
      connection: "Àṣìṣe ìsopọ̀. Ẹ jọ̀wọ́ yẹ ìsopọ̀ ayélujára yín wò."
    },
    languages: {
      en: "Gẹ̀ẹ́sì",
      fr: "Faransé",
      ig: "Igbo",
      de: "Jámánì",
      yo: "Yorùbá",
      ha: "Hausa"
    }
  },
  
  ha: {
    welcomeMessage: "Sannu! Ni ne mataimakin AI naku. Yaya zan taimaka muku yau?",
    placeholder: "Rubuta saƙo ko danna makirufo don magana...",
    selectLanguage: "Zaɓi Harshe",
    changeLanguage: "Canza Harshe",
    typeMessage: "Rubuta saƙo",
    listening: "Ina saurare...",
    speaking: "Ina magana...",
    online: "Kan layi",
    sendMessage: "Aika saƙo",
    stopRecording: "Dakatar da rikodi",
    startRecording: "Fara rikodi",
    thinking: "Ina tunani...",
    sources: "Tushe",
    settings: "Saituna",
    voiceSettings: "Saitunan Murya",
    language: "Harshe",
    speed: "Sauri",
    stability: "Kwanciyar hankali",
    similarity: "Kamanni",
    advancedVoiceSettings: "Manyan Saitunan Murya",
    lastUpdated: "Sabuntawa ta ƙarshe",
    version: "Sigar",
    viewFullDocument: "Duba Cikakken Takarda",
    minimize: "Rage",
    expand: "Faɗaɗa",
    fullscreen: "Cikakken allo",
    mute: "Rufe murya",
    unmute: "Buɗe murya",
    play: "Kunna",
    voice: "Murya",
    text: "Rubutu",
    source: "tushe",
    error: {
      generic: "Yi hakuri, na sami matsala. Da fatan za a sake gwadawa.",
      microphone: "Ba zai iya samun damar makirufo ba. Da fatan za a duba izini.",
      connection: "Kuskuren haɗi. Da fatan za a duba haɗin intanet."
    },
    languages: {
      en: "Turanci",
      fr: "Faransanci",
      ig: "Igbo",
      de: "Jamusanci",
      yo: "Yarbanci",
      ha: "Hausa"
    }
  }
};

export function getTranslation(language: Language): TranslationStrings {
  return translations[language] || translations.en;
}

export function translateText(key: string, language: Language): string {
  const t = getTranslation(language);
  const keys = key.split('.');
  let result: any = t;
  
  for (const k of keys) {
    result = result?.[k];
    if (result === undefined) {
      return key; // Return key if translation not found
    }
  }
  
  return result;
}
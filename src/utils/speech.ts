import { Language } from '../types/advisory';

const LANGUAGE_LOCALES: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  sw: 'sw-KE',
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(
  text: string, 
  language: Language, 
  onStart?: () => void, 
  onEnd?: () => void,
  rate = 0.95
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const targetLocale = LANGUAGE_LOCALES[language] || 'en-IN';
  utterance.lang = targetLocale;
  utterance.rate = rate;
  utterance.pitch = 1.0;

  // Find suitable voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => 
    v.lang.toLowerCase().replace('_', '-').startsWith(targetLocale.toLowerCase()) ||
    v.lang.toLowerCase().startsWith(language.toLowerCase())
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}


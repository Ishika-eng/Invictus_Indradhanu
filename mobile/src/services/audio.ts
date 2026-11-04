import * as Speech from 'expo-speech';

const LANGUAGE_CODE_MAP: Record<string, string> = {
  mr: 'mr-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  en: 'en-IN',
};

export const AudioService = {
  /**
   * Speak advisory text in the requested regional language
   */
  async speakText(
    text: string,
    language: string = 'mr',
    onDone?: () => void,
    onError?: (error: any) => void
  ): Promise<void> {
    try {
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }

      const voiceCode = LANGUAGE_CODE_MAP[language] || 'hi-IN';

      Speech.speak(text, {
        language: voiceCode,
        pitch: 1.0,
        rate: 0.9, // Slightly slower for clear rural comprehension
        onDone: () => {
          if (onDone) onDone();
        },
        onError: (err) => {
          if (onError) onError(err);
        },
      });
    } catch (e) {
      if (onError) onError(e);
    }
  },

  /**
   * Stop any current speech playback
   */
  async stop(): Promise<void> {
    try {
      await Speech.stop();
    } catch {
      // Ignore stop errors
    }
  },

  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch {
      return false;
    }
  }
};


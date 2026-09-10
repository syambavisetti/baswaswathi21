export async function playNativeSpeech(text: string, bcp47: string, languageName: string): Promise<boolean> {
  // Try Web Speech API first for instant, zero-latency playback
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92; // Slightly natural, conversational cadence
      utterance.pitch = 1.0;

      // Find best voice match
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => 
        v.lang.toLowerCase() === bcp47.toLowerCase() || 
        v.lang.toLowerCase().startsWith(bcp47.split('-')[0].toLowerCase())
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      } else {
        utterance.lang = bcp47;
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  // Fallback to server TTS if available
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: languageName }),
    });
    const data = await res.json();
    if (data.success && data.audioBase64) {
      // Decode and play PCM or base64 audio
      const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
      await audio.play();
      return true;
    }
  } catch (err) {
    console.warn('Server TTS fallback failed:', err);
  }

  return false;
}

export function createSpeechRecognizer(
  langCode: string,
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onEnd: () => void
) {
  if (typeof window === 'undefined') return null;

  // Check Web Speech API
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = langCode || 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript);
      } else if (event.results[0] && event.results[0][0]) {
        onResult(event.results[0][0].transcript);
      }
    };

    recognition.onerror = (event: any) => {
      onError(event.error || 'Microphone error');
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  } catch (err) {
    console.warn('Speech recognition init failed', err);
    return null;
  }
}

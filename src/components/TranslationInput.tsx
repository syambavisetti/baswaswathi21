import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, X, Sparkles, CornerDownLeft } from 'lucide-react';
import { LanguageOption } from '../types';
import { createSpeechRecognizer } from '../utils/speech';

interface TranslationInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onTranslate: () => void;
  isLoading: boolean;
  targetLang: LanguageOption;
  sourceLangCode: string;
}

export const TranslationInput: React.FC<TranslationInputProps> = ({
  inputText,
  onInputChange,
  onTranslate,
  isLoading,
  targetLang,
  sourceLangCode,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recognizerRef = useRef<any>(null);

  // Stop listening if component unmounts
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setMicError(null);
    const bcpCode = sourceLangCode === 'auto' ? 'en-US' : sourceLangCode;
    const recognizer = createSpeechRecognizer(
      bcpCode,
      (transcript) => {
        onInputChange(transcript);
      },
      (err) => {
        console.warn('Mic error:', err);
        setMicError('Microphone not accessible or not supported in this browser.');
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (!recognizer) {
      setMicError('Speech recognition is not supported in this browser. Please type your phrase.');
      return;
    }

    try {
      recognizer.start();
      recognizerRef.current = recognizer;
      setIsListening(true);
    } catch (e: any) {
      setMicError('Could not start microphone: ' + (e.message || 'permission error'));
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (inputText.trim() && !isLoading) {
        onTranslate();
      }
    }
  };

  return (
    <div id="translation-input-box" className="w-full bg-white border border-black/10 p-6 sm:p-8 mb-5 shadow-2xs relative">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#E63946] rounded-full"></span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-black/60">
            Natural Thought / Expression
          </span>
        </div>
        {inputText && (
          <button
            id="clear-input-btn"
            type="button"
            onClick={() => onInputChange('')}
            className="px-3 py-1 border border-black/15 text-[10px] font-bold uppercase tracking-wider text-black/70 hover:bg-black hover:text-white transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Textarea container */}
      <div className="relative mb-4">
        <textarea
          id="translation-source-textarea"
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder={`Type or speak naturally (e.g. "Have you eaten yet?", "Did you get home safely?")`}
          className="w-full resize-none text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#121212] placeholder:text-black/20 placeholder:font-medium leading-tight font-display focus:outline-none bg-transparent"
        />
      </div>

      {micError && (
        <div id="mic-error-msg" className="text-xs font-bold text-[#E63946] mb-3 bg-[#E63946]/5 p-2.5 border border-[#E63946]/20">
          {micError}
        </div>
      )}

      {/* Suggested Mother Tongue Starter Prompts */}
      {targetLang.samplePhrases && targetLang.samplePhrases.length > 0 && (
        <div className="mt-2 pt-4 border-t border-black/10">
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-black/50 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Try authentic everyday prompts:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {targetLang.samplePhrases.map((phrase, idx) => (
              <button
                key={idx}
                id={`sample-phrase-${idx}-btn`}
                type="button"
                onClick={() => onInputChange(phrase)}
                className="text-xs font-bold text-black/80 px-3.5 py-1.5 rounded-full border border-black/15 hover:bg-black hover:text-white hover:border-black transition-all text-left"
              >
                &ldquo;{phrase}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-black/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Microphone button */}
          <button
            id="mic-record-btn"
            type="button"
            onClick={toggleListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-none sm:rounded-md text-[11px] font-bold uppercase tracking-wider border transition-all ${
              isListening
                ? 'bg-[#E63946] text-white border-[#E63946] animate-pulse'
                : 'bg-white text-[#121212] border-black/20 hover:bg-black hover:text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Speak to input'}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
          </button>

          <span className="text-[10px] uppercase font-bold tracking-wider text-black/40 hidden sm:inline-block">
            Press <kbd className="px-1.5 py-0.5 border border-black/20 text-black font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 border border-black/20 text-black font-mono">Enter</kbd>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-black/40">
            {inputText.length} chars
          </span>

          <button
            id="submit-translate-btn"
            type="button"
            disabled={!inputText.trim() || isLoading}
            onClick={onTranslate}
            className={`flex items-center gap-2 px-6 py-3 rounded-none sm:rounded-md text-xs font-bold uppercase tracking-widest transition-all ${
              !inputText.trim() || isLoading
                ? 'bg-black/10 text-black/40 cursor-not-allowed border border-black/10'
                : 'bg-black hover:bg-[#E63946] text-white shadow-xs cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <span>Translate to {targetLang.name}</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

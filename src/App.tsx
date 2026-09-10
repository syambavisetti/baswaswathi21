import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LanguageSelector } from './components/LanguageSelector';
import { TranslationInput } from './components/TranslationInput';
import { TranslationResultCard } from './components/TranslationResultCard';
import { PhrasebookDrawer } from './components/PhrasebookDrawer';
import { POPULAR_MOTHER_TONGUES } from './data/languages';
import {
  LanguageOption,
  MotherTongueTranslation,
  SavedPhrase,
  FormalityRegister,
} from './types';
import { Heart, Sparkles, AlertCircle, BookHeart } from 'lucide-react';

const LOCAL_STORAGE_KEY_PREF_LANG = 'mtt_my_mother_tongue';
const LOCAL_STORAGE_KEY_PHRASEBOOK = 'mtt_saved_phrases';

export default function App() {
  // Load or default mother tongue
  const [myMotherTongue, setMyMotherTongue] = useState<LanguageOption>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREF_LANG);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = POPULAR_MOTHER_TONGUES.find((l) => l.code === parsed.code);
        if (match) return match;
      }
    } catch {}
    // Default to Telugu or first option
    return POPULAR_MOTHER_TONGUES[0];
  });

  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<LanguageOption>(() => myMotherTongue);
  const [targetDialect, setTargetDialect] = useState<string>('');
  const [registerPreference, setRegisterPreference] = useState<FormalityRegister | 'all'>('all');

  const [inputText, setInputText] = useState<string>('Have you eaten your meal yet?');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [translationResult, setTranslationResult] = useState<MotherTongueTranslation | null>(null);

  // Saved phrasebook
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PHRASEBOOK);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isPhrasebookOpen, setIsPhrasebookOpen] = useState<boolean>(false);

  // Sync mother tongue change to local storage
  const handleSelectMyMotherTongue = (lang: LanguageOption) => {
    setMyMotherTongue(lang);
    setTargetLang(lang);
    setTargetDialect('');
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PREF_LANG, JSON.stringify(lang));
    } catch {}
  };

  // Sync phrasebook to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PHRASEBOOK, JSON.stringify(savedPhrases));
    } catch {}
  }, [savedPhrases]);

  // Initial translation on page load so user immediately sees a working app
  useEffect(() => {
    handleTranslate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTranslate = async (customText?: string) => {
    const textToTranslate = customText !== undefined ? customText : inputText;
    if (!textToTranslate.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate.trim(),
          sourceLang,
          targetLang: targetLang.name,
          targetDialect: targetDialect || undefined,
          registerPreference,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to translate. Please try again.');
      }

      setTranslationResult(json.data);
    } catch (err: any) {
      console.error('Translation failed:', err);
      setErrorMessage(
        err.message || 'Unable to connect to translation service. Please check your network and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') {
      // Set source to target, and target to English
      const eng = POPULAR_MOTHER_TONGUES.find((l) => l.code === 'en') || POPULAR_MOTHER_TONGUES[0];
      setSourceLang(targetLang.code);
      setTargetLang(eng);
    } else {
      const prevSourceObj = POPULAR_MOTHER_TONGUES.find((l) => l.code === sourceLang);
      setSourceLang(targetLang.code);
      if (prevSourceObj) {
        setTargetLang(prevSourceObj);
      }
    }
    setTargetDialect('');
    if (translationResult) {
      setInputText(translationResult.motherTongueText);
    }
  };

  const handleSavePhrase = (register: FormalityRegister, customTag?: string) => {
    if (!translationResult) return;

    const activeReg = translationResult.registers[register] || {
      text: translationResult.motherTongueText,
      phonetic: translationResult.phoneticScript,
    };

    const newPhrase: SavedPhrase = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourceText: translationResult.sourceText,
      targetLang: translationResult.targetLang,
      motherTongueText: activeReg.text,
      phoneticScript: activeReg.phonetic,
      selectedRegister: register,
      culturalNote: translationResult.culturalNote,
      savedAt: new Date().toISOString(),
      tag: customTag || 'General',
    };

    setSavedPhrases((prev) => [newPhrase, ...prev]);
  };

  const handleDeletePhrase = (id: string) => {
    setSavedPhrases((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAllPhrases = () => {
    setSavedPhrases([]);
  };

  const isCurrentPhraseAlreadySaved = !!translationResult && savedPhrases.some(
    (p) =>
      p.sourceText.trim().toLowerCase() === translationResult.sourceText.trim().toLowerCase() &&
      p.targetLang === translationResult.targetLang
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#121212] flex flex-col font-sans selection:bg-[#E63946] selection:text-white">
      {/* Header */}
      <Header
        myMotherTongue={myMotherTongue}
        onSelectMotherTongue={handleSelectMyMotherTongue}
        allLanguages={POPULAR_MOTHER_TONGUES}
        savedCount={savedPhrases.length}
        onOpenPhrasebook={() => setIsPhrasebookOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Intro banner */}
        <div className="mb-8 bg-white border border-black/10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xs relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-black/50">
                Cultural Heritage Translation Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tighter text-[#121212] font-display uppercase leading-tight">
              Speak With the Soul of Home
            </h2>
            <p className="text-xs sm:text-sm font-medium text-black/70 max-w-2xl leading-relaxed">
              Moving beyond textbook machine translation into living colloquial idioms, phonetic scripts for heritage speakers,
              and authentic cultural registers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <button
              id="view-heritage-phrasebook-hero-btn"
              type="button"
              onClick={() => setIsPhrasebookOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border-2 border-black bg-white hover:bg-black hover:text-white text-black text-xs font-bold uppercase tracking-wider transition-all"
            >
              <BookHeart className="w-4 h-4 text-[#E63946]" />
              <span>Saved Expressions ({savedPhrases.length})</span>
            </button>
          </div>
        </div>

        {/* Language Selection Bar */}
        <LanguageSelector
          sourceLang={sourceLang}
          onSourceLangChange={setSourceLang}
          targetLang={targetLang}
          onTargetLangChange={(newLang) => {
            setTargetLang(newLang);
            setTargetDialect('');
          }}
          targetDialect={targetDialect}
          onTargetDialectChange={setTargetDialect}
          allLanguages={POPULAR_MOTHER_TONGUES}
          onSwapLanguages={handleSwapLanguages}
          registerPreference={registerPreference}
          onRegisterPreferenceChange={setRegisterPreference}
        />

        {/* Translation Input Area */}
        <TranslationInput
          inputText={inputText}
          onInputChange={setInputText}
          onTranslate={() => handleTranslate()}
          isLoading={isLoading}
          targetLang={targetLang}
          sourceLangCode={sourceLang}
        />

        {/* Error Alert if any */}
        {errorMessage && (
          <div
            id="translation-error-banner"
            className="mb-6 bg-white border-2 border-[#E63946] text-[#121212] p-4 text-xs flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
            <div className="flex-1 font-bold">
              <span className="uppercase tracking-widest text-[#E63946] block mb-0.5 text-[10px]">Notice</span>
              {errorMessage}
            </div>
            <button
              type="button"
              onClick={() => handleTranslate()}
              className="text-xs uppercase tracking-wider underline font-black text-[#E63946] hover:text-black"
            >
              Retry
            </button>
          </div>
        )}

        {/* Translation Result Card */}
        {translationResult && (
          <TranslationResultCard
            result={translationResult}
            targetLangOption={targetLang}
            onSavePhrase={handleSavePhrase}
            isAlreadySaved={isCurrentPhraseAlreadySaved}
          />
        )}

        {/* Empty / Loading skeleton state */}
        {!translationResult && !isLoading && !errorMessage && (
          <div className="text-center py-16 bg-white border border-black/10 p-8">
            <Sparkles className="w-8 h-8 text-[#E63946] mx-auto mb-3" />
            <h3 className="text-base font-black uppercase tracking-wider text-[#121212]">
              Ready to translate into your mother tongue
            </h3>
            <p className="text-xs font-medium text-black/50 mt-1 max-w-sm mx-auto">
              Enter any thought or select an everyday expression above to uncover authentic phrasing.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-black/10 bg-white py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold tracking-tight text-black/70 uppercase text-[11px]">
            Mother Tongue &bull; Authentic Heritage Expressions
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-black/40">
            Powered by Gemini AI Multilingual Reasoning
          </span>
        </div>
      </footer>

      {/* Phrasebook Drawer Modal */}
      <PhrasebookDrawer
        isOpen={isPhrasebookOpen}
        onClose={() => setIsPhrasebookOpen(false)}
        savedPhrases={savedPhrases}
        onDeletePhrase={handleDeletePhrase}
        onClearAll={handleClearAllPhrases}
      />
    </div>
  );
}

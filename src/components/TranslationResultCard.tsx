import React, { useState } from 'react';
import {
  Volume2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Info,
  Layers,
  Sparkles,
  Users,
  Award,
  MessageCircle,
} from 'lucide-react';
import { MotherTongueTranslation, FormalityRegister, LanguageOption } from '../types';
import { playNativeSpeech } from '../utils/speech';

interface TranslationResultCardProps {
  result: MotherTongueTranslation;
  targetLangOption: LanguageOption;
  onSavePhrase: (register: FormalityRegister, customTag?: string) => void;
  isAlreadySaved: boolean;
}

export const TranslationResultCard: React.FC<TranslationResultCardProps> = ({
  result,
  targetLangOption,
  onSavePhrase,
  isAlreadySaved,
}) => {
  const [selectedRegister, setSelectedRegister] = useState<FormalityRegister>('colloquial');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [saveCategory, setSaveCategory] = useState('Family & Daily Care');

  const activeRegisterData = result.registers[selectedRegister] || {
    text: result.motherTongueText,
    phonetic: result.phoneticScript,
    whenToUse: 'General native usage',
  };

  const handleCopy = (textToCopy: string, key: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSpeak = async (textToSpeak: string) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    await playNativeSpeech(textToSpeak, targetLangOption.bcp47, targetLangOption.name);
    setIsPlayingAudio(false);
  };

  return (
    <div id="translation-result-card" className="w-full bg-[#F9F7F2] border border-black/10 shadow-2xs overflow-hidden mb-6 relative">
      {/* Subtle Background Watermark */}
      <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-[0.03] select-none pointer-events-none text-right">
        <div className="text-[140px] sm:text-[220px] leading-none font-black font-display tracking-tighter text-black uppercase">
          TONGUE
        </div>
      </div>

      {/* Top Bar: Target language & Formality tabs */}
      <div className="bg-white border-b border-black/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{targetLangOption.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#457B9D] rounded-full"></span>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-[#121212] uppercase">
                {result.targetLang}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 border border-black/20 text-black/70 rounded-full">
                {result.targetScript || 'Native Script'}
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-black/40 mt-0.5">
              Source thought: &ldquo;{result.sourceText}&rdquo;
            </p>
          </div>
        </div>

        {/* Register switcher tabs */}
        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
          <span className="text-[10px] uppercase font-bold tracking-[0.15em] opacity-40 mr-1 hidden md:inline">
            Variations:
          </span>
          <button
            id="register-tab-colloquial"
            type="button"
            onClick={() => setSelectedRegister('colloquial')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
              selectedRegister === 'colloquial'
                ? 'bg-black text-white shadow-xs'
                : 'border border-black/20 text-[#121212] hover:bg-black/5'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Colloquial (Home)</span>
          </button>

          <button
            id="register-tab-respectful"
            type="button"
            onClick={() => setSelectedRegister('respectful')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
              selectedRegister === 'respectful'
                ? 'bg-black text-white shadow-xs'
                : 'border border-black/20 text-[#121212] hover:bg-black/5'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>Respectful (Elders)</span>
          </button>

          <button
            id="register-tab-formal"
            type="button"
            onClick={() => setSelectedRegister('formal')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
              selectedRegister === 'formal'
                ? 'bg-black text-white shadow-xs'
                : 'border border-black/20 text-[#121212] hover:bg-black/5'
            }`}
          >
            <MessageCircle className="w-3 h-3" />
            <span>Formal</span>
          </button>
        </div>
      </div>

      {/* Main Translation Content */}
      <div className="p-6 sm:p-10 space-y-8 relative z-10">
        {/* Native Script Display */}
        <div className="bg-white border border-black/10 p-6 sm:p-8 relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E63946] rounded-full"></span>
              <span className="text-[10px] font-black tracking-widest uppercase text-black/50">
                Native Mother Tongue
              </span>
            </div>

            {/* Audio & Copy toolbar */}
            <div className="flex items-center gap-2">
              <button
                id="listen-native-audio-btn"
                type="button"
                onClick={() => handleSpeak(activeRegisterData.text)}
                disabled={isPlayingAudio}
                className={`w-10 h-10 flex items-center justify-center border-2 border-black rounded-full hover:bg-black hover:text-white transition-all ${
                  isPlayingAudio ? 'animate-pulse bg-[#E63946] text-white border-[#E63946]' : 'text-black'
                }`}
                title="Pronounce in native tongue"
              >
                <Volume2 className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                id="copy-native-text-btn"
                type="button"
                onClick={() => handleCopy(activeRegisterData.text, 'native')}
                className="w-10 h-10 flex items-center justify-center border-2 border-black rounded-full text-black hover:bg-black hover:text-white transition-all"
                title="Copy native script"
              >
                {copiedKey === 'native' ? (
                  <Check className="w-4 h-4 stroke-[3] text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>

          {/* Big Bold Native Script */}
          <div className="text-3xl sm:text-5xl md:text-6xl font-black text-[#E63946] tracking-tighter leading-[1.05] font-display mb-4">
            {activeRegisterData.text}
          </div>

          {/* Phonetic Transliteration */}
          <div className="pt-4 border-t border-black/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span className="text-[10px] font-black text-black/50 uppercase tracking-widest">
                Phonetic:
              </span>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-[#121212]">
                {activeRegisterData.phonetic}
              </span>
            </div>

            <button
              id="copy-phonetic-btn"
              type="button"
              onClick={() => handleCopy(activeRegisterData.phonetic, 'phonetic')}
              className="text-[11px] font-bold uppercase tracking-wider text-black/70 hover:text-black hover:underline flex items-center gap-1.5"
            >
              {copiedKey === 'phonetic' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Romanized</span>
                </>
              )}
            </button>
          </div>

          {/* Context tip on when to use this register */}
          <div className="mt-4 p-3 bg-[#F9F7F2] border border-black/10 text-xs text-black/80 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#457B9D] shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase tracking-wider text-[10px] block text-black/60">
                Contextual Register Note
              </span>
              <span className="font-medium">{activeRegisterData.whenToUse}</span>
            </div>
          </div>
        </div>

        {/* Contrast Box: Literal Machine vs Mother Tongue Native */}
        {result.literalTranslation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-black/10 p-5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-black/50">
                <span className="w-2 h-2 rounded-full bg-black/40" />
                <span>Textbook Machine (Stiff &amp; Literal)</span>
              </div>
              <p className="text-sm font-semibold text-black/60 italic border-l-2 border-black/20 pl-3 py-1">
                &ldquo;{result.literalTranslation}&rdquo;
              </p>
              <p className="text-[11px] font-bold text-black/40 uppercase tracking-wide">
                Grammatically literal, but lacks natural home intimacy.
              </p>
            </div>

            <div className="bg-white border border-black/10 p-5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-[#E63946]">
                <span className="w-2 h-2 rounded-full bg-[#E63946]" />
                <span>Mother Tongue Heart (Authentic)</span>
              </div>
              <p className="text-sm font-black text-[#121212] border-l-2 border-[#E63946] pl-3 py-1">
                &ldquo;{activeRegisterData.text}&rdquo; ({activeRegisterData.phonetic})
              </p>
              <p className="text-[11px] font-bold text-[#E63946] uppercase tracking-wide">
                How a native mother, elder, or friend speaks naturally.
              </p>
            </div>
          </div>
        )}

        {/* Cultural Etiquette & Nuance Note */}
        {result.culturalNote && (
          <div className="bg-white border border-black/10 p-6 relative">
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#E63946] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cultural Nuance &amp; Heritage Context</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-[#121212] leading-relaxed tracking-tight">
              {result.culturalNote}
            </p>
          </div>
        )}

        {/* Word-by-Word Anatomical Breakdown */}
        {result.wordBreakdown && result.wordBreakdown.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-black/50 mb-3">
              <BookOpen className="w-3.5 h-3.5 text-black" />
              <span>Word-by-Word Anatomy</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {result.wordBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-black/10 p-4 flex flex-col justify-between text-left shadow-2xs"
                >
                  <div>
                    <div className="text-base font-black text-[#121212] tracking-tight">
                      {item.originalWord}
                    </div>
                    {item.romanized && (
                      <div className="text-xs font-mono font-bold text-[#E63946] mb-2">
                        {item.romanized}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-black/80 pt-2 border-t border-black/10">
                    <span className="font-bold block text-sm text-[#121212]">{item.meaning}</span>
                    {item.nuanceNote && (
                      <span className="block text-[11px] font-medium text-black/50 mt-1">
                        {item.nuanceNote}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Native Idioms & Vernacular Proverbs */}
        {result.nativeIdioms && result.nativeIdioms.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-black/50 mb-3">
              <Layers className="w-3.5 h-3.5 text-black" />
              <span>Authentic Vernacular Idioms</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.nativeIdioms.map((idiom, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-black/10 p-4 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-black text-[#121212] text-base tracking-tight">
                      {idiom.phrase}
                    </div>
                    <div className="font-mono text-xs font-bold text-[#E63946]">
                      {idiom.phonetic}
                    </div>
                    <div className="text-black/80 font-medium">
                      <strong className="font-bold text-black">Meaning:</strong> {idiom.meaning}
                    </div>
                    {idiom.usageNote && (
                      <div className="text-[11px] text-black/50 font-medium">
                        {idiom.usageNote}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSpeak(idiom.phrase)}
                    className="w-8 h-8 flex items-center justify-center border border-black/20 rounded-full hover:bg-black hover:text-white transition-all shrink-0"
                    title="Pronounce idiom"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save to Phrasebook Bar */}
        <div className="pt-6 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold tracking-widest text-black/50 whitespace-nowrap">
              Collection Tag:
            </span>
            <select
              id="phrasebook-category-select"
              value={saveCategory}
              onChange={(e) => setSaveCategory(e.target.value)}
              className="bg-white text-[#121212] text-xs font-bold uppercase tracking-wider rounded-full px-4 py-2 border border-black/15 focus:outline-none"
            >
              <option value="Family & Daily Care">Family & Daily Care</option>
              <option value="Greetings & Respect">Greetings & Respect</option>
              <option value="Dining & Food">Dining & Food</option>
              <option value="Love & Affection">Love & Affection</option>
              <option value="Blessings & Celebrations">Blessings & Celebrations</option>
              <option value="Hometown Slang">Hometown Slang</option>
            </select>
          </div>

          <button
            id="save-to-phrasebook-btn"
            type="button"
            onClick={() => onSavePhrase(selectedRegister, saveCategory)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              isAlreadySaved
                ? 'bg-emerald-600 text-white'
                : 'bg-black text-white hover:bg-[#E63946]'
            }`}
          >
            {isAlreadySaved ? (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span>Saved in Phrasebook</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Add to Phrasebook</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

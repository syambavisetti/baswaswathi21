import React from 'react';
import { ArrowLeftRight, Languages, MapPin, SlidersHorizontal } from 'lucide-react';
import { LanguageOption, FormalityRegister } from '../types';
import { SOURCE_LANGUAGES } from '../data/languages';

interface LanguageSelectorProps {
  sourceLang: string;
  onSourceLangChange: (code: string) => void;
  targetLang: LanguageOption;
  onTargetLangChange: (lang: LanguageOption) => void;
  targetDialect: string;
  onTargetDialectChange: (dialect: string) => void;
  allLanguages: LanguageOption[];
  onSwapLanguages: () => void;
  registerPreference: FormalityRegister | 'all';
  onRegisterPreferenceChange: (reg: FormalityRegister | 'all') => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLang,
  onSourceLangChange,
  targetLang,
  onTargetLangChange,
  targetDialect,
  onTargetDialectChange,
  allLanguages,
  onSwapLanguages,
  registerPreference,
  onRegisterPreferenceChange,
}) => {
  return (
    <div id="language-selector-container" className="w-full bg-white border border-black/10 p-5 sm:p-6 mb-5 shadow-2xs">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Source Language */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-[#E63946] rounded-full"></span>
            <label htmlFor="source-lang-select" className="text-[10px] uppercase font-bold tracking-widest text-black/60">
              Source Language
            </label>
          </div>
          <div className="relative">
            <select
              id="source-lang-select"
              value={sourceLang}
              onChange={(e) => onSourceLangChange(e.target.value)}
              className="w-full appearance-none bg-[#F9F7F2] hover:bg-white transition-colors border border-black/15 text-[#121212] text-sm sm:text-base font-black tracking-tight rounded-xl px-4 py-3 pr-9 focus:outline-none focus:ring-2 focus:ring-black"
            >
              {SOURCE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
            <Languages className="w-4 h-4 text-black/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-2 flex justify-center py-1 md:py-0">
          <button
            id="swap-languages-btn"
            type="button"
            onClick={onSwapLanguages}
            title="Swap source and target"
            className="w-11 h-11 flex items-center justify-center border-2 border-black rounded-full hover:bg-black hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Target Mother Tongue */}
        <div className="md:col-span-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#457B9D] rounded-full"></span>
              <label htmlFor="target-lang-select" className="text-[10px] uppercase font-bold tracking-widest text-black/60">
                Target: {targetLang.name}
              </label>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#E63946]">
              {targetLang.nativeName}
            </span>
          </div>
          <div className="relative">
            <select
              id="target-lang-select"
              value={targetLang.code}
              onChange={(e) => {
                const found = allLanguages.find((l) => l.code === e.target.value);
                if (found) onTargetLangChange(found);
              }}
              className="w-full appearance-none bg-[#F9F7F2] hover:bg-white transition-colors border border-black/15 text-[#121212] text-sm sm:text-base font-black tracking-tight rounded-xl px-4 py-3 pr-9 focus:outline-none focus:ring-2 focus:ring-black"
            >
              {allLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} — {l.nativeName}
                </option>
              ))}
            </select>
            <Languages className="w-4 h-4 text-black/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Sub-bar: Dialect & Register preference */}
      <div className="mt-5 pt-4 border-t border-black/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Dialect Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase font-bold tracking-widest text-black/50 flex items-center gap-1.5 whitespace-nowrap">
            <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Regional Dialect:</span>
          </span>
          {targetLang.dialects && targetLang.dialects.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                id="dialect-all-button"
                onClick={() => onTargetDialectChange('')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  targetDialect === ''
                    ? 'bg-black text-white'
                    : 'border border-black/20 text-[#121212] hover:bg-black/5'
                }`}
              >
                Standard
              </button>
              {targetLang.dialects.map((d) => (
                <button
                  key={d}
                  type="button"
                  id={`dialect-${d.toLowerCase().replace(/[^a-z0-9]/g, '-')}-button`}
                  onClick={() => onTargetDialectChange(d)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    targetDialect === d
                      ? 'bg-black text-white'
                      : 'border border-black/20 text-[#121212] hover:bg-black/5'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-wider text-black/40">Standard Native</span>
          )}
        </div>

        {/* Formality Register Preference Pill */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] uppercase font-bold tracking-widest text-black/50 whitespace-nowrap">
            Register:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              id="focus-register-all-btn"
              type="button"
              onClick={() => onRegisterPreferenceChange('all')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                registerPreference === 'all'
                  ? 'bg-black text-white'
                  : 'border border-black/20 text-[#121212] hover:bg-black/5'
              }`}
            >
              All Tiers
            </button>
            <button
              id="focus-register-colloquial-btn"
              type="button"
              onClick={() => onRegisterPreferenceChange('colloquial')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                registerPreference === 'colloquial'
                  ? 'bg-black text-white'
                  : 'border border-black/20 text-[#121212] hover:bg-black/5'
              }`}
            >
              Colloquial
            </button>
            <button
              id="focus-register-respectful-btn"
              type="button"
              onClick={() => onRegisterPreferenceChange('respectful')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                registerPreference === 'respectful'
                  ? 'bg-black text-white'
                  : 'border border-black/20 text-[#121212] hover:bg-black/5'
              }`}
            >
              Respectful
            </button>
            <button
              id="focus-register-formal-btn"
              type="button"
              onClick={() => onRegisterPreferenceChange('formal')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                registerPreference === 'formal'
                  ? 'bg-black text-white'
                  : 'border border-black/20 text-[#121212] hover:bg-black/5'
              }`}
            >
              Formal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

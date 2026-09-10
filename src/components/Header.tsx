import React from 'react';
import { Bookmark, Heart, Sparkles } from 'lucide-react';
import { LanguageOption } from '../types';

interface HeaderProps {
  myMotherTongue: LanguageOption;
  onSelectMotherTongue: (lang: LanguageOption) => void;
  allLanguages: LanguageOption[];
  savedCount: number;
  onOpenPhrasebook: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  myMotherTongue,
  onSelectMotherTongue,
  allLanguages,
  savedCount,
  onOpenPhrasebook,
}) => {
  return (
    <header id="app-header" className="w-full bg-[#F9F7F2] border-b border-black/10 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-[#121212] font-display flex items-baseline gap-1">
                  <span>MOTHER TONGUE</span>
                  <span className="w-2.5 h-2.5 bg-[#E63946] rounded-full inline-block"></span>
                </h1>
                <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-black text-white whitespace-nowrap">
                  VERNA EDITION
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-widest font-bold text-black/40 hidden sm:block mt-0.5">
                Authentic Dialects &bull; Phonetic Script &bull; Cultural Nuance
              </p>
            </div>
          </div>

          {/* Mobile Phrasebook button */}
          <button
            id="mobile-phrasebook-button"
            type="button"
            onClick={onOpenPhrasebook}
            className="sm:hidden relative p-2.5 rounded-full text-black hover:bg-black/5 border border-black/15"
            aria-label="Open Saved Phrases"
          >
            <Bookmark className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E63946] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>
        </div>

        {/* Right side controls: My Mother Tongue quick selector & Saved Phrases */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-white border border-black/10 rounded-full px-3.5 py-1.5 text-xs shadow-2xs">
            <span className="text-[10px] uppercase tracking-widest font-bold text-black/50 whitespace-nowrap flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#457B9D] rounded-full"></span>
              <span>Default Tongue:</span>
            </span>
            <select
              id="my-mother-tongue-select"
              value={myMotherTongue.code}
              onChange={(e) => {
                const found = allLanguages.find((l) => l.code === e.target.value);
                if (found) onSelectMotherTongue(found);
              }}
              className="bg-transparent font-bold text-[#121212] focus:outline-none cursor-pointer text-xs uppercase tracking-wide"
            >
              {allLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          <button
            id="desktop-phrasebook-button"
            type="button"
            onClick={onOpenPhrasebook}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black text-white hover:bg-[#E63946] text-xs font-bold uppercase tracking-widest transition-colors shadow-2xs"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Phrasebook</span>
            {savedCount > 0 && (
              <span className="bg-white text-black font-black px-1.5 py-0.2 rounded-full text-[10px]">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

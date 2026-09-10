import React, { useState } from 'react';
import {
  X,
  Trash2,
  Volume2,
  Copy,
  Check,
  Search,
  Bookmark,
  Download,
  Filter,
} from 'lucide-react';
import { SavedPhrase } from '../types';
import { playNativeSpeech } from '../utils/speech';

interface PhrasebookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPhrases: SavedPhrase[];
  onDeletePhrase: (id: string) => void;
  onClearAll: () => void;
}

export const PhrasebookDrawer: React.FC<PhrasebookDrawerProps> = ({
  isOpen,
  onClose,
  savedPhrases,
  onDeletePhrase,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const allTags = Array.from(
    new Set(savedPhrases.map((p) => p.tag).filter(Boolean))
  ) as string[];

  const filtered = savedPhrases.filter((p) => {
    const matchesSearch =
      p.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.motherTongueText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phoneticScript.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.targetLang.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || p.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSpeak = (phrase: SavedPhrase) => {
    playNativeSpeech(phrase.motherTongueText, 'en-US', phrase.targetLang);
  };

  const exportPhrases = () => {
    const textContent = savedPhrases
      .map(
        (p, idx) =>
          `${idx + 1}. [${p.targetLang}] "${p.sourceText}"\n   Native: ${p.motherTongueText}\n   Phonetic: ${p.phoneticScript}\n   Register: ${p.selectedRegister}\n   Tag: ${p.tag || 'General'}\n`
      )
      .join('\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mother-tongue-phrasebook-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="phrasebook-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end transition-opacity"
    >
      <div
        id="phrasebook-drawer-content"
        className="w-full max-w-lg bg-[#F9F7F2] h-full shadow-2xl flex flex-col border-l border-black/20"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-black/10 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <Bookmark className="w-5 h-5 text-[#E63946]" />
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tighter text-[#121212] uppercase font-display">
                Saved Phrasebook
              </h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-black/40">
                {savedPhrases.length} native expressions archived
              </p>
            </div>
          </div>
          <button
            id="close-phrasebook-drawer-btn"
            type="button"
            onClick={onClose}
            className="w-9 h-9 border border-black/20 rounded-full flex items-center justify-center text-black hover:bg-black hover:text-white transition-all"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-black/10 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="phrasebook-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phrases, translations, or phonetics..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F2] border border-black/15 rounded-full text-xs font-bold text-[#121212] placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <Filter className="w-3 h-3 text-black/40 shrink-0" />
              <button
                type="button"
                onClick={() => setSelectedTag('all')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  selectedTag === 'all'
                    ? 'bg-black text-white'
                    : 'border border-black/20 text-[#121212] hover:bg-black/5'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                    selectedTag === tag
                      ? 'bg-black text-white'
                      : 'border border-black/20 text-[#121212] hover:bg-black/5'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phrase List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <Bookmark className="w-10 h-10 text-black/20 mb-2" />
              <h3 className="text-sm font-black uppercase tracking-wider text-black/70">
                {savedPhrases.length === 0
                  ? 'No saved phrases yet'
                  : 'No matching expressions'}
              </h3>
              <p className="text-xs text-black/40 font-medium mt-1 max-w-xs">
                {savedPhrases.length === 0
                  ? 'Translate phrases and click "Add to Phrasebook" to keep your favorite native expressions.'
                  : 'Try adjusting your search query or tag filter.'}
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                id={`saved-phrase-item-${item.id}`}
                className="bg-white border border-black/10 p-4 relative space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2.5 py-0.5 rounded-full">
                      {item.targetLang}
                    </span>
                    {item.tag && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-black/60 border border-black/15 px-2 py-0.5 rounded-full">
                        {item.tag}
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                      {item.selectedRegister}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSpeak(item)}
                      className="w-7 h-7 rounded-full border border-black/15 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
                      title="Speak"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.motherTongueText, item.id)}
                      className="w-7 h-7 rounded-full border border-black/15 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
                      title="Copy"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePhrase(item.id)}
                      className="w-7 h-7 rounded-full border border-black/15 flex items-center justify-center text-black/40 hover:text-[#E63946] hover:border-[#E63946] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Native Text */}
                <div className="text-xl sm:text-2xl font-black text-[#E63946] font-display tracking-tight">
                  {item.motherTongueText}
                </div>

                {/* Phonetic */}
                <div className="text-xs font-mono font-bold text-[#121212]/80">
                  {item.phoneticScript}
                </div>

                {/* English source */}
                <div className="text-xs text-black/50 pt-2 border-t border-black/10 italic">
                  &ldquo;{item.sourceText}&rdquo;
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Actions */}
        {savedPhrases.length > 0 && (
          <div className="p-4 border-t border-black/10 bg-white flex items-center justify-between">
            <button
              id="export-phrasebook-btn"
              type="button"
              onClick={exportPhrases}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white bg-black hover:bg-[#E63946] py-2.5 px-4 rounded-full transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Text</span>
            </button>

            <button
              id="clear-all-phrasebook-btn"
              type="button"
              onClick={() => {
                if (window.confirm('Clear all saved phrases from your phrasebook?')) {
                  onClearAll();
                }
              }}
              className="text-[11px] font-bold uppercase tracking-wider text-black/50 hover:text-[#E63946] py-1 px-3"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

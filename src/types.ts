export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  bcp47: string; // for Web Speech API e.g. 'te-IN', 'hi-IN', 'es-MX', 'tl-PH'
  dialects?: string[];
  samplePhrases?: string[];
}

export type FormalityRegister = 'colloquial' | 'respectful' | 'formal';

export interface RegisterDetail {
  text: string;
  phonetic: string;
  whenToUse: string;
}

export interface WordBreakdownItem {
  originalWord: string;
  romanized?: string;
  meaning: string;
  nuanceNote?: string;
}

export interface NativeIdiomItem {
  phrase: string;
  phonetic: string;
  meaning: string;
  usageNote?: string;
}

export interface MotherTongueTranslation {
  sourceText: string;
  detectedSourceLang?: string;
  targetLang: string;
  targetScript?: string;
  motherTongueText: string;
  phoneticScript: string;
  literalTranslation?: string;
  registers: {
    colloquial: RegisterDetail;
    respectful: RegisterDetail;
    formal: RegisterDetail;
  };
  culturalNote: string;
  wordBreakdown: WordBreakdownItem[];
  nativeIdioms?: NativeIdiomItem[];
}

export interface SavedPhrase {
  id: string;
  sourceText: string;
  targetLang: string;
  motherTongueText: string;
  phoneticScript: string;
  selectedRegister: FormalityRegister;
  culturalNote: string;
  savedAt: string;
  tag?: string;
}

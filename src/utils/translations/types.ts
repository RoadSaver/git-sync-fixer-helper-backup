
// Translation system types inspired by Android localization patterns

export type Language = 'en' | 'bg';

export type TranslationKey = string;

export interface TranslationParams {
  [key: string]: string | number;
}

export interface PluralOptions {
  zero?: string;
  one: string;
  few?: string;
  many?: string;
  other: string;
}

export interface TranslationValue {
  text: string;
  plural?: PluralOptions;
  context?: {
    [contextKey: string]: string;
  };
}

export interface TranslationSection {
  [key: string]: string | TranslationValue | TranslationSection;
}

export interface LanguageResources {
  [language: string]: TranslationSection;
}

export interface TranslationConfig {
  defaultLanguage: Language;
  fallbackLanguage: Language;
  interpolationPattern?: RegExp;
  missingKeyHandler?: (key: string, language: Language) => string;
  debugMode?: boolean;
}

export interface TranslationContext {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: TranslationParams, context?: string) => string;
  tPlural: (key: string, count: number, params?: TranslationParams) => string;
  hasKey: (key: string) => boolean;
  getAvailableLanguages: () => Language[];
}

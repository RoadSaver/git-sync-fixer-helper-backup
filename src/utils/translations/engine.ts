
import { 
  Language, 
  TranslationParams, 
  TranslationValue, 
  TranslationSection, 
  LanguageResources, 
  TranslationConfig,
  PluralOptions 
} from './types';

export class TranslationEngine {
  private resources: LanguageResources = {};
  private config: TranslationConfig;
  private currentLanguage: Language;

  constructor(config: TranslationConfig) {
    this.config = {
      interpolationPattern: /\{\{(\w+)\}\}/g,
      missingKeyHandler: (key: string, language: Language) => 
        this.config.debugMode ? `[MISSING: ${key}]` : key,
      ...config
    };
    this.currentLanguage = config.defaultLanguage;
  }

  public loadResources(resources: LanguageResources): void {
    this.resources = { ...this.resources, ...resources };
  }

  public setLanguage(language: Language): void {
    if (this.resources[language]) {
      this.currentLanguage = language;
    } else {
      console.warn(`Language ${language} not found, falling back to ${this.config.fallbackLanguage}`);
      this.currentLanguage = this.config.fallbackLanguage;
    }
  }

  public getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  public translate(
    key: string, 
    params?: TranslationParams, 
    context?: string
  ): string {
    const translation = this.getTranslation(key, this.currentLanguage);
    
    if (!translation) {
      const fallbackTranslation = this.getTranslation(key, this.config.fallbackLanguage);
      if (!fallbackTranslation) {
        return this.config.missingKeyHandler?.(key, this.currentLanguage) || key;
      }
      return this.processTranslation(fallbackTranslation, params, context);
    }

    return this.processTranslation(translation, params, context);
  }

  public translatePlural(
    key: string, 
    count: number, 
    params?: TranslationParams
  ): string {
    const translation = this.getTranslation(key, this.currentLanguage);
    
    if (!translation || typeof translation === 'string') {
      return this.translate(key, { ...params, count });
    }

    const pluralForm = this.getPluralForm(count, translation.plural);
    if (!pluralForm) {
      return this.translate(key, { ...params, count });
    }

    return this.interpolate(pluralForm, { ...params, count });
  }

  public hasTranslation(key: string): boolean {
    return !!this.getTranslation(key, this.currentLanguage) || 
           !!this.getTranslation(key, this.config.fallbackLanguage);
  }

  public getAvailableLanguages(): Language[] {
    return Object.keys(this.resources) as Language[];
  }

  private getTranslation(key: string, language: Language): string | TranslationValue | undefined {
    const resource = this.resources[language];
    if (!resource) return undefined;

    return this.getNestedValue(resource, key);
  }

  private getNestedValue(obj: TranslationSection, path: string): string | TranslationValue | undefined {
    const keys = path.split('.');
    let current: any = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  private processTranslation(
    translation: string | TranslationValue, 
    params?: TranslationParams, 
    context?: string
  ): string {
    let text: string;

    if (typeof translation === 'string') {
      text = translation;
    } else {
      if (context && translation.context && translation.context[context]) {
        text = translation.context[context];
      } else {
        text = translation.text;
      }
    }

    return this.interpolate(text, params);
  }

  private interpolate(text: string, params?: TranslationParams): string {
    if (!params) return text;

    return text.replace(this.config.interpolationPattern, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }

  private getPluralForm(count: number, pluralOptions?: PluralOptions): string | undefined {
    if (!pluralOptions) return undefined;

    // Simple English pluralization rules
    if (this.currentLanguage === 'en') {
      if (count === 0 && pluralOptions.zero) return pluralOptions.zero;
      if (count === 1) return pluralOptions.one;
      return pluralOptions.other;
    }

    // Bulgarian pluralization rules
    if (this.currentLanguage === 'bg') {
      if (count === 0 && pluralOptions.zero) return pluralOptions.zero;
      if (count === 1) return pluralOptions.one;
      if (count >= 2 && count <= 4 && pluralOptions.few) return pluralOptions.few;
      return pluralOptions.other;
    }

    return pluralOptions.other;
  }
}

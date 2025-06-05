
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DatabaseTranslationEngine } from './databaseEngine';
import { Language, TranslationContext, TranslationParams } from './types';

const databaseEngine = new DatabaseTranslationEngine();

const TranslationContextInstance = createContext<TranslationContext | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ 
  children, 
  initialLanguage = 'en' 
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(initialLanguage);
  const [isLoading, setIsLoading] = useState(true);
  const [updateCounter, setUpdateCounter] = useState(0);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      await databaseEngine.loadTranslations();
      setIsLoading(false);
    };
    loadTranslations();

    // Force re-render every 2 seconds to catch any translation updates
    const interval = setInterval(() => {
      setUpdateCounter(prev => prev + 1);
    }, 2000);

    return () => {
      clearInterval(interval);
      databaseEngine.cleanup();
    };
  }, []);

  useEffect(() => {
    databaseEngine.setLanguage(currentLanguage);
  }, [currentLanguage]);

  const t = (key: string, params?: TranslationParams, context?: string): string => {
    return databaseEngine.translate(key, params);
  };

  const tPlural = (key: string, count: number, params?: TranslationParams): string => {
    // For now, use simple pluralization
    return databaseEngine.translate(key, { ...params, count });
  };

  const hasKey = (key: string): boolean => {
    return databaseEngine.hasTranslation(key);
  };

  const getAvailableLanguages = (): Language[] => {
    return databaseEngine.getAvailableLanguages();
  };

  const contextValue: TranslationContext = {
    currentLanguage,
    setLanguage: setCurrentLanguage,
    t,
    tPlural,
    hasKey,
    getAvailableLanguages
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading translations...</div>
      </div>
    );
  }

  return (
    <TranslationContextInstance.Provider value={contextValue}>
      {children}
    </TranslationContextInstance.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContextInstance);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

// Backward compatibility hook
export const useTranslationCompat = (language: Language) => {
  const { setLanguage, t } = useTranslation();
  useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);
  return (key: string, params?: TranslationParams) => t(key, params);
};

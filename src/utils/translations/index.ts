import { authGeneralTranslations } from './authGeneral';
import { authUsernameTranslations } from './authUsername';
import { authEmailTranslations } from './authEmail';
import { authPassword } from './authPassword';
import { authPhoneTranslations } from './authPhone';
import { authGenderTranslations } from './authGender';
import { authRegisterTranslations } from './authRegister';
import { authLoginTranslations } from './authLogin';
import { authSecretQuestions } from './authSecretQuestions';
import { generalTranslations } from './general';
import { uiTranslations } from './ui';
import { serviceTranslations } from './service';
import { emergencyTranslations } from './emergency';
import { settings } from './settings';
import { status } from './status';
import { themeTranslations } from './theme';

const mergeTranslations = (...translationObjects: any[]) => {
  const merged = { en: {}, bg: {} };
  translationObjects.forEach(obj => {
    // Support both {en: {...}, bg: {...}} and {key: {en: '', bg: ''}}
    if (obj.en && obj.bg) {
      Object.assign(merged.en, obj.en);
      Object.assign(merged.bg, obj.bg);
    } else {
      Object.entries(obj).forEach(([key, value]: [string, any]) => {
        if (value.en && value.bg) {
          merged.en[key] = value.en;
          merged.bg[key] = value.bg;
        }
      });
    }
  });
  return merged;
};

const translations = mergeTranslations(
  authGeneralTranslations,
  authUsernameTranslations,
  authEmailTranslations,
  authPassword,
  authPhoneTranslations,
  authGenderTranslations,
  authRegisterTranslations,
  authLoginTranslations,
  authSecretQuestions,
  generalTranslations,
  uiTranslations,
  serviceTranslations,
  emergencyTranslations,
  settings,
  status,
  themeTranslations
);

// Split translations into two groups: one for English, one for Bulgarian
export const enTranslations = Object.fromEntries(
  Object.entries(translations.en)
);

export const bgTranslations = Object.fromEntries(
  Object.entries(translations.bg)
);

export const useTranslation = (language: 'en' | 'bg') => {
  return (key: string): string => {
    if (language === 'en') return String(enTranslations[key] ?? key);
    if (language === 'bg') return String(bgTranslations[key] ?? key);
    return key;
  };
};

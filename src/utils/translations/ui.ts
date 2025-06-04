interface TranslationEntry {
  en: string;
  bg: string;
}

interface TranslationGroup {
  [key: string]: TranslationEntry;
}

// UI elements and buttons translations
export const uiTranslations: TranslationGroup = {
  'cancel': {
    en: 'Cancel.',
    bg: 'Отказ'
  },
  'submit': {
    en: 'Submit.',
    bg: 'Изпращане'
  },
  'close': {
    en: 'Close.',
    bg: 'Затвори'
  },
  'send': {
    en: 'Send.',
    bg: 'Изпрати'
  },
  'accept': {
    en: 'Accept.',
    bg: 'Приеми'
  },
  'decline': {
    en: 'Decline.',
    bg: 'Откажи'
  },
  'error': {
    en: 'Error.',
    bg: 'Грешка'
  },
  'please-fill-fields': {
    en: 'Please fill in all fields.',
    bg: 'Моля, попълнете всички полета'
  },
  'valid-email': {
    en: 'Please enter a valid email address.',
    bg: 'Моля, въведете валиден имейл адрес'
  },
  'password-error': {
    en: 'Password error.',
    bg: 'Грешка в паролата'
  },
  'passwords-no-match': {
    en: 'Passwords do not match.',
    bg: 'Паролите не съвпадат'
  },
  'alert': {
    en: 'Alert.',
    bg: 'Предупреждение'
  },
  'alert-title': {
    en: 'Alert title.',
    bg: 'Заглавие на предупреждение'
  },
  'alert-description': {
    en: 'Alert description.',
    bg: 'Описание на предупреждение'
  },
  'confirm-cancellation-title': {
    en: 'Cancel request?',
    bg: 'Отказ на заявката?'
  },
  'confirm-cancellation-desc': {
    en: 'Are you sure you want to cancel your service request?',
    bg: 'Сигурни ли сте, че искате да отмените заявката си за услуга?'
  },
  'no': {
    en: 'No.',
    bg: 'Не'
  },
  'yes-cancel': {
    en: 'Yes, cancel.',
    bg: 'Да, отмени'
  },
};

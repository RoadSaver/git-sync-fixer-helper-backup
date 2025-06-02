
interface TranslationEntry {
  en: string;
  bg: string;
}

interface TranslationGroup {
  [key: string]: TranslationEntry;
}

export const authPasswordTranslations: TranslationGroup = {
  'password': {
    en: 'Password',
    bg: 'Парола'
  },
  'confirm-password': {
    en: 'Confirm Password',
    bg: 'Потвърдете паролата'
  },
  'enter-password': {
    en: 'Enter your password',
    bg: 'Въведете вашата парола'
  },
  'password-requirements': {
    en: 'Must be at least 8 characters with uppercase, lowercase, numbers, and special characters',
    bg: 'Трябва да е поне 8 символа с главни, малки букви, цифри и специални символи'
  },
  'password-info-title': {
    en: 'Password Requirements',
    bg: 'Изисквания за парола'
  },
  'password-info-content': {
    en: 'Passwords must contain:\n1. A minimum of 1 upper case letter [A-Z] and\n2. A minimum of 1 lower case letter [a-z] and\n3. A minimum of 1 numeric character [0-9] and\n4. A minimum of 1 special character: ~`!@#$%^&*()-_+={}[]|\\;:"<>,./?',
    bg: 'Паролите трябва да съдържат:\n1. Минимум 1 главна буква [A-Z] и\n2. Минимум 1 малка буква [a-z] и\n3. Минимум 1 цифра [0-9] и\n4. Минимум 1 специален символ: ~`!@#$%^&*()-_+={}[]|\\;:"<>,./?'
  },
  'create-password-placeholder': {
    en: 'Create a password',
    bg: 'Създайте парола'
  },
  'confirm-password-placeholder': {
    en: 'Confirm your password',
    bg: 'Потвърдете вашата парола'
  },
  'password-error-title': {
    en: 'Password Error',
    bg: 'Грешка в паролата'
  },
  'password-length-error': {
    en: 'Password must be at least 8 characters long',
    bg: 'Паролата трябва да е поне 8 символа'
  },
  'password-uppercase-error': {
    en: 'Password must contain at least one uppercase letter',
    bg: 'Паролата трябва да съдържа поне една главна буква'
  },
  'passwords-do-not-match': {
    en: 'Passwords do not match',
    bg: 'Паролите не съвпадат'
  },
  'password-valid': {
    en: 'Password is strong',
    bg: 'Паролата е силна'
  },
  'confirm-password-valid': {
    en: 'Passwords match',
    bg: 'Паролите съвпадат'
  },
  'change-password-colon': {
    en: 'Change password:',
    bg: 'Промяна на парола:'
  },
  'current-password-prompt-title': {
    en: 'Confirm Change',
    bg: 'Потвърди промяната'
  },
  'current-password-prompt-desc': {
    en: 'Please enter your current password to save changes.',
    bg: 'Моля, въведете текущата си парола, за да запазите промените.'
  },
  'enter-current-password': {
    en: 'Enter current password',
    bg: 'Въведете текуща парола'
  },
  'incorrect-password-error': {
    en: 'Incorrect password',
    bg: 'Грешна парола'
  },
  'password-update-success': {
    en: 'Password updated successfully.',
    bg: 'Паролата е актуализирана успешно.'
  },
  'new-password-placeholder': {
    en: 'New password',
    bg: 'Нова парола'
  },
  'show-password': {
    en: 'Show password',
    bg: 'Покажи паролата'
  },
  'hide-password': {
    en: 'Hide password',
    bg: 'Скрий паролата'
  }
};

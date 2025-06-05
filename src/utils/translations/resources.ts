
import { LanguageResources } from './types';

export const translationResources: LanguageResources = {
  en: {
    // Authentication
    auth: {
      subtitle: 'Your roadside assistance companion',
      login: {
        title: 'Sign in to your account',
        button: 'Login',
        loading: 'Logging in...',
        noAccount: "Don't have an account?",
        createAccount: 'Create one',
        success: 'Login Successful',
        welcome: 'Welcome to RoadSaver!'
      },
      register: {
        title: 'Create Account',
        description: 'Sign up for RoadSaver',
        button: 'Register',
        loading: 'Registering...',
        hasAccount: 'Already have an account?',
        signIn: 'Sign in',
        backToLogin: 'Back to Login',
        success: 'Registration Successful',
        welcome: 'Your account has been created. Welcome to RoadSaver!'
      },
      fields: {
        username: {
          label: 'Username',
          placeholder: 'Enter your username',
          required: 'Username is required'
        },
        email: {
          label: 'Email',
          placeholder: 'Enter your email address',
          required: 'Email is required',
          invalid: 'Please enter a valid email address'
        },
        password: {
          label: 'Password',
          placeholder: 'Enter your password',
          required: 'Password is required'
        },
        phone: {
          label: 'Phone Number',
          placeholder: 'Enter your phone number',
          required: 'Phone number is required'
        },
        gender: {
          label: 'Gender',
          male: 'Male',
          female: 'Female',
          other: 'Other',
          preferNotToSay: 'Prefer not to say'
        }
      }
    },
    
    // Services
    services: {
      title: 'Services',
      flatTyre: {
        title: 'Flat Tyre',
        description: 'Tyre puncture or damage'
      },
      outOfFuel: {
        title: 'Out of Fuel',
        description: 'Empty fuel tank'
      },
      carBattery: {
        title: 'Car Battery',
        description: 'Dead or damaged battery'
      },
      otherCarProblems: {
        title: 'Other Car Problems',
        description: 'Engine, electrical or other issues'
      },
      towTruck: {
        title: 'Tow Truck',
        description: 'Vehicle towing service'
      },
      emergency: {
        title: 'Emergency',
        description: 'Emergency roadside assistance'
      },
      support: {
        title: 'Support',
        description: 'Contact customer support'
      }
    },
    
    // Portal
    portal: {
      subtitle: 'Choose your access portal',
      user: {
        title: 'User App',
        description: 'For customers needing assistance',
        action: 'Open User App'
      },
      employee: {
        title: 'Employee App',
        description: 'For service providers',
        action: 'Open Employee App'
      }
    },
    
    // Settings
    settings: {
      title: 'Settings',
      description: 'Configure your app preferences',
      tabs: {
        account: 'Account',
        history: 'History',
        payment: 'Payment',
        about: 'About'
      },
      logout: 'Logout',
      loggedOut: 'Logged Out',
      loggedOutMsg: 'You have been successfully logged out'
    },
    
    // Emergency
    emergency: {
      title: 'Emergency Services',
      callPolice: 'Call Police',
      callAmbulance: 'Call Ambulance',
      callFireDepartment: 'Call Fire Department'
    },
    
    // UI Actions
    ui: {
      actions: {
        cancel: 'Cancel',
        close: 'Close',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        submit: 'Submit'
      },
      status: {
        pending: 'Pending',
        accepted: 'Accepted',
        declined: 'Declined',
        completed: 'Completed'
      }
    },
    
    // Location
    location: {
      accessDenied: 'Location Access Denied',
      accessMessage: 'Using default location (Sofia, Bulgaria)',
      updated: 'Location Updated',
      updatedMsg: 'Your location has been successfully updated'
    },
    
    // Language
    language: {
      switchToBulgarian: 'Switch to Bulgarian',
      switchToEnglish: 'Switch to English'
    },
    
    // Theme
    theme: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      mode: 'Theme Mode'
    },
    
    // App
    app: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information'
    }
  },
  
  bg: {
    // Authentication
    auth: {
      subtitle: 'Вашият спътник за пътна помощ',
      login: {
        title: 'Влезте в акаунта си',
        button: 'Влизане',
        loading: 'Влизане...',
        noAccount: 'Нямате акаунт?',
        createAccount: 'Създайте един',
        success: 'Успешно влизане',
        welcome: 'Добре дошли в RoadSaver!'
      },
      register: {
        title: 'Създайте акаунт',
        description: 'Регистрирайте се в RoadSaver',
        button: 'Регистрация',
        loading: 'Регистриране...',
        hasAccount: 'Вече имате акаунт?',
        signIn: 'Влезте',
        backToLogin: 'Обратно към влизане',
        success: 'Успешна регистрация',
        welcome: 'Вашият акаунт е създаден. Добре дошли в RoadSaver!'
      },
      fields: {
        username: {
          label: 'Потребителско име',
          placeholder: 'Въведете потребителското си име',
          required: 'Потребителското име е задължително'
        },
        email: {
          label: 'Имейл',
          placeholder: 'Въведете вашия имейл адрес',
          required: 'Имейлът е задължителен',
          invalid: 'Моля, въведете валиден имейл адрес'
        },
        password: {
          label: 'Парола',
          placeholder: 'Въведете вашата парола',
          required: 'Паролата е задължителна'
        },
        phone: {
          label: 'Телефонен номер',
          placeholder: 'Въведете вашия телефонен номер',
          required: 'Телефонният номер е задължителен'
        },
        gender: {
          label: 'Пол',
          male: 'Мъж',
          female: 'Жена',
          other: 'Друго',
          preferNotToSay: 'Предпочитам да не казвам'
        }
      }
    },
    
    // Services
    services: {
      title: 'Услуги',
      flatTyre: {
        title: 'Спукана гума',
        description: 'Пробив или повреда на гума'
      },
      outOfFuel: {
        title: 'Свършило гориво',
        description: 'Празен резервоар за гориво'
      },
      carBattery: {
        title: 'Автомобилна батерия',
        description: 'Изтощена или повредена батерия'
      },
      otherCarProblems: {
        title: 'Други проблеми с колата',
        description: 'Проблеми с двигателя, електричеството или други'
      },
      towTruck: {
        title: 'Репатриране',
        description: 'Услуга за репатриране на превозно средство'
      },
      emergency: {
        title: 'Спешност',
        description: 'Спешна пътна помощ'
      },
      support: {
        title: 'Поддръжка',
        description: 'Свържете се с клиентска поддръжка'
      }
    },
    
    // Portal
    portal: {
      subtitle: 'Изберете вашия портал за достъп',
      user: {
        title: 'Потребителско приложение',
        description: 'За клиенти, нуждаещи се от помощ',
        action: 'Отвори потребителското приложение'
      },
      employee: {
        title: 'Служебно приложение',
        description: 'За доставчици на услуги',
        action: 'Отвори служебното приложение'
      }
    },
    
    // Settings
    settings: {
      title: 'Настройки',
      description: 'Конфигурирайте предпочитанията на приложението',
      tabs: {
        account: 'Акаунт',
        history: 'История',
        payment: 'Плащане',
        about: 'За нас'
      },
      logout: 'Излизане',
      loggedOut: 'Излязохте',
      loggedOutMsg: 'Успешно излязохте от системата'
    },
    
    // Emergency
    emergency: {
      title: 'Спешни услуги',
      callPolice: 'Обади се на полицията',
      callAmbulance: 'Обади се на линейка',
      callFireDepartment: 'Обади се на пожарната'
    },
    
    // UI Actions
    ui: {
      actions: {
        cancel: 'Отказ',
        close: 'Затвори',
        save: 'Запази',
        edit: 'Редактирай',
        delete: 'Изтрий',
        confirm: 'Потвърди',
        back: 'Назад',
        next: 'Напред',
        submit: 'Изпрати'
      },
      status: {
        pending: 'Чакащ',
        accepted: 'Приет',
        declined: 'Отказан',
        completed: 'Завършен'
      }
    },
    
    // Location
    location: {
      accessDenied: 'Достъпът до местоположението е отказан',
      accessMessage: 'Използва се местоположение по подразбиране (София, България)',
      updated: 'Местоположението е актуализирано',
      updatedMsg: 'Вашето местоположение беше успешно актуализирано'
    },
    
    // Language
    language: {
      switchToBulgarian: 'Превключи на български',
      switchToEnglish: 'Превключи на английски'
    },
    
    // Theme
    theme: {
      light: 'Светла',
      dark: 'Тъмна',
      system: 'Системна',
      mode: 'Режим на темата'
    },
    
    // App
    app: {
      loading: 'Зареждане...',
      error: 'Грешка',
      success: 'Успех',
      warning: 'Предупреждение',
      info: 'Информация'
    }
  }
};

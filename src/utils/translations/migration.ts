
/**
 * Migration helper for transitioning from old translation keys to new nested structure
 * This maps old flat keys to new nested keys
 */

export const keyMigrationMap: { [oldKey: string]: string } = {
  // Auth related
  'sign-in-account': 'auth.login.title',
  'login': 'auth.login.button',
  'logging-in': 'auth.login.loading',
  'dont-have-account': 'auth.login.noAccount',
  'create-one': 'auth.login.createAccount',
  'login-successful': 'auth.login.success',
  'welcome-to-roadsaver': 'auth.login.welcome',
  
  'create-account': 'auth.register.title',
  'create-account-desc': 'auth.register.description',
  'register': 'auth.register.button',
  'registering': 'auth.register.loading',
  'already-have-account': 'auth.register.hasAccount',
  'sign-in': 'auth.register.signIn',
  'back-to-login': 'auth.register.backToLogin',
  'registration-successful': 'auth.register.success',
  'account-created-welcome': 'auth.register.welcome',

  // Fields
  'username': 'auth.fields.username.label',
  'username-placeholder': 'auth.fields.username.placeholder',
  'username-required': 'auth.fields.username.required',
  
  'email': 'auth.fields.email.label',
  'email-placeholder': 'auth.fields.email.placeholder',
  'email-required': 'auth.fields.email.required',
  'email-invalid': 'auth.fields.email.invalid',
  
  'password': 'auth.fields.password.label',
  'password-placeholder': 'auth.fields.password.placeholder',
  'password-required': 'auth.fields.password.required',
  
  'phone-number': 'auth.fields.phone.label',
  'phone-placeholder': 'auth.fields.phone.placeholder',
  'phone-required': 'auth.fields.phone.required',
  
  'gender': 'auth.fields.gender.label',
  'male': 'auth.fields.gender.male',
  'female': 'auth.fields.gender.female',
  'other': 'auth.fields.gender.other',
  'prefer-not-to-say': 'auth.fields.gender.preferNotToSay',

  // Services
  'flat-tyre': 'services.flatTyre.title',
  'flat-tyre-desc': 'services.flatTyre.description',
  'out-of-fuel': 'services.outOfFuel.title',
  'out-of-fuel-desc': 'services.outOfFuel.description',
  'car-battery': 'services.carBattery.title',
  'car-battery-desc': 'services.carBattery.description',
  'other-car-problems': 'services.otherCarProblems.title',
  'other-car-problems-desc': 'services.otherCarProblems.description',
  'tow-truck': 'services.towTruck.title',
  'tow-truck-desc': 'services.towTruck.description',
  'emergency': 'services.emergency.title',
  'emergency-desc': 'services.emergency.description',
  'support': 'services.support.title',
  'support-desc': 'services.support.description',

  // Portal
  'app-subtitle': 'portal.subtitle',
  'user-app': 'portal.user.title',
  'employee-app': 'portal.employee.title',
  'for-customers': 'portal.user.description',
  'for-service-providers': 'portal.employee.description',
  'open-user-app': 'portal.user.action',
  'open-employee-app': 'portal.employee.action',

  // Settings
  'settings': 'settings.title',
  'configure-preferences': 'settings.description',
  'account': 'settings.tabs.account',
  'history': 'settings.tabs.history',
  'about': 'settings.tabs.about',
  'logout': 'settings.logout',
  'logged-out': 'settings.loggedOut',
  'logged-out-msg': 'settings.loggedOutMsg',

  // Emergency
  'emergency-services': 'emergency.title',
  'call-police': 'emergency.callPolice',
  'call-ambulance': 'emergency.callAmbulance',
  'call-fire-department': 'emergency.callFireDepartment',

  // UI Actions
  'cancel': 'ui.actions.cancel',
  'close': 'ui.actions.close',
  'save': 'ui.actions.save',
  'edit': 'ui.actions.edit',
  'delete': 'ui.actions.delete',
  'confirm': 'ui.actions.confirm',
  'back': 'ui.actions.back',
  'next': 'ui.actions.next',
  'submit': 'ui.actions.submit',
  'loading': 'app.loading',
  'error': 'app.error',
  'success': 'app.success',
  'warning': 'app.warning',
  'info': 'app.info',

  // Status
  'pending': 'ui.status.pending',
  'accepted': 'ui.status.accepted',
  'declined': 'ui.status.declined',
  'completed': 'ui.status.completed',

  // Location
  'location-access-denied': 'location.accessDenied',
  'location-access-message': 'location.accessMessage',
  'location-updated': 'location.updated',
  'location-updated-msg': 'location.updatedMsg',

  // Language
  'switch-to-bulgarian': 'language.switchToBulgarian',
  'switch-to-english': 'language.switchToEnglish',

  // Theme
  'light': 'theme.light',
  'dark': 'theme.dark',
  'system': 'theme.system',
  'theme-mode': 'theme.mode'
};

/**
 * Helper function to migrate old translation keys to new ones
 */
export function migrateTranslationKey(oldKey: string): string {
  return keyMigrationMap[oldKey] || oldKey;
}

/**
 * Backward compatibility translation function
 * This allows old code to work while we migrate to the new system
 */
export function createCompatibilityTranslation(engine: any) {
  return (key: string, params?: any) => {
    // Try the new key structure first
    let translation = engine.translate(key, params);
    
    // If not found, try migrating the old key
    if (translation === key) {
      const newKey = migrateTranslationKey(key);
      translation = engine.translate(newKey, params);
    }
    
    return translation;
  };
}

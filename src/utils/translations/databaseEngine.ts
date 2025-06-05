import { supabase } from '@/integrations/supabase/client';
import { Language, TranslationParams } from './types';

interface DatabaseTranslation {
  key: string;
  english_text: string;
  bulgarian_text: string;
  category?: string;
  context?: string;
}

export class DatabaseTranslationEngine {
  private translations: Map<string, DatabaseTranslation> = new Map();
  private currentLanguage: Language = 'en';
  private isLoaded = false;
  private realtimeChannel: any = null;

  async loadTranslations(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*');

      if (error) {
        console.error('Error loading translations:', error);
        return;
      }

      if (data) {
        this.translations.clear();
        data.forEach(translation => {
          this.translations.set(translation.key, translation);
        });
        this.isLoaded = true;
        this.setupRealtimeUpdates();
        
        // Add missing translations if not enough exist
        await this.ensureRequiredTranslations();
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }

  private async ensureRequiredTranslations(): Promise<void> {
    // Required translations that should exist
    const requiredTranslations = [
      { key: 'portal.subtitle', english_text: 'Choose your access portal', bulgarian_text: 'Изберете вашия портал за достъп' },
      { key: 'portal.user.title', english_text: 'User App', bulgarian_text: 'Потребителско приложение' },
      { key: 'portal.user.description', english_text: 'For customers needing assistance', bulgarian_text: 'За клиенти, нуждаещи се от помощ' },
      { key: 'portal.user.action', english_text: 'Open User App', bulgarian_text: 'Отвори потребителското приложение' },
      { key: 'portal.employee.title', english_text: 'Employee App', bulgarian_text: 'Служебно приложение' },
      { key: 'portal.employee.description', english_text: 'For service providers', bulgarian_text: 'За доставчици на услуги' },
      { key: 'portal.employee.action', english_text: 'Open Employee App', bulgarian_text: 'Отвори служебното приложение' },
      { key: 'admin.title', english_text: 'Admin Panel', bulgarian_text: 'Админ панел' },
      { key: 'admin.description', english_text: 'Manage your RoadSaver platform', bulgarian_text: 'Управлявайте вашата RoadSaver платформа' },
      { key: 'admin.action', english_text: 'Open Admin Panel', bulgarian_text: 'Отвори Админ панел' },
      { key: 'auth.login.title', english_text: 'Sign in to your account', bulgarian_text: 'Влезте в акаунта си' },
      { key: 'auth.login.button', english_text: 'Login', bulgarian_text: 'Влизане' },
      { key: 'auth.register.title', english_text: 'Create Account', bulgarian_text: 'Създайте акаунт' },
      { key: 'auth.register.button', english_text: 'Register', bulgarian_text: 'Регистрация' },
      { key: 'auth.fields.username.label', english_text: 'Username', bulgarian_text: 'Потребителско име' },
      { key: 'auth.fields.email.label', english_text: 'Email', bulgarian_text: 'Имейл' },
      { key: 'auth.fields.password.label', english_text: 'Password', bulgarian_text: 'Парола' },
      { key: 'settings.title', english_text: 'Settings', bulgarian_text: 'Настройки' },
      { key: 'settings.tabs.account', english_text: 'Account', bulgarian_text: 'Акаунт' },
      { key: 'settings.tabs.history', english_text: 'History', bulgarian_text: 'История' },
      { key: 'settings.tabs.payment', english_text: 'Payment', bulgarian_text: 'Плащане' },
      { key: 'settings.tabs.about', english_text: 'About', bulgarian_text: 'За нас' },
      { key: 'change-account-info', english_text: 'Change Account Info', bulgarian_text: 'Промяна на информацията за акаунта' },
      { key: 'cancel', english_text: 'Cancel', bulgarian_text: 'Отказ' },
      { key: 'username', english_text: 'Username', bulgarian_text: 'Потребителско име' },
      { key: 'email', english_text: 'Email', bulgarian_text: 'Имейл' }
    ];

    const missingTranslations = requiredTranslations.filter(
      translation => !this.translations.has(translation.key)
    );

    if (missingTranslations.length > 0) {
      try {
        const { error } = await supabase
          .from('translations')
          .insert(missingTranslations);
        
        if (!error) {
          // Reload translations to include the new ones
          await this.loadTranslations();
        }
      } catch (error) {
        console.error('Failed to add missing translations:', error);
      }
    }
  }

  private setupRealtimeUpdates(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
    }

    this.realtimeChannel = supabase
      .channel('translations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translations'
        },
        (payload) => {
          console.log('Translation updated:', payload);
          this.handleRealtimeUpdate(payload);
        }
      )
      .subscribe();
  }

  private handleRealtimeUpdate(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        if (newRecord) {
          this.translations.set(newRecord.key, newRecord);
        }
        break;
      case 'DELETE':
        if (oldRecord) {
          this.translations.delete(oldRecord.key);
        }
        break;
    }
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  translate(key: string, params?: TranslationParams): string {
    if (!this.isLoaded) {
      // Return a more user-friendly fallback if translations aren't loaded yet
      return this.getKeyFallback(key);
    }

    const translation = this.translations.get(key);
    
    if (!translation) {
      // Fallback to a more user-friendly version of the key
      return this.getKeyFallback(key);
    }

    let text = this.currentLanguage === 'bg' ? translation.bulgarian_text : translation.english_text;

    // Handle parameter interpolation
    if (params) {
      Object.keys(params).forEach(paramKey => {
        const value = params[paramKey];
        text = text.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(value));
      });
    }

    return text;
  }

  private getKeyFallback(key: string): string {
    // Convert translation keys to more readable format
    if (key.includes('.')) {
      const parts = key.split('.');
      const lastPart = parts[parts.length - 1];
      // Convert camelCase or kebab-case to title case
      return lastPart
        .replace(/([A-Z])/g, ' $1')
        .replace(/[-_]/g, ' ')
        .replace(/^\w/, c => c.toUpperCase())
        .trim();
    }
    
    // Handle single word keys
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[-_]/g, ' ')
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  }

  hasTranslation(key: string): boolean {
    return this.translations.has(key);
  }

  getAvailableLanguages(): Language[] {
    return ['en', 'bg'];
  }

  cleanup(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }
}

import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React, { StrictMode } from 'react';

import {
  APP_INIT_ERROR, APP_READY, initialize, mergeConfig, subscribe,
} from '@edx/frontend-platform';
import { configure as configureI18n } from '@edx/frontend-platform/i18n';
import { ErrorPage } from '@edx/frontend-platform/react';
import { createRoot } from 'react-dom/client';

import configuration from './config';
import messages from './i18n';
import MainApp from './MainApp';
import { getPreferredLanguage, getPreferredLanguageReadOnly } from './utils/cookies';

// Нормализация локали к поддерживаемым ключам сообщений
const normalizeLocale = (rawLocale) => {
  if (!rawLocale) { return 'en'; }
  const lc = String(rawLocale).replace('_', '-').toLowerCase();
  // алиасы и сокращения → поддерживаемые ключи
  if (lc === 'kk' || lc === 'kk-kz' || lc === 'kk-kz'.toLowerCase()) { return 'kk-kz'; }
  if (lc === 'ru' || lc.startsWith('ru-')) { return 'ru'; }
  if (lc === 'en' || lc.startsWith('en-')) { return 'en'; }
  return ['en', 'ru', 'kk-kz'].includes(lc) ? lc : 'en';
};

// Функция для конфигурации i18n
const configureAppI18n = (locale) => {
  const finalLocale = normalizeLocale(locale);
  console.log('=== Configuring i18n ===');
  console.log('Current URL:', window.location.href);
  console.log('Final locale for i18n configuration:', finalLocale);
  
  configureI18n({
    config: {
      ENVIRONMENT: process.env.NODE_ENV,
      LANGUAGE_PREFERENCE_COOKIE_NAME: 'openedx-language-preference',
    },
    loggingService: {
      logError: console.error,
      logInfo: console.log,
    },
    messages,
    locale: finalLocale,
  });
};

subscribe(APP_READY, () => {
  // Настройка i18n после готовности приложения
  console.log('=== APP_READY: Initial i18n setup ===');
  
  const supportedLocales = ['en', 'ru', 'kk-kz'];
  const locale = normalizeLocale(getPreferredLanguage(supportedLocales));
  
  // Настраиваем i18n
  configureAppI18n(locale);

  const root = createRoot(document.getElementById('root'));

  root.render(
    <StrictMode>
      <MainApp />
    </StrictMode>,
  );
  
  // Слушатель для изменений языка через кастомные события
  const handleLanguageChange = (event) => {
    const newLocale = normalizeLocale(event.detail.locale);
    console.log('=== Language change event received ===');
    console.log('New locale:', newLocale);
    
    // Перенастраиваем i18n с новым языком
    configureAppI18n(newLocale);
  };
  
  // Добавляем слушатель кастомного события
  window.addEventListener('languageChanged', handleLanguageChange);
  
  // Добавляем резервный механизм проверки изменения языка через cookie (только чтение!)
  let currentLocale = locale;
  const fallbackWatcher = setInterval(() => {
    const newLocale = normalizeLocale(getPreferredLanguageReadOnly(supportedLocales));
    if (newLocale !== currentLocale) {
      console.log('=== Fallback: Language change detected via cookie ===');
      console.log('Old locale:', currentLocale);
      console.log('New locale:', newLocale);
      
      configureAppI18n(newLocale);
      currentLocale = newLocale;
    }
  }, 2000); // Проверяем каждые 2 секунды как резерв
  
  // Очистка при размонтировании
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('languageChanged', handleLanguageChange);
    clearInterval(fallbackWatcher);
  });
});

subscribe(APP_INIT_ERROR, (error) => {
  const root = createRoot(document.getElementById('root'));

  root.render(
    <StrictMode>
      <ErrorPage message={error.message} />
    </StrictMode>,
  );
});

initialize({
  handlers: {
    config: () => {
      mergeConfig(configuration);
    },
  },
  messages,
});

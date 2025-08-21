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
import { getPreferredLanguage } from './utils/cookies';

subscribe(APP_READY, () => {
  // Настройка i18n после готовности приложения
  console.log('=== APP_READY: Configuring i18n ===');
  console.log('Current URL:', window.location.href);
  
  const supportedLocales = ['en', 'ru', 'kk-kz'];
  const locale = getPreferredLanguage(supportedLocales);
  
  console.log('Final locale for i18n configuration:', locale);
  
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
    locale,
  });

  const root = createRoot(document.getElementById('root'));

  root.render(
    <StrictMode>
      <MainApp />
    </StrictMode>,
  );
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

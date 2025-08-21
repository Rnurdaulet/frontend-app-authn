/**
 * Утилиты для работы с cookies
 */

import { getConfig } from '@edx/frontend-platform';

/**
 * Получить значение cookie по имени
 * @param {string} name - имя cookie
 * @returns {string|null} значение cookie или null
 */
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

/**
 * Получить корневой домен для установки cookies
 * @returns {string} домен для cookies или пустая строка для localhost
 */
export const getCookieDomain = () => {
  // Автоматическое определение домена
  const hostname = window.location.hostname;
  
  // Для localhost и IP адресов ВСЕГДА не указываем домен, даже если он настроен в конфигурации
  if (hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')) {
    return '';
  }
  
  // Используем стандартную конфигурацию OpenedX для домена cookies (если установлена)
  const configuredDomain = getConfig().SESSION_COOKIE_DOMAIN;
  
  if (configuredDomain && 
      configuredDomain !== null && 
      configuredDomain !== '' && 
      configuredDomain !== 'localhost' &&
      configuredDomain !== '127.0.0.1') {
    return `; domain=${configuredDomain}`;
  }
  
  // Специальные случаи для локальной разработки
  if (hostname.includes('local.openedx.io') || 
      hostname.includes('apps.local.openedx.io') ||
      hostname.includes('studio.local.openedx.io')) {
    const domain = `; domain=.local.openedx.io`;
    return domain;
  }
  
  // Разделяем hostname на части
  const parts = hostname.split('.');
  
  // Если меньше 2 частей, то это не полноценный домен
  if (parts.length < 2) {
    return '';
  }
  
  let domain = '';
  
  // Специальная логика для OpenedX доменов
  if (parts.length >= 3) {
    // Проверяем различные паттерны OpenedX
    for (let i = 0; i < parts.length - 1; i++) {
      if (parts[i] === 'openedx') {
        // Найден openedx в домене - берем от openedx до конца
        domain = `; domain=.${parts.slice(i).join('.')}`;
        return domain;
      }
    }
  }
  
  // Для обычных доменов берем последние 2 части (domain.tld)
  if (parts.length >= 2) {
    domain = `; domain=.${parts.slice(-2).join('.')}`;
    return domain;
  }
  
  return '';
};

/**
 * Установить cookie
 * @param {string} name - имя cookie
 * @param {string} value - значение cookie
 * @param {number} days - количество дней до истечения (по умолчанию 365)
 */
export const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  const domain = getCookieDomain();
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/${domain}; SameSite=Lax`;
};

/**
 * Удалить cookie
 * @param {string} name - имя cookie
 */
export const deleteCookie = (name) => {
  const domain = getCookieDomain();
  
  // Удаляем cookie для правильного домена
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domain};`;
  
  // Также пытаемся удалить cookie без домена (для очистки старых cookies)
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/**
 * Проверить, действительно ли cookie установлен правильно
 * @param {string} name - имя cookie
 * @param {string} expectedValue - ожидаемое значение
 * @returns {boolean} true если cookie установлен правильно
 */
export const verifyCookie = (name, expectedValue) => {
  const actualValue = getCookie(name);
  const isValid = actualValue === expectedValue;
  
  return isValid;
};

/**
 * Принудительно установить cookie с максимальной совместимостью
 * @param {string} name - имя cookie
 * @param {string} value - значение cookie
 * @param {number} days - количество дней до истечения
 */
export const forceSetCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  const expiresString = expires.toUTCString();
  
  const domain = getCookieDomain();
  
  // Устанавливаем cookie с доменом (если есть)
  if (domain) {
    document.cookie = `${name}=${value}; expires=${expiresString}; path=/${domain}; SameSite=Lax`;
  } else {
    // Для localhost устанавливаем без домена
    document.cookie = `${name}=${value}; expires=${expiresString}; path=/; SameSite=Lax`;
  }
};

/**
 * Получить предпочитаемый язык пользователя БЕЗ установки cookies (только чтение)
 * @param {string[]} supportedLocales - массив поддерживаемых локалей
 * @returns {string} код языка
 */
export const getPreferredLanguageReadOnly = (supportedLocales = ['en', 'ru', 'kk-kz']) => {
  const cookieName = 'openedx-language-preference';
  
  // 1. Проверяем cookie (ПРИОРИТЕТ - сохраненные предпочтения пользователя)
  const cookieLocale = getCookie(cookieName);
  if (cookieLocale && supportedLocales.includes(cookieLocale)) {
    return cookieLocale;
  }
  
  // 2. Проверяем URL параметр (только если нет cookie)
  const urlParams = new URLSearchParams(window.location.search);
  const urlLocale = urlParams.get('locale');
  if (urlLocale && supportedLocales.includes(urlLocale)) {
    return urlLocale;
  }
  
  // 3. Проверяем браузерный язык (только для первого визита)
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang) {
    const browserLocale = browserLang.toLowerCase();
    // Точное совпадение
    if (supportedLocales.includes(browserLocale)) {
      return browserLocale;
    }
    // Проверяем базовую локаль (например, 'ru' из 'ru-RU')
    const baseLang = browserLocale.split('-')[0];
    if (supportedLocales.includes(baseLang)) {
      return baseLang;
    }
  }
  
  // 4. По умолчанию возвращаем английский
  return 'en';
};

/**
 * Получить предпочитаемый язык пользователя с установкой cookies при необходимости
 * @param {string[]} supportedLocales - массив поддерживаемых локалей
 * @returns {string} код языка
 */
export const getPreferredLanguage = (supportedLocales = ['en', 'ru', 'kk-kz']) => {
  const cookieName = 'openedx-language-preference';
  
  // 1. Проверяем cookie (ПРИОРИТЕТ - сохраненные предпочтения пользователя)
  const cookieLocale = getCookie(cookieName);
  if (cookieLocale && supportedLocales.includes(cookieLocale)) {
    return cookieLocale;
  }
  
  // 2. Проверяем URL параметр (только если нет cookie)
  const urlParams = new URLSearchParams(window.location.search);
  const urlLocale = urlParams.get('locale');
  if (urlLocale && supportedLocales.includes(urlLocale)) {
    // Сохраняем выбор в cookie только если его не было
    forceSetCookie(cookieName, urlLocale);
    return urlLocale;
  }
  
  // 3. Проверяем браузерный язык (только для первого визита)
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang) {
    const browserLocale = browserLang.toLowerCase();
    // Точное совпадение
    if (supportedLocales.includes(browserLocale)) {
      forceSetCookie(cookieName, browserLocale);
      return browserLocale;
    }
    // Проверяем базовую локаль (например, 'ru' из 'ru-RU')
    const baseLang = browserLocale.split('-')[0];
    if (supportedLocales.includes(baseLang)) {
      forceSetCookie(cookieName, baseLang);
      return baseLang;
    }
  }
  
  // 4. По умолчанию возвращаем английский
  return 'en';
};

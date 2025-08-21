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
  // Используем стандартную конфигурацию OpenedX для домена cookies
  const configuredDomain = getConfig().SESSION_COOKIE_DOMAIN;
  
  if (configuredDomain) {
    console.log(`Cookie domain: Using configured domain - ; domain=${configuredDomain}`);
    return `; domain=${configuredDomain}`;
  }
  
  // Fallback: автоматическое определение домена для локальной разработки
  const hostname = window.location.hostname;
  
  // Для localhost не указываем домен
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    console.log('Cookie domain: localhost (no domain)');
    return '';
  }
  
  // Разделяем hostname на части
  const parts = hostname.split('.');
  
  // Если меньше 2 частей, то это не полноценный домен
  if (parts.length < 2) {
    console.log('Cookie domain: invalid hostname, no domain');
    return '';
  }
  
  let domain = '';
  
  // Для доменов вида *.openedx.domain.com возвращаем .openedx.domain.com
  if (parts.length >= 3 && parts[parts.length - 3] === 'openedx') {
    domain = `; domain=.${parts.slice(-3).join('.')}`;
    console.log(`Cookie domain: OpenedX subdomain auto-detected - ${domain}`);
    return domain;
  }
  
  // Для обычных доменов берем последние 2 части (domain.com)
  if (parts.length >= 2) {
    domain = `; domain=.${parts.slice(-2).join('.')}`;
    console.log(`Cookie domain: Standard domain auto-detected - ${domain}`);
    return domain;
  }
  
  console.log('Cookie domain: fallback, no domain');
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
 * Очистить дублирующие cookies языковых предпочтений
 * Удаляет старые cookies с неправильными доменами
 */
export const cleanupDuplicateCookies = () => {
  const cookieName = 'openedx-language-preference';
  const currentValue = getCookie(cookieName);
  
  if (currentValue) {
    console.log('Cleaning up duplicate cookies, preserving value:', currentValue);
    
    // Удаляем текущий cookie через стандартную функцию
    deleteCookie(cookieName);
    
    // Дополнительная очистка: удаляем возможные старые cookies с различными доменами
    const hostname = window.location.hostname;
    const possibleDomains = [];
    
    if (hostname.includes('.')) {
      const parts = hostname.split('.');
      
      // Добавляем возможные варианты доменов для очистки старых cookies
      if (parts.length >= 2) {
        possibleDomains.push(`.${parts.slice(-2).join('.')}`); // .domain.tld
      }
      if (parts.length >= 3) {
        possibleDomains.push(`.${parts.slice(-3).join('.')}`); // .subdomain.domain.tld
      }
      if (parts.length >= 4) {
        possibleDomains.push(`.${parts.slice(-4).join('.')}`); // .sub.subdomain.domain.tld
      }
      
      // Также пытаемся удалить cookie для конкретного хоста
      possibleDomains.push(hostname);
    }
    
    // Удаляем cookies для всех возможных доменов
    possibleDomains.forEach(domain => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      console.log(`Attempting to delete cookie for domain: ${domain}`);
    });
    
    // Устанавливаем правильный cookie с использованием стандартной конфигурации
    setCookie(cookieName, currentValue);
    
    console.log('Cookie cleanup completed, set new cookie with proper domain');
  } else {
    console.log('No language preference cookie found, skipping cleanup');
  }
};

/**
 * Получить предпочитаемый язык пользователя
 * @param {string[]} supportedLocales - массив поддерживаемых локалей
 * @returns {string} код языка
 */
export const getPreferredLanguage = (supportedLocales = ['en', 'ru', 'kk-kz']) => {
  const cookieName = 'openedx-language-preference';
  
  // 1. Проверяем cookie (ПРИОРИТЕТ - сохраненные предпочтения пользователя)
  const cookieLocale = getCookie(cookieName);
  if (cookieLocale && supportedLocales.includes(cookieLocale)) {
    console.log('Using language from cookie:', cookieLocale);
    return cookieLocale;
  }
  
  // 2. Проверяем URL параметр (только если нет cookie)
  const urlParams = new URLSearchParams(window.location.search);
  const urlLocale = urlParams.get('locale');
  if (urlLocale && supportedLocales.includes(urlLocale)) {
    console.log('Using language from URL (no cookie found):', urlLocale);
    // Сохраняем выбор в cookie только если его не было
    setCookie(cookieName, urlLocale);
    return urlLocale;
  }
  
  // 3. Проверяем браузерный язык (только для первого визита)
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang) {
    const browserLocale = browserLang.toLowerCase();
    // Точное совпадение
    if (supportedLocales.includes(browserLocale)) {
      console.log('Using browser language:', browserLocale);
      setCookie(cookieName, browserLocale);
      return browserLocale;
    }
    // Проверяем базовую локаль (например, 'ru' из 'ru-RU')
    const baseLang = browserLocale.split('-')[0];
    if (supportedLocales.includes(baseLang)) {
      console.log('Using browser base language:', baseLang);
      setCookie(cookieName, baseLang);
      return baseLang;
    }
  }
  
  // 4. По умолчанию возвращаем английский
  console.log('Using default language: en');
  return 'en';
};

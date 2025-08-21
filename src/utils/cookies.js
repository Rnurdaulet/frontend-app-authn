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
  // Используем стандартную конфигурацию OpenedX для домена cookies (если установлена)
  const configuredDomain = getConfig().SESSION_COOKIE_DOMAIN;
  
  if (configuredDomain && configuredDomain !== null && configuredDomain !== '') {
    console.log(`Cookie domain: Using configured domain - ; domain=${configuredDomain}`);
    return `; domain=${configuredDomain}`;
  }
  
  // Автоматическое определение домена
  const hostname = window.location.hostname;
  
  // Для localhost и IP адресов не указываем домен
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    console.log('Cookie domain: localhost/IP (no domain)');
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
  
  // Специальная логика для OpenedX доменов
  if (parts.length >= 3) {
    // Проверяем различные паттерны OpenedX
    for (let i = 0; i < parts.length - 1; i++) {
      if (parts[i] === 'openedx') {
        // Найден openedx в домене - берем от openedx до конца
        domain = `; domain=.${parts.slice(i).join('.')}`;
        console.log(`Cookie domain: OpenedX pattern detected - ${domain}`);
        return domain;
      }
    }
    
    // Если openedx не найден, но есть специальные паттерны для локальной разработки
    if (hostname.includes('local.openedx.io')) {
      domain = `; domain=.local.openedx.io`;
      console.log(`Cookie domain: Local OpenedX development - ${domain}`);
      return domain;
    }
  }
  
  // Для обычных доменов берем последние 2 части (domain.tld)
  if (parts.length >= 2) {
    domain = `; domain=.${parts.slice(-2).join('.')}`;
    console.log(`Cookie domain: Standard domain - ${domain}`);
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
  
  console.log('🧹 Starting aggressive cookie cleanup...');
  console.log('Current cookie value:', currentValue);
  
  // Удаляем текущий cookie через стандартную функцию
  deleteCookie(cookieName);
  
  // Агрессивная очистка всех возможных вариантов cookies
  const hostname = window.location.hostname;
  const aggressiveCleanupDomains = [];
  
  if (hostname.includes('.')) {
    const parts = hostname.split('.');
    
    // Добавляем все возможные комбинации доменов для максимальной очистки
    for (let i = 0; i < parts.length; i++) {
      if (i < parts.length - 1) {
        // Создаем варианты с точкой в начале (.domain.tld, .sub.domain.tld)
        aggressiveCleanupDomains.push(`.${parts.slice(i).join('.')}`);
        
        // Создаем варианты без точки (domain.tld, sub.domain.tld)
        aggressiveCleanupDomains.push(parts.slice(i).join('.'));
      }
    }
    
    // Специально для случая apps.openedx.orleu.edu.kz
    if (hostname.includes('openedx.orleu.edu.kz')) {
      aggressiveCleanupDomains.push('apps.openedx.orleu.edu.kz');
      aggressiveCleanupDomains.push('.apps.openedx.orleu.edu.kz');
      aggressiveCleanupDomains.push('studio.openedx.orleu.edu.kz');
      aggressiveCleanupDomains.push('.studio.openedx.orleu.edu.kz');
      aggressiveCleanupDomains.push('preview.openedx.orleu.edu.kz');
      aggressiveCleanupDomains.push('.preview.openedx.orleu.edu.kz');
      aggressiveCleanupDomains.push('.orleu.edu.kz'); // старый вариант
    }
    
    // Добавляем текущий hostname
    aggressiveCleanupDomains.push(hostname);
  }
  
  // Удаляем дублирующие записи
  const uniqueDomains = [...new Set(aggressiveCleanupDomains)];
  
  console.log('🗑️ Attempting to delete cookies for domains:', uniqueDomains);
  
  // Удаляем cookies для всех возможных доменов
  uniqueDomains.forEach(domain => {
    // Пробуем удалить с указанным доменом
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    
    // Пробуем удалить с SameSite=Lax (как в старом cookie)
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}; SameSite=Lax;`;
    
    // Пробуем удалить с SameSite=None (как в старом cookie)
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}; SameSite=None;`;
    
    console.log(`💣 Nuked cookie for domain: ${domain}`);
  });
  
  // Дополнительная зачистка - удаляем без указания домена
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;`;
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None;`;
  
  console.log('🔥 Performed final cleanup without domain specification');
  
  // Устанавливаем правильный cookie с использованием стандартной конфигурации
  if (currentValue) {
    setCookie(cookieName, currentValue);
    console.log('✅ Set new cookie with proper domain:', currentValue);
  } else {
    console.log('ℹ️ No previous value found, skipping cookie restoration');
  }
  
  console.log('🎯 Aggressive cookie cleanup completed');
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

/**
 * Утилиты для работы с cookies
 */

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
 * Установить cookie
 * @param {string} name - имя cookie
 * @param {string} value - значение cookie
 * @param {number} days - количество дней до истечения (по умолчанию 365)
 */
export const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

/**
 * Удалить cookie
 * @param {string} name - имя cookie
 */
export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
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

import React, { useMemo, useEffect } from 'react';
import { getLocale } from '@edx/frontend-platform/i18n';
import { forceSetCookie, getCookie, cleanupDuplicateCookies, verifyCookie } from '../../../utils/cookies';

import './LanguageSelector.scss';

const LanguageSelector = () => {
  const currentLocale = getLocale();
  
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', shortName: 'Eng' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', shortName: 'Рус' },
    { code: 'kk-kz', name: 'Kazakh', nativeName: 'Қазақша', shortName: 'Қаз' },
  ];

  // Очищаем дублирующие cookies при инициализации компонента
  useEffect(() => {
    cleanupDuplicateCookies();
  }, []);

  // Больше не нужно отслеживать URL, так как используем cookies

  // Определяем текущий язык с помощью useMemo
  const currentLanguage = useMemo(() => {
    // Проверяем точное совпадение с getLocale()
    let lang = languages.find(l => l.code === currentLocale);
    if (lang) return lang;
    
    // Проверяем первую часть локали (например, 'en' из 'en-US')
    const baseLocale = currentLocale?.split('-')[0];
    lang = languages.find(l => l.code.split('-')[0] === baseLocale);
    if (lang) return lang;
    
    // Возвращаем по умолчанию английский
    return languages[0];
  }, [currentLocale, languages]);

  const handleLanguageChange = (langCode) => {
    console.log('=== LanguageSelector: User selecting language ===');
    console.log('Selected language:', langCode);
    console.log('Current cookie before change:', getCookie('openedx-language-preference'));
    
    // Сначала очищаем все дублирующие cookies
    cleanupDuplicateCookies();
    
    // Устанавливаем cookie для языка с принудительной проверкой
    forceSetCookie('openedx-language-preference', langCode);
    
    console.log('Cookie set to:', langCode);
    
    // Отправляем кастомное событие для уведомления об изменении языка
    const languageChangeEvent = new CustomEvent('languageChanged', { 
      detail: { locale: langCode } 
    });
    window.dispatchEvent(languageChangeEvent);
    
    // Очищаем URL от параметра locale, чтобы избежать конфликтов
    const url = new URL(window.location);
    url.searchParams.delete('locale');
    
    // Обновляем URL без перезагрузки страницы
    if (url.toString() !== window.location.href) {
      window.history.replaceState({}, '', url.toString());
    }
    
    // Проверяем, что cookie установился корректно перед перезагрузкой
    setTimeout(() => {
      const cookieValue = getCookie('openedx-language-preference');
      if (verifyCookie('openedx-language-preference', langCode)) {
        console.log('✅ Cookie verified successfully, reloading page...');
        window.location.reload();
      } else {
        console.warn(`⚠️ Cookie verification failed. Expected: ${langCode}, Got: ${cookieValue}`);
        console.log('⚠️ Page reload delayed to allow cookie to be set properly...');
        
        // Даем еще одну попытку перед принудительной перезагрузкой
        setTimeout(() => {
          const finalCookieValue = getCookie('openedx-language-preference');
          if (finalCookieValue === langCode) {
            console.log('✅ Cookie finally set correctly, reloading page...');
          } else {
            console.warn(`⚠️ Cookie still not set correctly: ${finalCookieValue}, but reloading anyway...`);
          }
          window.location.reload();
        }, 300);
      }
    }, 200);
  };

  return (
    <div className="language-selector">
      <div className="language-buttons">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`language-button ${language.code === currentLanguage.code ? 'active' : ''}`}
            title={language.nativeName}
          >
            {language.shortName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;

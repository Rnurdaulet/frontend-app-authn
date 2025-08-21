import React, { useMemo, useEffect } from 'react';
import { getLocale } from '@edx/frontend-platform/i18n';
import { setCookie, getCookie, cleanupDuplicateCookies } from '../../../utils/cookies';

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
    
    // Устанавливаем cookie для языка с правильным доменом
    setCookie('openedx-language-preference', langCode);
    
    console.log('Cookie set to:', langCode);
    console.log('Cookie after setting:', getCookie('openedx-language-preference'));
    
    // Очищаем URL от параметра locale, чтобы избежать конфликтов
    const url = new URL(window.location);
    url.searchParams.delete('locale');
    
    // Перезагружаем страницу с очищенным URL
    console.log('Reloading page with clean URL:', url.toString());
    window.location.href = url.toString();
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

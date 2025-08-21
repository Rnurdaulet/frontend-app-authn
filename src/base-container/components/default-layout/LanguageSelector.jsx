import React, { useMemo } from 'react';
import { Dropdown } from '@openedx/paragon';
import { getLocale } from '@edx/frontend-platform/i18n';
import { setCookie, getCookie } from '../../../utils/cookies';

import './LanguageSelector.scss';

const LanguageSelector = () => {
  const currentLocale = getLocale();
  
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'kk-kz', name: 'Kazakh', nativeName: 'Қазақша' },
  ];

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
    
    // Устанавливаем cookie для языка
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
      <Dropdown className="language-dropdown">
        <Dropdown.Toggle
          variant="outline-primary"
          id="language-dropdown"
          className="language-toggle"
        >
          🌐 <span className="language-display">{currentLanguage.nativeName}</span>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {languages.map((language) => (
            <Dropdown.Item
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              active={language.code === currentLanguage.code}
              className="language-item"
            >
              <span className="language-native">{language.nativeName}</span>
              <span className="language-english"> ({language.name})</span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default LanguageSelector;

import React, { useMemo } from 'react';
import { getLocale } from '@edx/frontend-platform/i18n';
import { forceSetCookie, getCookie, verifyCookie } from '../../../utils/cookies';

import './LanguageSelector.scss';

const LanguageSelector = () => {
  const currentLocale = getLocale();
  
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', shortName: 'Eng' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', shortName: 'Рус' },
    { code: 'kk-kz', name: 'Kazakh', nativeName: 'Қазақша', shortName: 'Қаз' },
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
    // Устанавливаем cookie для языка
    forceSetCookie('openedx-language-preference', langCode);
    
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
    
    // Небольшая задержка и перезагрузка страницы
    setTimeout(() => {
      if (verifyCookie('openedx-language-preference', langCode)) {
        window.location.reload();
      } else {
        // пробуем без проверки
        window.location.reload();
      }
    }, 150);
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

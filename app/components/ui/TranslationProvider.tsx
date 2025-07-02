import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'hu', label: 'Magyar' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    'settings.general': 'General',
    'settings.language': 'Language',
    'settings.selectLanguage': 'Select Language',
    'settings.panel': 'This is the General settings panel.',
    'ideaToApp': 'Idea to app in seconds.',
    'buildFullstack': 'Build fullstack web and mobile apps in seconds.',
    'unlimitedEnds': 'Unlimited tokens ends in:',
    'upgradePlan': 'Upgrade Plan',
    // ...add more keys as needed
  },
  de: {
    'settings.general': 'Allgemein',
    'settings.language': 'Sprache',
    'settings.selectLanguage': 'Sprache wählen',
    'settings.panel': 'Dies ist das Allgemein-Einstellungsfeld.',
    'ideaToApp': 'Idee zur App in Sekunden.',
    'buildFullstack': 'Erstellen Sie Fullstack-Web- und Mobile-Apps in Sekunden.',
    'unlimitedEnds': 'Unbegrenzte Tokens enden in:',
    'upgradePlan': 'Plan upgraden',
  },
  hu: {
    'settings.general': 'Általános',
    'settings.language': 'Nyelv',
    'settings.selectLanguage': 'Válassz nyelvet',
    'settings.panel': 'Ez az általános beállítások panel.',
    'ideaToApp': 'Ötlettől alkalmazásig másodpercek alatt.',
    'buildFullstack': 'Építs teljes stack web- és mobilalkalmazásokat másodpercek alatt.',
    'unlimitedEnds': 'Korlátlan token vége:',
    'upgradePlan': 'Frissítsd a csomagot',
  },
  fr: {
    'settings.general': 'Général',
    'settings.language': 'Langue',
    'settings.selectLanguage': 'Choisir la langue',
    'settings.panel': 'Ceci est le panneau des paramètres généraux.',
    'ideaToApp': "De l'idee a l'application en quelques secondes.",
    'buildFullstack': 'Créez des applications web et mobiles fullstack en quelques secondes.',
    'unlimitedEnds': 'Jetons illimités se terminent dans :',
    'upgradePlan': 'Améliorer le plan',
  },
  es: {
    'settings.general': 'General',
    'settings.language': 'Idioma',
    'settings.selectLanguage': 'Seleccionar idioma',
    'settings.panel': 'Este es el panel de configuración general.',
    'ideaToApp': 'De la idea a la aplicación en segundos.',
    'buildFullstack': 'Crea aplicaciones web y móviles fullstack en segundos.',
    'unlimitedEnds': 'Los tokens ilimitados terminan en:',
    'upgradePlan': 'Mejorar plan',
  },
  it: {
    'settings.general': 'Generale',
    'settings.language': 'Lingua',
    'settings.selectLanguage': 'Seleziona lingua',
    'settings.panel': 'Questo è il pannello delle impostazioni generali.',
    'ideaToApp': 'Da idea ad app in pochi secondi.',
    'buildFullstack': 'Crea app web e mobile fullstack in pochi secondi.',
    'unlimitedEnds': 'Token illimitati terminano tra:',
    'upgradePlan': 'Aggiorna piano',
  },
  ru: {
    'settings.general': 'Общие',
    'settings.language': 'Язык',
    'settings.selectLanguage': 'Выберите язык',
    'settings.panel': 'Это панель общих настроек.',
    'ideaToApp': 'Идея в приложение за секунды.',
    'buildFullstack': 'Создавайте fullstack веб- и мобильные приложения за секунды.',
    'unlimitedEnds': 'Безлимитные токены заканчиваются через:',
    'upgradePlan': 'Обновить план',
  },
  zh: {
    'settings.general': '常规',
    'settings.language': '语言',
    'settings.selectLanguage': '选择语言',
    'settings.panel': '这是常规设置面板。',
    'ideaToApp': '秒变应用。',
    'buildFullstack': '几秒钟内构建全栈 Web 和移动应用。',
    'unlimitedEnds': '无限代币将在以下时间结束：',
    'upgradePlan': '升级计划',
  },
  ja: {
    'settings.general': '一般',
    'settings.language': '言語',
    'settings.selectLanguage': '言語を選択',
    'settings.panel': 'これは一般設定パネルです。',
    'ideaToApp': 'アイデアからアプリへ数秒で。',
    'buildFullstack': '数秒でフルスタックのWeb・モバイルアプリを構築。',
    'unlimitedEnds': '無制限トークンの終了まで：',
    'upgradePlan': 'プランをアップグレード',
  },
};

interface TranslationContextProps {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  languages: typeof LANGUAGES;
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };

  const t = (key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslationContext must be used within TranslationProvider');
  return ctx;
};
import { useTranslationContext } from './TranslationProvider';
 
export function useTranslation() {
  const { t, language, setLanguage, languages } = useTranslationContext();
  return { t, language, setLanguage, languages };
} 
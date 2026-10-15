import i18n, { use as addPlugin } from 'i18next';
import { initReactI18next } from 'react-i18next';
import he from './locales/he.json';

void addPlugin(initReactI18next).init({
  resources: { he: { translation: he } },
  lng: 'he',
  fallbackLng: 'he',
  interpolation: { escapeValue: false },
});

export default i18n;

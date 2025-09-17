import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import bn from './locales/bn.json';
import mr from './locales/mr.json';
import or from './locales/or.json';
import pa from './locales/pa.json';
import ml from './locales/ml.json';

const deviceLanguage = (Localization.locale || Localization.locales?.[0] || 'en').split('-')[0];

i18n
  .use(initReactI18next)
  .init({
    // compatibilityJSON: 'v4',  // Remove or set to 'v4' if needed, avoid 'v3'
    fallbackLng: 'en',
    lng: deviceLanguage,
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      kn: { translation: kn },
      ta: { translation: ta },
      te: { translation: te },
      bn: { translation: bn },
      mr: { translation: mr },
      or: { translation: or },
      pa: { translation: pa },
      ml: { translation: ml },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;

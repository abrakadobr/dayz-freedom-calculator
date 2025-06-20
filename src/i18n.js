import { createI18n } from 'vue-i18n'
import en from '@/i18n/en.json'
import ru from '@/i18n/ru.json'
import ukr from '@/i18n/ukr.json'

const getLanguage = () => navigator.userLanguage || (navigator.languages && navigator.languages.length && navigator.languages[0]) || navigator.language || navigator.browserLanguage || navigator.systemLanguage || 'en';

const defaultLocale = getLanguage()
const locale = localStorage.getItem('locale') || defaultLocale || 'en'

export const i18n = createI18n({
  locale,
  fallbackLocale: 'en',
  messages: {
    en, ru, ukr
  }
})

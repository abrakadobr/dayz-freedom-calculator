import { createI18n } from 'vue-i18n'
import en from '@/i18n/en.json'
import ru from '@/i18n/ru.json'
import ukr from '@/i18n/ukr.json'

const getLanguage = () => navigator.userLanguage || (navigator.languages && navigator.languages.length && navigator.languages[0]) || navigator.language || navigator.browserLanguage || navigator.systemLanguage || 'en';

const defaultLocale = getLanguage()
const def = defaultLocale.includes('-') ? defaultLocale.split('-')[0] : defaultLocale
const locale = localStorage.getItem('locale') || def || 'en'
const list = ['en', 'ru', 'ukr']
const lcl = list.includes(locale) ? locale : 'en'

export const i18n = createI18n({
  locale: lcl,
  fallbackLocale: 'en',
  messages: {
    en, ru, ukr
  }
})

/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['i18n']
 * INFO: i18next setup: the three locales, the language follows the settings copy.
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import store from '../core/store'
import { ruLocalization } from './elements/ru'
import { enLocalization } from './elements/en'
import { cnLocalization } from './elements/cn'

i18n.use(initReactI18next).init({
  resources: {
    ru: ruLocalization,
    en: enLocalization,
    cn: cnLocalization,
  },
  lng: 'ru',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

// the settings copy owns the language: applied once at setup and on every change
const syncLanguage = () => {
  const locale = store.getState().settings.appearanceLocale
  if (i18n.language !== locale) i18n.changeLanguage(locale)
}
syncLanguage()
store.subscribe(syncLanguage)

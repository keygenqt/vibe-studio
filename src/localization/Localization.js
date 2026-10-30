/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['i18n']
 * INFO: i18next setup: the three locales, ru the default.
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

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
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
})

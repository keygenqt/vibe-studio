/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import { useTranslation } from 'react-i18next'

import { PageHeader } from '../../components/views'

// draft: will grow into default models and core app settings
export function GeneralPage() {
  const { t } = useTranslation()
  return (
    <PageHeader title={t('settings.t_general')} subtitle={t('settings.t_general_description')} />
  )
}

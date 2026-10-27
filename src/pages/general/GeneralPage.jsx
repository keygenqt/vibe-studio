/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import { useTranslation } from 'react-i18next'

import { PageHeader } from '../../components/views'

export function GeneralPage() {
  const { t } = useTranslation()
  return <PageHeader title={t('general.t_general')} subtitle={t('general.t_general_description')} />
}

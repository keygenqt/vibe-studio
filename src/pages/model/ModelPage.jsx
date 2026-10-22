/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import { useParams } from 'react-router'

import { PageHeader } from '../../components/views'

export function ModelPage() {
  const { modelId } = useParams()
  return (
    <PageHeader title={`Model #${modelId}`} subtitle={'Tune generation parameters and defaults.'} />
  )
}

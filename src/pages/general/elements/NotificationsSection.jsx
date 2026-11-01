/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Notifications block: background alerts for answers and new versions.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Switch } from '@mui/material'

import { GroupRow, GroupView } from '../../../components/views'

export function NotificationsSection(props) {
  const { t } = useTranslation()
  const { values, onChange } = props
  return (
    <GroupView title={t('general.t_notifications')}>
      <GroupRow
        title={t('general.t_notify_ready')}
        description={t('general.t_notify_ready_description')}
        fluid={false}
      >
        <Switch
          checked={values.notifyReady}
          onChange={e => onChange('notifyReady', e.target.checked)}
        />
      </GroupRow>
      <GroupRow
        title={t('general.t_notify_updates')}
        description={t('general.t_notify_updates_description')}
        fluid={false}
      >
        <Switch
          checked={values.notifyUpdates}
          onChange={e => onChange('notifyUpdates', e.target.checked)}
        />
      </GroupRow>
    </GroupView>
  )
}

NotificationsSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}

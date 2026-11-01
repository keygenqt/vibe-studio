/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Interface tasks block: models for light and heavy tasks.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { MenuItem, TextField } from '@mui/material'

import { GroupRow, GroupView } from '../../../components/views'

// mock list: the wired models arrive with the states task
const MODELS = ['yandexgpt-5-lite', 'yandexgpt-5-pro']

export function TasksSection(props) {
  const { t } = useTranslation()
  const { values, onChange } = props
  return (
    <GroupView title={t('general.t_tasks')}>
      <GroupRow
        title={t('general.t_task_light')}
        description={t('general.t_task_light_description')}
      >
        <TextField
          select
          size="small"
          hiddenLabel
          variant={'filled'}
          value={values.taskModelLight}
          onChange={e => onChange('taskModelLight', e.target.value)}
          sx={{ width: 230 }}
        >
          {MODELS.map(name => (
            <MenuItem key={`task-light-${name}`} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>
      </GroupRow>
      <GroupRow
        title={t('general.t_task_heavy')}
        description={t('general.t_task_heavy_description')}
      >
        <TextField
          select
          size="small"
          hiddenLabel
          variant={'filled'}
          value={values.taskModelHeavy}
          onChange={e => onChange('taskModelHeavy', e.target.value)}
          sx={{ width: 230 }}
        >
          {MODELS.map(name => (
            <MenuItem key={`task-heavy-${name}`} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>
      </GroupRow>
    </GroupView>
  )
}

TasksSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}

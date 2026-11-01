/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Interface tasks block: models for light and heavy tasks.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

import { GroupRow, GroupView } from '../../../components/views'

import { ModelSelect } from './ModelSelect'

export function TasksSection(props) {
  const { t } = useTranslation()
  const { values, onChange, providers, models } = props
  return (
    <GroupView title={t('general.t_tasks')}>
      <GroupRow
        title={t('general.t_task_light')}
        description={t('general.t_task_light_description')}
      >
        <ModelSelect
          value={values.taskModelLight}
          onChange={value => onChange('taskModelLight', value)}
          providers={providers}
          models={models}
        />
      </GroupRow>
      <GroupRow
        title={t('general.t_task_heavy')}
        description={t('general.t_task_heavy_description')}
      >
        <ModelSelect
          value={values.taskModelHeavy}
          onChange={value => onChange('taskModelHeavy', value)}
          providers={providers}
          models={models}
        />
      </GroupRow>
    </GroupView>
  )
}

TasksSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  providers: PropTypes.array,
  models: PropTypes.array,
}

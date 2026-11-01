/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Translation block: the translation model and the two direction languages.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { MenuItem, TextField } from '@mui/material'

import { GroupRow, GroupView } from '../../../components/views'

import { ModelSelect } from './ModelSelect'

// native titles: language names are not translated
const LANGUAGES = [
  { value: 'ru', title: 'Русский' },
  { value: 'en', title: 'English' },
  { value: 'cn', title: '中文' },
]

export function TranslationSection(props) {
  const { t } = useTranslation()
  const { values, onChange } = props
  return (
    <GroupView title={t('general.t_translation')}>
      <GroupRow
        title={t('general.t_translation_model')}
        description={t('general.t_translation_model_description')}
      >
        <ModelSelect
          value={values.translateModel}
          onChange={value => onChange('translateModel', value)}
          providers={props.providers}
          models={props.models}
        />
      </GroupRow>
      <GroupRow
        title={t('general.t_translation_mine')}
        description={t('general.t_translation_mine_description')}
      >
        <TextField
          select
          size="small"
          hiddenLabel
          variant={'filled'}
          value={values.translateMine}
          onChange={e => onChange('translateMine', e.target.value)}
          sx={{ width: 230 }}
        >
          {LANGUAGES.map(item => (
            <MenuItem key={`translate-mine-${item.value}`} value={item.value}>
              {item.title}
            </MenuItem>
          ))}
        </TextField>
      </GroupRow>
      <GroupRow
        title={t('general.t_translation_answers')}
        description={t('general.t_translation_answers_description')}
      >
        <TextField
          select
          size="small"
          hiddenLabel
          variant={'filled'}
          value={values.translateAnswers}
          onChange={e => onChange('translateAnswers', e.target.value)}
          sx={{ width: 230 }}
        >
          {LANGUAGES.map(item => (
            <MenuItem key={`translate-answers-${item.value}`} value={item.value}>
              {item.title}
            </MenuItem>
          ))}
        </TextField>
      </GroupRow>
    </GroupView>
  )
}

TranslationSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  providers: PropTypes.array,
  models: PropTypes.array,
}

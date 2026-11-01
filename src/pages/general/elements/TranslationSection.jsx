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

// mock list: the wired models arrive with the states task
const MODELS = ['yandexgpt-5-lite', 'yandexgpt-5-pro']

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
        <TextField
          select
          size="small"
          hiddenLabel
          variant={'filled'}
          value={values.translateModel}
          onChange={e => onChange('translateModel', e.target.value)}
          sx={{ width: 230 }}
        >
          {MODELS.map(name => (
            <MenuItem key={`translate-${name}`} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>
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
}

/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Chat block: streaming output and the kept messages limit.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Switch, TextField } from '@mui/material'

import { GroupRow, GroupView } from '../../../components/views'

export function ChatSection(props) {
  const { t } = useTranslation()
  const { values, onChange } = props
  return (
    <GroupView title={t('general.t_chat')}>
      <GroupRow
        title={t('general.t_streaming')}
        description={t('general.t_streaming_description')}
        fluid={false}
      >
        <Switch
          checked={values.streaming}
          onChange={e => onChange('streaming', e.target.checked)}
        />
      </GroupRow>
      <GroupRow
        title={t('general.t_keep_messages')}
        description={t('general.t_keep_messages_description')}
      >
        <TextField
          type={'number'}
          size="small"
          hiddenLabel
          variant={'filled'}
          value={values.keepMessages}
          onChange={e => onChange('keepMessages', Number(e.target.value))}
          sx={{ width: 250 }}
          slotProps={{ htmlInput: { min: 1, step: 1 } }}
        />
      </GroupRow>
    </GroupView>
  )
}

ChatSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}

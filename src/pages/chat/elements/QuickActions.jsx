/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The quick actions row: attach, the mode toggles and the menu in one group.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Badge, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'
import AttachFile from '@mui/icons-material/AttachFile'
import Translate from '@mui/icons-material/Translate'

export function QuickActions(props) {
  const { t } = useTranslation()
  return (
    <Stack direction={'row'} spacing={1} alignItems={'center'}>
      <ToggleButtonGroup
        size={'small'}
        value={props.quick}
        onChange={(_event, value) => props.onQuick(value.filter(item => item !== 'attach'))}
      >
        <Tooltip title={t('chat.t_attach_file')}>
          <Badge badgeContent={props.attachCount} color={'primary'}>
            <ToggleButton value={'attach'} onClick={props.onAttach} sx={{ px: '8px' }}>
              <AttachFile sx={{ fontSize: 18, color: 'text.primary' }} />
            </ToggleButton>
          </Badge>
        </Tooltip>
        {props.translateEnabled && (
          <Tooltip title={t('chat.t_translate')}>
            <ToggleButton value={'translate'} sx={{ px: '8px' }}>
              <Translate
                sx={{
                  fontSize: 18,
                  color: props.quick.includes('translate') ? 'primary.main' : 'text.primary',
                }}
              />
            </ToggleButton>
          </Tooltip>
        )}
      </ToggleButtonGroup>
    </Stack>
  )
}

QuickActions.propTypes = {
  quick: PropTypes.array.isRequired,
  onQuick: PropTypes.func.isRequired,
  // opens the file picker; the selected paths land in the draft
  onAttach: PropTypes.func.isRequired,
  translateEnabled: PropTypes.bool.isRequired,
  attachCount: PropTypes.number,
}

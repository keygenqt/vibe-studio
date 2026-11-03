/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The quick actions row: attach, the mode toggles and the menu in one group.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import {
  Badge,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import AttachFile from '@mui/icons-material/AttachFile'
import MoreVert from '@mui/icons-material/MoreVert'
import Public from '@mui/icons-material/Public'
import Translate from '@mui/icons-material/Translate'

export function QuickActions(props) {
  const { t } = useTranslation()
  return (
    <Stack
      direction={'row'}
      spacing={2}
      justifyContent={'space-between'}
      alignItems={'center'}
      sx={{ width: 1 }}
    >
      <ToggleButtonGroup
        size={'small'}
        value={props.quick}
        onChange={(_event, value) =>
          props.onQuick(value.filter(item => item !== 'attach' && item !== 'menu'))
        }
      >
        <Tooltip title={t('chat.t_attach_file')}>
          <Badge badgeContent={props.attachCount} color={'primary'}>
            <ToggleButton value={'attach'} sx={{ px: '8px' }}>
              <AttachFile sx={{ fontSize: 18, color: 'text.primary' }} />
            </ToggleButton>
          </Badge>
        </Tooltip>
        <Tooltip title={t('chat.t_search')}>
          <ToggleButton value={'search'} sx={{ px: '8px' }}>
            <Public
              sx={{
                fontSize: 18,
                color: props.quick.includes('search') ? 'primary.main' : 'text.primary',
              }}
            />
          </ToggleButton>
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
        <Tooltip title={t('chat.t_menu')}>
          <ToggleButton value={'menu'} sx={{ px: '8px' }}>
            <MoreVert sx={{ fontSize: 18, color: 'text.primary' }} />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      {props.loading ? (
        <CircularProgress size={14} color={'inherit'} />
      ) : (
        props.stats && (
          <Typography variant={'caption'} noWrap color={'text.secondary'}>
            {props.stats}
          </Typography>
        )
      )}
    </Stack>
  )
}

QuickActions.propTypes = {
  quick: PropTypes.array.isRequired,
  onQuick: PropTypes.func.isRequired,
  translateEnabled: PropTypes.bool.isRequired,
  attachCount: PropTypes.number,
  stats: PropTypes.string,
  loading: PropTypes.bool,
}

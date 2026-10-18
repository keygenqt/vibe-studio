/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Box, Stack } from '@mui/material'
import Add from '@mui/icons-material/Add'
import ViewSidebar from '@mui/icons-material/ViewSidebar'
import Settings from '@mui/icons-material/Settings'

import { AppData } from '../../../constants/AppData'
import { RailButton } from './RailButton'

export function RailView(props) {
  const { t } = useTranslation()
  return (
    <Stack
      sx={{
        height: 1,
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          p: 1,
          marginBottom: 1,
        }}
      >
        <Box
          component="img"
          src={AppData.images.app_icon}
          alt="Vibe Studio"
          sx={{ width: 30, height: 30 }}
        />
      </Box>

      <Stack
        spacing={0.5}
        sx={{
          flexGrow: 1,
          flexShrink: 0,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          p: '6px',
        }}
      >
        <RailButton title={t('main.t_sidebar')} onClick={props.onToggleSidebar}>
          <ViewSidebar />
        </RailButton>
        <RailButton title={t('main.t_new_chat')} onClick={props.onNewChat}>
          <Add />
        </RailButton>
        <Box sx={{ flexGrow: 1 }} />
        <RailButton title={t('main.t_settings')} onClick={props.onSettings}>
          <Settings />
        </RailButton>
      </Stack>
    </Stack>
  )
}

RailView.propTypes = {
  onNewChat: PropTypes.func,
  onToggleSidebar: PropTypes.func,
  onSettings: PropTypes.func,
}

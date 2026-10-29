/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Box, Card, ListItemButton, Stack, Typography } from '@mui/material'
import ExpandMore from '@mui/icons-material/ExpandMore'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'

import { TooltipIconButton } from '../../../components/buttons'
import { BadgeView } from '../../../components/views'

export function GroupItem(props) {
  const { t } = useTranslation()
  return (
    <Card elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', backgroundColor: 'panel.main' }}>
      <ListItemButton
        selected={props.active}
        onClick={props.onActivate}
        sx={{ px: '8px', py: '6px' }}
      >
        <Stack
          direction={'row'}
          spacing={2}
          alignItems={'center'}
          sx={{ flexGrow: 1, minWidth: 0 }}
        >
          <BadgeView active={props.active}>
            <Box
              component={'span'}
              sx={{ position: 'relative', top: '1px', fontSize: 20, fontWeight: 600 }}
            >
              {props.name.charAt(0)}
            </Box>
          </BadgeView>
          <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography fontWeight={600} noWrap color={'text.primary'} sx={{ minWidth: 0 }}>
              {props.name}
            </Typography>
            <Typography
              variant={'body2'}
              noWrap
              color={'text.secondary'}
              sx={{ fontFamily: 'monospace' }}
            >
              {props.model ?? '—'}
            </Typography>
          </Stack>
        </Stack>
        <TooltipIconButton
          size={'mini'}
          title={t('main.t_group_collapse')}
          onClick={event => {
            event.stopPropagation()
            props.onToggle()
          }}
        >
          {props.collapsed ? <KeyboardArrowRight /> : <ExpandMore />}
        </TooltipIconButton>
      </ListItemButton>
    </Card>
  )
}

GroupItem.propTypes = {
  name: PropTypes.string.isRequired,
  model: PropTypes.string,
  active: PropTypes.bool,
  collapsed: PropTypes.bool,
  onActivate: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
}

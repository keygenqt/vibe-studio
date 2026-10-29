/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { Avatar, Box, Card, CardActionArea, Stack, Typography } from '@mui/material'
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined'

export function GroupChatCard(props) {
  return (
    <Card variant={'outlined'} sx={{ borderRadius: 2, flexShrink: 0 }}>
      <CardActionArea onClick={props.onConfigure}>
        <Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ p: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
              fontWeight: 600,
            }}
          >
            <Box component={'span'} sx={{ position: 'relative', top: '1px' }}>
              {props.groupChat.name.charAt(0)}
            </Box>
          </Avatar>
          <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography fontWeight={600} noWrap sx={{ minWidth: 0 }}>
              {props.groupChat.name}
            </Typography>
            <Typography variant={'body2'} noWrap sx={{ fontFamily: 'monospace' }}>
              {props.model ? props.model.name : '—'}
            </Typography>
          </Stack>
          <ChevronRightOutlined color={'action'} />
        </Stack>
      </CardActionArea>
    </Card>
  )
}

GroupChatCard.propTypes = {
  groupChat: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  model: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
  onConfigure: PropTypes.func.isRequired,
}

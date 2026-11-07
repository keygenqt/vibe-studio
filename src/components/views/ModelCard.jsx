/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Model row card: avatar, capability badges, fact line, optional action.
 */
import PropTypes from 'prop-types'
import { Avatar, Card, CardActionArea, Stack, Typography } from '@mui/material'

import { ModelCapability } from './ModelCapability'

// context in tokens, human form: 262144 → "262k ctx"
const formatContext = context => {
  if (!context) return null
  return context >= 1000 ? `${Math.round(context / 1000)}k ctx` : `${context} ctx`
}

export function ModelCard(props) {
  const facts = [props.description, formatContext(props.context)].filter(Boolean)

  const body = (
    <Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ py: 1, pr: 2, pl: 2 }}>
      <Avatar
        sx={{
          bgcolor: props.color ?? 'secondary.main',
          color: 'secondary.contrastText',
          fontWeight: 600,
        }}
      >
        {props.title.charAt(0).toUpperCase()}
      </Avatar>
      <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography fontWeight={600} noWrap sx={{ minWidth: 0 }}>
          {props.title}
        </Typography>
        <ModelCapability capabilities={props.capabilities} />
        {facts.length > 0 && (
          <Typography variant={'body2'} noWrap>
            {facts.join(' · ')}
          </Typography>
        )}
      </Stack>
      {props.action}
    </Stack>
  )

  return (
    <Card variant={'outlined'} sx={{ borderRadius: 2 }}>
      {props.onClick ? <CardActionArea onClick={props.onClick}>{body}</CardActionArea> : body}
    </Card>
  )
}

ModelCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  capabilities: PropTypes.object,
  context: PropTypes.number,
  color: PropTypes.string,
  action: PropTypes.node,
  onClick: PropTypes.func,
}

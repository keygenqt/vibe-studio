/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Model row card: avatar, fact line, optional action.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Avatar, Card, CardActionArea, Stack, Typography } from '@mui/material'

export function ModelCard(props) {
  const { t } = useTranslation()
  const facts = [
    props.description,
    props.vision === true && t('models.t_badge_vision'),
    props.thinking === true && t('models.t_badge_thinking'),
    props.tools === true && t('models.t_badge_tools'),
  ].filter(Boolean)

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
  vision: PropTypes.bool,
  thinking: PropTypes.bool,
  tools: PropTypes.bool,
  color: PropTypes.string,
  action: PropTypes.node,
  onClick: PropTypes.func,
}

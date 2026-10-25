/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Avatar, Card, Stack, Switch, Typography } from '@mui/material'

// selectable model row: toggled by its checkbox
export function ModelCard(props) {
  const { t } = useTranslation()
  // description line: facts joined by bullets, like other descriptions
  const facts = [
    props.description,
    props.vision === true && t('models.t_badge_vision'),
    props.thinking === true && t('models.t_badge_thinking'),
    props.tools === true && t('models.t_badge_tools'),
  ].filter(Boolean)
  return (
    <Card variant={'outlined'} sx={{ borderRadius: 2 }}>
      <Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ py: 1, pr: 2, pl: 2 }}>
        <Avatar
          sx={{
            bgcolor: props.color ?? 'secondary.main',
            color: 'secondary.contrastText',
            fontWeight: 600,
          }}
        >
          {props.avatar}
        </Avatar>
        <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography fontWeight={600} noWrap sx={{ minWidth: 0 }}>
            {props.name}
          </Typography>
          {facts.length > 0 && (
            <Typography variant={'body2'} noWrap>
              {facts.join(' · ')}
            </Typography>
          )}
        </Stack>
        <Switch
          checked={props.checked}
          disabled={Boolean(props.disabled)}
          onChange={props.onToggle}
          sx={{ flexShrink: 0 }}
        />
      </Stack>
    </Card>
  )
}

ModelCard.propTypes = {
  avatar: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  vision: PropTypes.bool,
  thinking: PropTypes.bool,
  tools: PropTypes.bool,
  color: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onToggle: PropTypes.func,
}

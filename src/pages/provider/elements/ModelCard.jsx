/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Avatar, Card, CardActionArea, Stack, Typography } from '@mui/material'
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined'

// model row on the provider page, styled after the models page cards;
// the model row comes from the store (wire fields, snake_case)
export function ModelCard(props) {
  const { t } = useTranslation()
  const { model } = props
  // description line: facts joined by bullets, like the models page
  const facts = [
    model.params,
    model.vision === true && t('models.t_badge_vision'),
    model.reasoning === true && t('models.t_badge_thinking'),
    model.tools === true && t('models.t_badge_tools'),
  ].filter(Boolean)
  return (
    <Card variant={'outlined'} sx={{ borderRadius: 2 }}>
      <CardActionArea onClick={props.onClick}>
        <Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ py: 1, pr: 2, pl: 2 }}>
          <Avatar
            sx={{
              bgcolor: props.color ?? 'secondary.main',
              color: 'secondary.contrastText',
              fontWeight: 600,
            }}
          >
            {model.display_name
              ? model.display_name.charAt(0).toUpperCase()
              : model.name.charAt(0).toUpperCase()}
          </Avatar>
          <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography fontWeight={600} noWrap sx={{ minWidth: 0 }}>
              {model.display_name ? `${model.display_name} (${model.name})` : model.name}
            </Typography>
            {facts.length > 0 && (
              <Typography variant={'body2'} noWrap>
                {facts.join(' · ')}
              </Typography>
            )}
          </Stack>
          <ChevronRightOutlined color={'action'} />
        </Stack>
      </CardActionArea>
    </Card>
  )
}

ModelCard.propTypes = {
  model: PropTypes.shape({
    name: PropTypes.string.isRequired,
    display_name: PropTypes.string,
    params: PropTypes.string,
    vision: PropTypes.bool,
    reasoning: PropTypes.bool,
    tools: PropTypes.bool,
  }).isRequired,
  color: PropTypes.string,
  onClick: PropTypes.func,
}

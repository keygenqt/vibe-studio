/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: A chat message bubble: sender styling, thinking, status plates, local time.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Box, Collapse, IconButton, Stack, Typography } from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'

// i18next locale codes to BCP 47: Intl throws on unknown codes like 'cn'
const LOCALES = { ru: 'ru', en: 'en', cn: 'zh-CN' }

// bubble colors per sender: the user right on the accent, the model
// left on the panel; a cut stream and a failed request render as plates
const BUBBLES = {
  user: { backgroundColor: 'primary.main', color: 'primary.contrastText' },
  model: { backgroundColor: 'panel.main', color: 'text.primary' },
}

export function MessageView(props) {
  const { t, i18n } = useTranslation()
  const [thinkingOpen, setThinkingOpen] = React.useState(false)
  const message = props.message
  // the sender without a model is the user
  const isUser = message.model === null
  const align = isUser ? 'flex-end' : 'flex-start'
  const time = new Intl.DateTimeFormat(LOCALES[i18n.language], {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(message.created_at))

  // a cut stream: the plate keeps the partial answer dimmed
  if (message.status === 'cancelled') {
    return (
      <Stack spacing={0.5} sx={{ maxWidth: '70%', alignSelf: align }}>
        <Box sx={{ paddingX: 1.5, paddingY: 1, borderRadius: 2, backgroundColor: 'panel.main' }}>
          <Typography variant={'body2'} color={'text.secondary'}>
            {t('main.t_cancelled')}
          </Typography>
          {message.text && (
            <Typography
              variant={'body2'}
              color={'text.secondary'}
              sx={{ fontStyle: 'italic', whiteSpace: 'pre-line' }}
            >
              {message.text}
            </Typography>
          )}
        </Box>
        <Typography variant={'caption'} color={'text.secondary'} sx={{ alignSelf: align }}>
          {time}
        </Typography>
      </Stack>
    )
  }

  // a failed request: the error text is the message
  if (message.status === 'error') {
    return (
      <Stack spacing={0.5} sx={{ maxWidth: '70%', alignSelf: align }}>
        <Box sx={{ paddingX: 1.5, paddingY: 1, borderRadius: 2, backgroundColor: 'error.main' }}>
          <Typography variant={'body2'} color={'error.contrastText'}>
            {message.text}
          </Typography>
        </Box>
        <Typography variant={'caption'} color={'text.secondary'} sx={{ alignSelf: align }}>
          {time}
        </Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={0.5} sx={{ maxWidth: '70%', alignSelf: align }}>
      {message.thinking && (
        // the reasoning folds above the answer
        <>
          <IconButton
            size={'small'}
            onClick={() => setThinkingOpen(!thinkingOpen)}
            sx={{ alignSelf: align, px: 1, width: 'fit-content', borderRadius: 2 }}
          >
            <Stack direction={'row'} spacing={0.7} alignItems={'center'}>
              {thinkingOpen ? (
                <ExpandLess sx={{ fontSize: 16 }} />
              ) : (
                <ExpandMore sx={{ fontSize: 16 }} />
              )}
              <Typography variant={'caption'} color={'text.secondary'}>
                {t('main.t_thinking')}
              </Typography>
            </Stack>
          </IconButton>
          <Collapse in={thinkingOpen} sx={{ alignSelf: align }}>
            <Box
              sx={{
                paddingX: 1.5,
                paddingY: 1,
                borderRadius: 2,
                backgroundColor: 'panel.main',
                maxWidth: '100%',
              }}
            >
              <Typography
                variant={'body2'}
                color={'text.secondary'}
                sx={{ whiteSpace: 'pre-line' }}
              >
                {message.thinking}
              </Typography>
            </Box>
          </Collapse>
        </>
      )}
      <Box
        sx={{ paddingX: 1.5, paddingY: 1, borderRadius: 2, ...BUBBLES[isUser ? 'user' : 'model'] }}
      >
        <Typography
          variant={'body2'}
          color={message.text ? undefined : 'text.secondary'}
          sx={{ whiteSpace: 'pre-line' }}
        >
          {/* the growing answer shows the placeholder until the first text */}
          {message.text ||
            (message.status === 'progress' ? t('main.t_generating') : t('main.t_empty_answer'))}
        </Typography>
      </Box>
      <Typography variant={'caption'} color={'text.secondary'} sx={{ alignSelf: align }}>
        {[message.model, time].filter(Boolean).join(' · ')}
      </Typography>
    </Stack>
  )
}

MessageView.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number,
    provider: PropTypes.string,
    model: PropTypes.string,
    status: PropTypes.oneOf(['complete', 'progress', 'cancelled', 'error']).isRequired,
    text: PropTypes.string.isRequired,
    thinking: PropTypes.string,
    created_at: PropTypes.number.isRequired,
  }).isRequired,
}

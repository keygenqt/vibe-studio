/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { Avatar, Box, Card, CardActionArea, Chip, Stack, Typography } from '@mui/material'
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined'

export function ProviderCard(props) {
  const { provider } = props
  return (
    <Card variant={'outlined'} sx={{ borderRadius: 2, flexShrink: 0 }}>
      <CardActionArea onClick={props.onConfigure}>
        <Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ p: 2 }}>
          <Avatar
            sx={{
              bgcolor: props.color ?? 'secondary.main',
              color: 'secondary.contrastText',
              fontWeight: 600,
            }}
          >
            <Box component={'span'} sx={{ position: 'relative', top: '1px' }}>
              {provider.name.charAt(0)}
            </Box>
          </Avatar>
          <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack
              direction={'row'}
              spacing={1}
              rowGap={0.5}
              alignItems={'center'}
              flexWrap={'wrap'}
            >
              <Typography fontWeight={600} noWrap sx={{ minWidth: 0 }}>
                {provider.name}
              </Typography>
              {provider.name.toLowerCase() !== provider.provider.toLowerCase() && (
                <Chip
                  size={'small'}
                  label={provider.provider}
                  sx={{ backgroundColor: 'action.hover', height: 24 }}
                />
              )}
            </Stack>
            <Typography variant={'body2'} noWrap sx={{ fontFamily: 'monospace' }}>
              {provider.host}
            </Typography>
          </Stack>
          <ChevronRightOutlined color={'action'} />
        </Stack>
      </CardActionArea>
    </Card>
  )
}

ProviderCard.propTypes = {
  provider: PropTypes.shape({
    name: PropTypes.string.isRequired,
    provider: PropTypes.string.isRequired,
    host: PropTypes.string.isRequired,
  }).isRequired,
  color: PropTypes.string,
  onConfigure: PropTypes.func.isRequired,
}

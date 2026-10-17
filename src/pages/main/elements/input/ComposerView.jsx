/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, IconButton, Stack, TextField } from '@mui/material'
import Send from '@mui/icons-material/Send'

export function ComposerView() {
  const { t } = useTranslation()
  const [value, setValue] = React.useState('')

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          borderRadius: '8px',
          backgroundColor: 'background.paper',
          paddingX: 2,
          paddingY: 1,
        }}
      >
        <TextField
          multiline
          maxRows={6}
          fullWidth
          variant="standard"
          placeholder={t('main.t_placeholder')}
          value={value}
          onChange={event => setValue(event.target.value)}
          slotProps={{
            input: { disableUnderline: true },
          }}
        />
      </Box>

      <Box
        sx={{
          paddingTop: '6px',
        }}
      >
        <IconButton color="primary" size="small">
          <Send />
        </IconButton>
      </Box>
    </Stack>
  )
}

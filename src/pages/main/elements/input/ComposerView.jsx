/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, IconButton, Stack, TextField } from '@mui/material'
import Send from '@mui/icons-material/Send'

export function ComposerView(props) {
  const { t } = useTranslation()
  const [value, setValue] = React.useState('')

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        height: props.height,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          height: '100%',
          borderRadius: 2,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          paddingY: 1,
          paddingBottom: 1,
          paddingLeft: 2,
          paddingRight: 1,
        }}
      >
        <TextField
          multiline
          fullWidth
          variant="standard"
          placeholder={t('main.t_placeholder')}
          value={value}
          onChange={event => setValue(event.target.value)}
          sx={{ height: '100%' }}
          slotProps={{
            input: { disableUnderline: true, sx: { height: '100%', alignItems: 'flex-start' } },
            htmlInput: { sx: { height: '100% !important', overflowY: 'auto !important' } },
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

ComposerView.propTypes = {
  height: PropTypes.number.isRequired,
}

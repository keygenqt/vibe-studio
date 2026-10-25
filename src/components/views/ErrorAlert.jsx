/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { Alert, Box, Collapse, Stack } from '@mui/material'
import ErrorRounded from '@mui/icons-material/ErrorRounded'

// inline error banner, same layout as SuccessAlert; stays until dismissed
export function ErrorAlert(props) {
  return (
    <Box>
      <Collapse in={props.open} unmountOnExit>
        <Stack spacing={2}>
          <Alert
            severity={'error'}
            icon={
              <ErrorRounded
                sx={theme => ({
                  color:
                    theme.palette.mode === 'light'
                      ? theme.darken(theme.palette.error.light, 0.6)
                      : theme.lighten(theme.palette.error.light, 0.6),
                })}
              />
            }
            onClose={props.onClose}
            sx={{ borderRadius: 2 }}
          >
            {props.text}
          </Alert>
          <Box />
        </Stack>
      </Collapse>
    </Box>
  )
}

ErrorAlert.propTypes = {
  open: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
}

/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Collapsible info banner with a close action.
 */
import PropTypes from 'prop-types'
import { Alert, Box, Collapse, Stack } from '@mui/material'
import InfoRounded from '@mui/icons-material/InfoRounded'

export function InfoAlert(props) {
  return (
    <Box>
      <Collapse in={props.open} unmountOnExit>
        <Stack spacing={2}>
          <Alert
            severity={'info'}
            icon={
              <InfoRounded
                sx={theme => ({
                  color:
                    theme.palette.mode === 'light'
                      ? theme.darken(theme.palette.info.light, 0.6)
                      : theme.lighten(theme.palette.info.light, 0.6),
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

InfoAlert.propTypes = {
  open: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
}

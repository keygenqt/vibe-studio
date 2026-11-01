/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The info snackbar: the page-scoped info toast.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { Alert, Snackbar, useTheme } from '@mui/material'
import Fade from '@mui/material/Fade'
import InfoRounded from '@mui/icons-material/InfoRounded'

export function InfoSnackbar(props) {
  const theme = useTheme()
  // the last text stays through the exit transition: nulling it at
  // once would blank the alert while the fade is still running
  const [text, setText] = React.useState(null)
  if (props.text !== null && props.text !== text) setText(props.text)

  return (
    <Snackbar
      open={props.text !== null}
      autoHideDuration={theme.transitions.duration.autoHide}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slots={{ transition: Fade }}
      onClose={props.onClose}
      sx={{
        '&.MuiSnackbar-root': { bottom: 20, left: 20 },
        '& .MuiAlert-action': { pl: 1.5 },
      }}
    >
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
        sx={theme => ({
          borderRadius: 2,
          border: 1,
          borderColor: theme.alpha(theme.palette.info.main, 0.3),
        })}
      >
        {text}
      </Alert>
    </Snackbar>
  )
}

InfoSnackbar.propTypes = {
  text: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}

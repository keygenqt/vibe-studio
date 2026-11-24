/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'theme']
 * INFO: The app page frame: the rail and the error toast.
 */
import PropTypes from 'prop-types'
import { Box } from '@mui/material'

import { RailView } from './elements/RailView'
import { ErrorSnackbar } from '../components'
import { UiMethod, useError } from '../../core'

export function BaseLayout(props) {
  // the shell owns the single error toast: the pages raise it through UiMethod
  const { error } = useError()
  return (
    <>
      <ErrorSnackbar text={error} onClose={() => UiMethod.clearError()} />
      <Box
        height={1}
        boxSizing={'border-box'}
        sx={theme => ({
          p: `0 10px 10px`,
          // the title bar rides the app frame: the page frame is the rail row
          display: 'flex',
          gap: 1,
          overflow: 'hidden',
          backgroundColor: 'background.default',
          // the native widgets (spin buttons, scrollbars) follow the theme scheme
          colorScheme: theme.palette.mode,
        })}
      >
        <Box sx={{ flexShrink: 0 }}>
          <RailView actions={props.railActions} footer={props.railFooter} />
        </Box>
        {props.children}
      </Box>
    </>
  )
}

BaseLayout.propTypes = {
  railActions: PropTypes.node,
  railFooter: PropTypes.node,
  children: PropTypes.node,
}

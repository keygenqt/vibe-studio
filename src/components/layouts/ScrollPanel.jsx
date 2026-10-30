/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: A paper panel wrapping its content in a scroll area.
 */
import PropTypes from 'prop-types'
import { Box } from '@mui/material'

export function ScrollPanel(props) {
  return (
    <Box
      className={'ScrollFrame'}
      sx={{
        flexGrow: 1,
        minHeight: 0,
        boxSizing: 'border-box',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        p: 1,
        ...props.sx,
      }}
    >
      <Box sx={{ height: 1 }}>
        <Box
          className={'ScrollArea'}
          data-scroll-key={props.scrollKey}
          sx={{ height: 1, p: 1, boxSizing: 'border-box' }}
        >
          {props.children}
        </Box>
      </Box>
    </Box>
  )
}

ScrollPanel.propTypes = {
  scrollKey: PropTypes.string,
  sx: PropTypes.object,
  children: PropTypes.node,
}

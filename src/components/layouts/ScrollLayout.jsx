/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The scroll zone: a paper panel wrapping its content in a scroll area.
 */
import PropTypes from 'prop-types'
import { Box } from '@mui/material'

import { OutletLayout } from './OutletLayout'

export function ScrollLayout(props) {
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
          data-scroll-follow={props.follow || undefined}
          sx={{
            height: 1,
            p: 1,
            boxSizing: 'border-box',
            // the follow areas own their scroll — the browser anchoring
            // adjusts against the follow pin and leaves the view above
            overflowAnchor: props.follow ? 'none' : undefined,
          }}
        >
          <OutletLayout ready={props.ready ?? true} error={props.error}>
            {props.children}
          </OutletLayout>
        </Box>
      </Box>
    </Box>
  )
}

ScrollLayout.propTypes = {
  scrollKey: PropTypes.string,
  // the follow mode: pins to the bottom while the user sits at it
  follow: PropTypes.bool,
  sx: PropTypes.object,
  ready: PropTypes.bool,
  error: PropTypes.string,
  children: PropTypes.node,
}

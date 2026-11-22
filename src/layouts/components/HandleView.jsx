/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Drag handle strip for size dragging.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { Box } from '@mui/material'

export function HandleView(props) {
  const vertical = props.orientation === 'vertical'
  // the color rides the grab, not the hover: the pointer may leave
  // the strip mid-drag, the capture keeps the state honest
  const [captured, setCaptured] = React.useState(false)
  const onDown = event => {
    // the capture pins the pointer to the handle: the release event
    // arrives even when the pointer drops outside the window
    event.currentTarget.setPointerCapture(event.pointerId)
    setCaptured(true)
    props.onPointerDown?.(event)
  }
  const onRelease = event => {
    setCaptured(false)
    props.onPointerUp?.(event)
  }
  return (
    <Box
      onPointerDown={onDown}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      sx={{
        width: vertical ? '3px' : 40,
        height: vertical ? 40 : '3px',
        flexShrink: 0,
        alignSelf: 'center',
        borderRadius: 2,
        backgroundColor: captured ? 'primary.main' : 'divider',
        cursor: vertical ? 'col-resize' : 'row-resize',
      }}
    />
  )
}

HandleView.propTypes = {
  orientation: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
  onPointerDown: PropTypes.func,
  onPointerUp: PropTypes.func,
}

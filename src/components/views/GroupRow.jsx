/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Group row: title, description and a control that moves below when narrow.
 */
import PropTypes from 'prop-types'
import * as React from 'react'
import { Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

export function GroupRow(props) {
  const theme = useTheme()
  const rootRef = React.useRef(null)
  const [compact, setCompact] = React.useState(false)
  const fluid = props.fluid !== false

  React.useEffect(() => {
    const node = rootRef.current
    if (!fluid || !node) return undefined
    const observer = new ResizeObserver(entries => {
      setCompact(entries[0].contentRect.width < theme.layout.compactWidth)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [fluid, theme])

  return (
    <Stack
      ref={rootRef}
      direction={compact ? 'column' : 'row'}
      spacing={2}
      alignItems={compact ? 'flex-start' : 'center'}
      sx={{ p: 2 }}
    >
      <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography fontWeight={600}>{props.title}</Typography>
        {props.description && (
          <Typography variant={'body2'} color={'text.secondary'}>
            {props.description}
          </Typography>
        )}
      </Stack>
      <Stack
        sx={{
          flexShrink: 0,
          // a fluid control stretches over the slot; the control itself stays dumb
          ...(compact && fluid ? { width: 1, '& > *': { minWidth: 1 } } : {}),
        }}
      >
        {props.children}
      </Stack>
    </Stack>
  )
}

GroupRow.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  fluid: PropTypes.bool,
  children: PropTypes.node,
}

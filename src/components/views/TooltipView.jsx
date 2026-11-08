/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The themed tooltip: the shared bubble with the theme background and border.
 */
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'

// the docs pattern: the popper carries the class, the tooltip and
// the arrow are themed through it
const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip arrow {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  // the popper-level shadow paints both the bubble and the arrow:
  // the paper arrow stays visible over the light background
  filter: 'drop-shadow(0 1px 4px rgba(0, 0, 0, 0.25))',
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}))

export function TooltipView(props) {
  return (
    <StyledTooltip
      arrow
      title={props.title}
      placement={props.placement ?? 'top'}
      slotProps={{
        popper: {
          modifiers: [{ name: 'preventOverflow', options: { padding: 10 } }],
        },
      }}
    >
      {props.children}
    </StyledTooltip>
  )
}

TooltipView.propTypes = {
  children: PropTypes.element.isRequired,
  // the tooltip content, a node
  title: PropTypes.node.isRequired,
  placement: PropTypes.string,
}

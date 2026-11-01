/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The chat title bar: the chat name with the rename action.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Box, CircularProgress, Typography } from '@mui/material'
import Refresh from '@mui/icons-material/Refresh'

import { TooltipIconButton } from '../../../components/buttons'
import { ErrorSnackbar } from '../../../components/snackbars'

export function ChatTitleView(props) {
  const { t } = useTranslation()
  const [renaming, setRenaming] = React.useState(false)
  const [error, setError] = React.useState(null)

  const onRename = () => {
    if (renaming) return
    setRenaming(true)
    Promise.resolve(props.onRename())
      .catch(error => setError(t(String(error))))
      .finally(() => setRenaming(false))
  }

  return (
    <>
      <Box
        sx={{
          flexShrink: 0,
          minHeight: 45,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 2,
          backgroundColor: 'background.paper',
          boxSizing: 'border-box',
          px: 2,
          py: 1,
        }}
      >
        <Typography
          variant={'h5'}
          fontWeight={500}
          color={'text.primary'}
          noWrap
          sx={{ minWidth: 0 }}
        >
          {props.name}
        </Typography>
        {props.canRename && (
          <TooltipIconButton size={'mini'} title={t('main.t_chat_rename')} onClick={onRename}>
            {renaming ? <CircularProgress size={20} color={'inherit'} /> : <Refresh />}
          </TooltipIconButton>
        )}
      </Box>
      <ErrorSnackbar text={error} onClose={() => setError(null)} />
    </>
  )
}

ChatTitleView.propTypes = {
  name: PropTypes.string.isRequired,
  canRename: PropTypes.bool,
  onRename: PropTypes.func.isRequired,
}

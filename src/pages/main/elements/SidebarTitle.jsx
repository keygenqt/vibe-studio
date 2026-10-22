/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import { Stack, Typography } from '@mui/material'
import Add from '@mui/icons-material/Add'

import { TooltipIconButton } from '../../../components/buttons'

export function SidebarTitle() {
  return (
    <Stack
      width={1}
      direction={'row'}
      spacing={1}
      sx={{
        justifyContent: 'space-between',
      }}
    >
      <Typography variant={'h5'} fontWeight={500} color={'text.primary'}>
        {'Assistants'}
      </Typography>
      <TooltipIconButton size={'mini'} title={'Add assistant'}>
        <Add />
      </TooltipIconButton>
    </Stack>
  )
}

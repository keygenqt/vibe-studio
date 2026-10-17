/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { Box, List } from '@mui/material'

import { SidebarItem } from './SidebarItem'

// demo data until chat state exists
const DEMO_CHATS = [
  { id: 1, title: 'Vibe Studio: main layout', active: true },
  { id: 2, title: 'Rust backend: streaming responses' },
  { id: 3, title: 'Tauri 2: window focus tracking' },
  { id: 4, title: 'Redux slice for chat state' },
  { id: 5, title: 'i18n: ru / en / cn keys' },
  { id: 6, title: 'MUI theme: paper tokens' },
]

export function SidebarView() {
  return (
    <Box height={1} sx={{ overflowY: 'auto', py: '8px' }}>
      <List dense disablePadding>
        {DEMO_CHATS.map(chat => (
          <SidebarItem key={chat.id} chat={chat} />
        ))}
      </List>
    </Box>
  )
}

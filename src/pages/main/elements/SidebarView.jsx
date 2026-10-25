/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import { List } from "@mui/material";

import { SidebarItem } from "../../../components/views";

// demo data until chat state exists
const DEMO_CHATS = [
  { id: 1, title: "Vibe Studio: main layout", active: true },
  { id: 2, title: "Rust backend: streaming responses" },
  { id: 3, title: "Tauri 2: window focus tracking" },
  { id: 4, title: "Redux slice for chat state" },
  { id: 5, title: "i18n: ru / en / cn keys" },
  { id: 6, title: "MUI theme: paper tokens" },
];

export function SidebarView() {
  return (
    <List
      dense
      disablePadding
      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
    >
      {DEMO_CHATS.map((chat) => (
        <SidebarItem key={chat.id} title={chat.title} active={chat.active} />
      ))}
    </List>
  );
}

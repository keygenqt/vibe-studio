// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use serde::Serialize;

use studio_core::ChatData;
use studio_core::GroupChatData;
use studio_core::GroupChatHistoryData;
use studio_core::Store;

/// The fresh state of the groups chat block, returned by every
/// mutation of the block: Rust assembles it, JS renders it.
#[derive(Serialize)]
pub struct GroupsChatData {
    pub groups_chat: Vec<GroupChatData>,
    pub chats: Vec<ChatData>,
    pub history: Vec<GroupChatHistoryData>,
}

impl GroupsChatData {
    /// Assembles the fresh state of the groups chat block.
    pub(crate) fn new(store: &Store) -> Self {
        Self {
            groups_chat: studio_core::get_groups_chat(store),
            chats: studio_core::get_chats(store),
            history: studio_core::get_group_chat_histories(store),
        }
    }
}

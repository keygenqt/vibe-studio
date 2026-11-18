// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The fresh state of the chat block, assembled by Rust for JS.

use serde::Serialize;

use studio_core::ChatData;
use studio_core::Store;

use super::chat_stats::ChatStatsData;

/// The fresh state of the chat block, returned by every mutation of
/// the block: Rust assembles it, JS renders it.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatStateData {
    pub chat: Option<ChatData>,
    pub stats: ChatStatsData,
    pub history: Vec<studio_core::ChatHistoryData>,
}

impl ChatStateData {
    /// Assembles the fresh state of the chat block.
    pub(crate) fn new(store: &Store, chat_id: i32) -> Self {
        let history = studio_core::chat_get_history(store, chat_id).unwrap_or_default();
        Self {
            chat: studio_core::get_chat(store, chat_id).ok(),
            stats: ChatStatsData::of(&history),
            history,
        }
    }
}

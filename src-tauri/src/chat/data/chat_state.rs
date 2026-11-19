// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The fresh state of the chat block, assembled by Rust for JS.

use serde::Serialize;

use studio_core::Store;

use super::chat_history_data::ChatHistoryData;
use super::chat_stats::ChatStatsData;
use crate::groups_chat::data::chat_data::ChatData;

/// The fresh state of the chat block, returned by every mutation of
/// the block: Rust assembles it, JS renders it.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatStateData {
    pub chat: Option<ChatData>,
    pub stats: ChatStatsData,
    pub history: Vec<ChatHistoryData>,
}

impl ChatStateData {
    /// Assembles the fresh state of the chat block.
    pub(crate) fn new(store: &Store, chat_id: i32) -> Self {
        let history = studio_core::chat_get_history(store, chat_id).unwrap_or_default();
        Self {
            chat: ChatData::row(store, chat_id),
            stats: ChatStatsData::of(&history),
            history: history.into_iter().map(ChatHistoryData::from).collect(),
        }
    }
}

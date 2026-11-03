// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The fresh state of the chat block, assembled by Rust for JS.

use serde::Serialize;

use studio_core::ChatData;
use studio_core::ChatHistoryData;
use studio_core::Store;

/// The usage stats of a chat: Rust computes them, JS renders them.
#[derive(Serialize)]
pub struct ChatStatsData {
    /// Estimated tokens of every message text together.
    pub tokens: i64,
    /// Speed of the newest answer with a measured generation time;
    /// `null` = not measured yet.
    pub tokens_per_second: Option<f64>,
    /// Number of the messages.
    pub messages: usize,
}

impl ChatStatsData {
    /// Sums the message tokens and takes the speed of the newest
    /// measured answer.
    pub(crate) fn of(history: &[ChatHistoryData]) -> Self {
        let tokens_per_second = history
            .iter()
            .rev()
            .filter_map(|message| match (message.tokens, message.gen_ms) {
                (Some(tokens), Some(gen_ms)) if gen_ms > 0 => Some(f64::from(tokens) / (f64::from(gen_ms) / 1000.0)),
                _ => None,
            })
            .next();
        Self {
            tokens: history.iter().filter_map(|message| message.tokens).map(i64::from).sum(),
            tokens_per_second,
            messages: history.len(),
        }
    }
}

/// The fresh state of the chat block, returned by every mutation of
/// the block: Rust assembles it, JS renders it.
#[derive(Serialize)]
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
            chat: studio_core::get_chat(store, chat_id).ok(),
            stats: ChatStatsData::of(&history),
            history,
        }
    }
}

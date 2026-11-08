// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The fresh state of the chat block, assembled by Rust for JS.

use serde::Serialize;

use studio_core::ChatData;
use studio_core::ChatHistoryData;
use studio_core::ChatMessageType;
use studio_core::Store;

/// The usage stats of a chat: Rust computes them, JS renders them.
#[derive(Serialize)]
pub struct ChatStatsData {
    /// Estimated tokens of every message text together.
    pub tokens_answer: i64,
    /// Estimated tokens of the thinking together.
    pub tokens_thinking: i64,
    /// Estimated tokens of the translations together.
    pub tokens_translate: i64,
    /// Estimated tokens of the summaries together.
    pub tokens_summary: i64,
    /// Estimated tokens of the compressed bases together.
    pub tokens_compress: i64,
    /// The breakdown together.
    pub tokens_total: i64,
    /// Tokens of the last counted call's prompt: user + system +
    /// history — the context size as it stands; `null` = no counted
    /// call yet.
    pub tokens_input: Option<i64>,
    /// The breakdown of that call: user / system / history —
    /// serialized as the array `[user, system, history]`.
    pub tokens_input_breakdown: Option<(i64, i64, i64)>,
    /// Weighted average speed over the measured answers —
    /// Σ tokens / Σ time; `null` = nothing measured yet.
    pub tokens_per_second: Option<f64>,
    /// Number of the messages.
    pub messages: usize,
    /// The attachments of the user messages together.
    pub attachments: usize,
    /// The size of the attachments together, bytes.
    pub attachments_bytes: i64,
}

impl ChatStatsData {
    /// Sums the token breakdown over the history, takes the last
    /// counted call as the context size and averages the measured
    /// speeds.
    pub(crate) fn of(history: &[ChatHistoryData]) -> Self {
        // the speed: every measured answer together — Σ tokens / Σ ms,
        // the thinking stays out of the measured window
        let (measured_tokens, measured_ms): (i64, i64) = history
            .iter()
            .filter_map(|message| match (message.tokens_answer, message.tokens_gen_ms) {
                (Some(tokens), Some(gen_ms)) if gen_ms > 0 => Some((i64::from(tokens), i64::from(gen_ms))),
                _ => None,
            })
            .fold((0, 0), |(tokens, ms), (one, other)| (tokens + one, ms + other));
        let tokens_per_second = (measured_ms > 0).then(|| measured_tokens as f64 / measured_ms as f64 * 1000.0);
        // the output: only the model answers — the user rows keep
        // their prompt tokens in the same column
        let tokens_answer: i64 = history
            .iter()
            .filter(|message| message.message_type == ChatMessageType::Assistant)
            .filter_map(|message| message.tokens_answer)
            .map(i64::from)
            .sum();
        // the input: the last counted call — the context size as it stands
        let counted = history.iter().rev().find(|message| message.tokens_user.is_some());
        let (tokens_input, tokens_input_breakdown) = counted
            .map(|message| {
                let user = i64::from(message.tokens_user.unwrap_or(0));
                let system = i64::from(message.tokens_system.unwrap_or(0));
                let history = i64::from(message.tokens_history.unwrap_or(0));
                (Some(user + system + history), Some((user, system, history)))
            })
            .unwrap_or((None, None));
        let tokens_thinking: i64 = history
            .iter()
            .filter_map(|message| message.tokens_thinking)
            .map(i64::from)
            .sum();
        let tokens_translate: i64 = history
            .iter()
            .filter_map(|message| message.tokens_translate)
            .map(i64::from)
            .sum();
        let tokens_summary: i64 = history
            .iter()
            .filter_map(|message| message.tokens_summary)
            .map(i64::from)
            .sum();
        let tokens_compress: i64 = history
            .iter()
            .filter_map(|message| message.tokens_compress)
            .map(i64::from)
            .sum();
        let attachments: usize = history.iter().map(|message| message.attachments.len()).sum();
        let attachments_bytes: i64 = history
            .iter()
            .flat_map(|message| &message.attachments)
            .map(|attachment| i64::from(attachment.size))
            .sum();
        Self {
            attachments,
            attachments_bytes,
            tokens_answer,
            tokens_thinking,
            tokens_translate,
            tokens_summary,
            tokens_compress,
            tokens_total: tokens_answer + tokens_thinking + tokens_translate + tokens_summary + tokens_compress,
            tokens_input,
            tokens_input_breakdown,
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

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
/// Every figure is a provider-reported fact; what the provider did
/// not report stays out.
#[derive(Serialize)]
pub struct ChatStatsData {
    /// Provider-reported output tokens of the answers together
    /// (thinking included for Ollama).
    pub tokens_output: i64,
    /// Provider-reported reasoning tokens together; a provider that
    /// never reports them keeps this zero.
    pub tokens_thinking: i64,
    /// Provider-reported tokens of the translations together.
    pub tokens_translate: i64,
    /// Provider-reported tokens of the summaries together.
    pub tokens_summary: i64,
    /// Provider-reported tokens of the compress calls together.
    pub tokens_compress: i64,
    /// Provider-reported uncached input tokens of the last counted
    /// call — the context size as measured; `null` = no counted call
    /// yet.
    pub tokens_input: Option<i64>,
    /// Provider-reported cache-hit tokens of that call; `null` = not
    /// reported.
    pub tokens_cached: Option<i64>,
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
    /// Sums the token facts over the history and takes the last
    /// counted call as the context size.
    pub(crate) fn of(history: &[ChatHistoryData]) -> Self {
        // the speed: every measured answer together — Σ tokens / Σ ms,
        // the thinking stays out of the measured window (Ollama
        // inflates the tokens by the thinking it counts in the output)
        let (measured_tokens, measured_ms): (i64, i64) = history
            .iter()
            .filter_map(|message| match (message.tokens_output, message.tokens_gen_ms) {
                (Some(tokens), Some(gen_ms)) if gen_ms > 0 => Some((i64::from(tokens), i64::from(gen_ms))),
                _ => None,
            })
            .fold((0, 0), |(tokens, ms), (one, other)| (tokens + one, ms + other));
        let tokens_per_second = (measured_ms > 0).then(|| measured_tokens as f64 / measured_ms as f64 * 1000.0);
        // the output: only the model answers carry the fact
        let tokens_output: i64 = history
            .iter()
            .filter(|message| message.message_type == ChatMessageType::Assistant)
            .filter_map(|message| message.tokens_output)
            .map(i64::from)
            .sum();
        // the input: the last counted call — the context size as measured
        let counted = history.iter().rev().find(|message| message.tokens_input.is_some());
        let (tokens_input, tokens_cached) = counted
            .map(|message| {
                (
                    message.tokens_input.map(i64::from),
                    message.tokens_cached.map(i64::from),
                )
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
            tokens_output,
            tokens_thinking,
            tokens_translate,
            tokens_summary,
            tokens_compress,
            tokens_input,
            tokens_cached,
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

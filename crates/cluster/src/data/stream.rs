// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The stream delta events and the aggregated stream answer.

/// A live delta of a model answer, as the stream reports it.
#[derive(Debug, Clone, PartialEq)]
pub enum StreamEvent {
    /// A reasoning (thinking) chunk.
    Thinking(String),
    /// A text chunk of the answer.
    Text(String),
}

/// The token and timing report of a stream call, mirrored from
/// `vibe_cluster::PromptStats`; external types never leave the crate.
#[derive(Debug, Clone, Default)]
pub struct StreamStatsData {
    /// Wall time of the whole call, ms: connection, retries,
    /// generation together.
    pub duration_ms: u64,
    /// Tokens of the current message with the inlined files and the
    /// turn's images.
    pub user_tokens: usize,
    /// Tokens of the system prompt.
    pub system_tokens: usize,
    /// Tokens of the conversation history together, images included.
    pub history_tokens: usize,
    /// Tokens of the answer text.
    pub output_tokens: usize,
    /// Tokens of the reasoning output.
    pub thinking_tokens: usize,
}

impl From<vibe_cluster::PromptStats> for StreamStatsData {
    fn from(stats: vibe_cluster::PromptStats) -> Self {
        StreamStatsData {
            duration_ms: stats.duration_ms,
            user_tokens: stats.user_tokens,
            system_tokens: stats.system_tokens,
            history_tokens: stats.history_tokens,
            output_tokens: stats.output_tokens,
            thinking_tokens: stats.thinking_tokens,
        }
    }
}

/// The aggregated answer of a stream call: the full text, the
/// reasoning behind it, and whether the stream was cancelled before
/// the end — the partial text stays in `text`.
#[derive(Debug, Clone, Default)]
pub struct StreamAnswerData {
    /// The full answer text; on cancel — the partial text received.
    pub text: String,
    /// The model reasoning behind the answer.
    pub thinking: Option<String>,
    /// The stream was cancelled before the end.
    pub cancelled: bool,
    /// The token and timing report of the completed call; `None` on
    /// a cancel or a failure.
    pub stats: Option<StreamStatsData>,
}

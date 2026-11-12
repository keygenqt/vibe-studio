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

/// The token and timing report of a call, mirrored from
/// `vibe_cluster::PromptStats`; external types never leave the crate.
/// Every token figure is the provider-reported fact; a figure the
/// provider did not report stays `None`.
#[derive(Debug, Clone, Default)]
pub struct StreamStatsData {
    /// Wall time of the whole call, ms: connection, retries,
    /// generation together.
    pub duration_ms: u64,
    /// Tokens the provider served from its prefix cache.
    pub cached_tokens: Option<usize>,
    /// Uncached input tokens of the call — the context size as
    /// measured by the provider.
    pub input_tokens: Option<usize>,
    /// Tokens of the answer text (thinking included for Ollama).
    pub output_tokens: Option<usize>,
    /// Tokens of the reasoning output; `None` when the provider does
    /// not report them.
    pub thinking_tokens: Option<usize>,
}

impl From<vibe_cluster::PromptStats> for StreamStatsData {
    fn from(stats: vibe_cluster::PromptStats) -> Self {
        StreamStatsData {
            duration_ms: stats.duration_ms,
            cached_tokens: stats.cached_tokens,
            input_tokens: stats.input_tokens,
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

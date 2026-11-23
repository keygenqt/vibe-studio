// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The token and timing report of a call, mirrored from vibe_cluster.

/// The token and timing report of a call, mirrored from
/// `vibe_cluster::PromptStats`; external types never leave the crate.
/// Every token figure is the provider-reported fact; a figure the
/// provider did not report stays `None`.
#[derive(Debug, Clone, Default)]
pub struct StreamStatusData {
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

impl From<vibe_cluster::PromptStats> for StreamStatusData {
    fn from(stats: vibe_cluster::PromptStats) -> Self {
        StreamStatusData {
            duration_ms: stats.duration_ms,
            cached_tokens: stats.cached_tokens,
            input_tokens: stats.input_tokens,
            output_tokens: stats.output_tokens,
            thinking_tokens: stats.thinking_tokens,
        }
    }
}

// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The aggregated answer of a stream call.

use super::StreamStatusData;

/// The aggregated answer of a stream call: the full text, the
/// reasoning behind it, and whether the stream was cancelled before
/// the end — the partial text stays in `text`.
#[derive(Debug, Clone, Default)]
pub struct StreamResultData {
    /// The full answer text; on cancel — the partial text received.
    pub text: String,
    /// The model reasoning behind the answer.
    pub thinking: Option<String>,
    /// The stream was cancelled before the end.
    pub cancelled: bool,
    /// The token and timing report of the completed call; `None` on
    /// a cancel or a failure.
    pub stats: Option<StreamStatusData>,
}

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
}

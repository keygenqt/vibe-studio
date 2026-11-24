// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: A live delta of a model answer, as the stream reports it.

/// A live delta of a model answer, as the stream reports it.
#[derive(Debug, Clone, PartialEq)]
pub enum StreamEventData {
    /// A reasoning (thinking) chunk.
    Thinking(String),
    /// A text chunk of the answer.
    Text(String),
}

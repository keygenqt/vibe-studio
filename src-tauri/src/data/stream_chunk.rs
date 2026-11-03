// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: A live stream delta served to the shell over the command channel.

use serde::Serialize;

/// The kind of the live answer chunk: a thinking delta or the whole
/// balanced answer text.
#[derive(Serialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum StreamChunkKind {
    /// A reasoning (thinking) delta.
    Thinking,
    /// The whole answer text as it stands.
    Snapshot,
}

/// The live answer of the growing stream, sent over the command
/// channel: thinking arrives in deltas, the answer text — as the
/// whole balanced snapshot the shell replaces its copy with.
#[derive(Serialize, Clone)]
pub struct StreamChunk {
    pub kind: StreamChunkKind,
    pub text: String,
}

// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: Live stream snapshots served to the shell over the command channel.

use serde::Serialize;

/// The kind of the live answer chunk — both are whole snapshots the
/// shell replaces its copy with.
#[derive(Serialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum StreamChunkKind {
    /// The whole reasoning as it stands.
    Thinking,
    /// The whole answer text as it stands.
    Text,
}

/// The live answer of the growing stream, sent over the command
/// channel: whole snapshots — the shell replaces its copy, never
/// accumulates.
#[derive(Serialize, Clone)]
pub struct StreamChunk {
    pub kind: StreamChunkKind,
    pub text: String,
}

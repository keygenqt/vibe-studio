// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: A live stream delta served to the shell over the command channel.

use serde::Serialize;

use studio_core::StreamEvent;

/// The kind of a live delta.
#[derive(Serialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum StreamChunkKind {
    /// A reasoning (thinking) chunk.
    Thinking,
    /// A text chunk of the answer.
    Text,
}

/// A live delta of the growing answer, sent over the command channel.
#[derive(Serialize, Clone)]
pub struct StreamChunk {
    pub kind: StreamChunkKind,
    pub delta: String,
}

impl StreamChunk {
    /// Builds the chunk from the cluster stream event.
    pub(crate) fn of(event: &StreamEvent) -> Self {
        match event {
            StreamEvent::Thinking(delta) => Self {
                kind: StreamChunkKind::Thinking,
                delta: delta.clone(),
            },
            StreamEvent::Text(delta) => Self {
                kind: StreamChunkKind::Text,
                delta: delta.clone(),
            },
        }
    }
}

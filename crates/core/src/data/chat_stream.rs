// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The live events of a chat send, delivered to the shell callback.

use studio_states::ChatData;
use studio_states::ChatHistoryData;

/// The live events of a chat send: the stored user message with the
/// born answer row, and the growing answer for the shell. The
/// `UserStored` event carries the fresh block state — the callback
/// runs far from the store and builds nothing itself.
#[derive(Debug, Clone)]
pub enum ChatStreamEvent {
    /// The user message and the empty answer row are stored.
    UserStored {
        /// The fresh chat row.
        chat: Option<ChatData>,
        /// The fresh history with the user message and the answer row.
        history: Vec<ChatHistoryData>,
    },
    /// The whole answer text as it stands, with an open code fence
    /// closed — the shell paints the copy, the store keeps the raw.
    TextSnapshot(String),
    /// A reasoning (thinking) delta.
    Thinking(String),
}

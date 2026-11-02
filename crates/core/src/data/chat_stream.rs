// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The live events of a chat send, delivered to the shell callback.

use studio_states::ChatData;
use studio_states::ChatHistoryData;

use crate::StreamEvent;

/// The live events of a chat send: the stored user message with the
/// born answer row, and the deltas of the growing answer. The
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
    /// A delta of the growing answer.
    Delta(StreamEvent),
}

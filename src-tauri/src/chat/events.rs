// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The chat block event binding.

use super::data::chat_state::ChatStateData;

use crate::events::EventKey;
use crate::events::EventPayload;

impl EventPayload for ChatStateData {
    fn main(&self) -> EventKey {
        EventKey::Chat
    }
    fn key(&self) -> &'static str {
        "chat-update"
    }
}

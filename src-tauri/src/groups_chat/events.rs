// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The groups chat block event binding.

use super::data::groups_chat_state::GroupsChatData;

use crate::events::EventKey;
use crate::events::EventPayload;

impl EventPayload for GroupsChatData {
    fn main(&self) -> EventKey {
        EventKey::GroupsChat
    }
    fn key(&self) -> &'static str {
        "groups-chat-update"
    }
}

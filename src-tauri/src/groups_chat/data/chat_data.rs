// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The chat row wire type, mirrored from studio-core.

use serde::Deserialize;
use serde::Serialize;

use studio_core::Store;

/// A chat inside a group served to the shell: the mirror of the
/// core row.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// Auto-generated name — an English key the UI translates.
    pub name: String,
    /// Id of the group the chat belongs to.
    pub group_chat_id: i32,
}

impl From<studio_core::ChatData> for ChatData {
    fn from(data: studio_core::ChatData) -> Self {
        Self {
            id: data.id,
            name: data.name,
            group_chat_id: data.group_chat_id,
        }
    }
}

impl From<&ChatData> for studio_core::ChatData {
    fn from(data: &ChatData) -> Self {
        Self {
            id: data.id,
            name: data.name.clone(),
            group_chat_id: data.group_chat_id,
        }
    }
}

impl ChatData {
    /// The chat row by id; a gone row reads as `None`.
    pub(crate) fn row(store: &Store, chat_id: i32) -> Option<Self> {
        studio_core::get_chat(store, chat_id).ok().map(Self::from)
    }
}

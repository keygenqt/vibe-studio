// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The chat group wire type, mirrored from studio-core.

use serde::Deserialize;
use serde::Serialize;

/// A chat group served to the shell: the mirror of the core row.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GroupChatData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// User-owned display name of the group.
    pub name: String,
    /// User-owned system prompt; `None` = not set yet.
    pub system_prompt: Option<String>,
    /// Id of the model the group runs on.
    pub model_id: i32,
    /// User-owned avatar icon name; `None` = the first letter.
    pub icon: Option<String>,
    /// User-owned icon color scheme key; `None` = the accent color.
    pub icon_color: Option<String>,
}

impl From<studio_core::GroupChatData> for GroupChatData {
    fn from(data: studio_core::GroupChatData) -> Self {
        Self {
            id: data.id,
            name: data.name,
            system_prompt: data.system_prompt,
            model_id: data.model_id,
            icon: data.icon,
            icon_color: data.icon_color,
        }
    }
}

impl From<&GroupChatData> for studio_core::GroupChatData {
    fn from(data: &GroupChatData) -> Self {
        Self {
            id: data.id,
            name: data.name.clone(),
            system_prompt: data.system_prompt.clone(),
            model_id: data.model_id,
            icon: data.icon.clone(),
            icon_color: data.icon_color.clone(),
        }
    }
}

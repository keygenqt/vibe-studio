// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The group life record wire type, mirrored from studio-core.

use serde::Serialize;

/// The life record of a group served to the shell: the current view
/// state, the app-wide selection, the accumulated counters.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GroupChatHistoryData {
    /// Id of the group this history belongs to.
    pub group_chat_id: i32,
    /// Store-owned: when the row was born; unix millis.
    pub created_at: i64,
    /// Store-owned: the last write to the row; unix millis.
    pub updated_at: i64,
    /// The group block is collapsed — the chat list is hidden.
    pub current_collapsed_group: bool,
    /// The chat list is collapsed to the preview.
    pub current_collapsed_chats: bool,
    /// The chat selected app-wide; `0` = none.
    pub current_active_chat_id: i32,
    /// The group selected app-wide — at most one in the whole table.
    pub current_is_active: bool,
    /// Accumulated: group saves in the update branch.
    pub count_updates: i32,
    /// Accumulated: user selections of the group or of its chat.
    pub count_activations: i32,
    /// Accumulated: chats ever created in the group.
    pub count_chats_created: i32,
}

impl From<studio_core::GroupChatHistoryData> for GroupChatHistoryData {
    fn from(data: studio_core::GroupChatHistoryData) -> Self {
        Self {
            group_chat_id: data.group_chat_id,
            created_at: data.created_at.and_utc().timestamp_millis(),
            updated_at: data.updated_at.and_utc().timestamp_millis(),
            current_collapsed_group: data.current_collapsed_group,
            current_collapsed_chats: data.current_collapsed_chats,
            current_active_chat_id: data.current_active_chat_id,
            current_is_active: data.current_is_active,
            count_updates: data.count_updates,
            count_activations: data.count_activations,
            count_chats_created: data.count_chats_created,
        }
    }
}

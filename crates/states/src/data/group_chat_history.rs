// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The group_chat_history table: per-group view state, selection, counters.

use anyhow::Result;
use chrono::DateTime;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde_with::TimestampMilliSeconds;
use serde_with::serde_as;

use crate::Store;

/// Store-owned bookkeeping default: a missing row reads as the epoch.
fn default_timestamp() -> NaiveDateTime {
    DateTime::UNIX_EPOCH.naive_utc()
}

const DEFAULT_COLLAPSED_GROUP: bool = false;
const DEFAULT_COLLAPSED_CHATS: bool = true;
const DEFAULT_ACTIVE_CHAT_ID: i32 = 0;
const DEFAULT_IS_ACTIVE: bool = false;
const DEFAULT_COUNT_UPDATES: i32 = 0;
const DEFAULT_COUNT_ACTIVATIONS: i32 = 0;
const DEFAULT_COUNT_CHATS_CREATED: i32 = 0;

/// The life record of a group: the current view state and the
/// app-wide selection, plus the accumulated counters. Born with the
/// group — one row per group, `group_chat_id` is the key.
#[serde_as]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct GroupChatHistoryData {
    /// Id of the group this history belongs to.
    pub group_chat_id: i32,

    /// Store-owned: when the row was born; JS gets unix millis.
    #[serde_as(as = "TimestampMilliSeconds<i64>")]
    pub created_at: NaiveDateTime,

    /// Store-owned: the last write to the row; JS gets unix millis.
    #[serde_as(as = "TimestampMilliSeconds<i64>")]
    pub updated_at: NaiveDateTime,

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

impl Default for GroupChatHistoryData {
    /// Untouched history: nothing collapsed, nothing selected, zero counters.
    fn default() -> Self {
        Self {
            group_chat_id: 0,
            created_at: default_timestamp(),
            updated_at: default_timestamp(),
            current_collapsed_group: DEFAULT_COLLAPSED_GROUP,
            current_collapsed_chats: DEFAULT_COLLAPSED_CHATS,
            current_active_chat_id: DEFAULT_ACTIVE_CHAT_ID,
            current_is_active: DEFAULT_IS_ACTIVE,
            count_updates: DEFAULT_COUNT_UPDATES,
            count_activations: DEFAULT_COUNT_ACTIVATIONS,
            count_chats_created: DEFAULT_COUNT_CHATS_CREATED,
        }
    }
}

diesel::table! {
    group_chat_history (group_chat_id) {
        group_chat_id -> Integer,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        current_collapsed_group -> Bool,
        current_collapsed_chats -> Bool,
        current_active_chat_id -> Integer,
        current_is_active -> Bool,
        count_updates -> Integer,
        count_activations -> Integer,
        count_chats_created -> Integer,
    }
}

/// The stored row as diesel reads it; mapped to `GroupChatHistoryData`
/// on the way out.
#[derive(Debug, Clone, Queryable, Selectable)]
#[diesel(table_name = group_chat_history)]
struct GroupChatHistoryRow {
    group_chat_id: i32,
    created_at: NaiveDateTime,
    updated_at: NaiveDateTime,
    current_collapsed_group: bool,
    current_collapsed_chats: bool,
    current_active_chat_id: i32,
    current_is_active: bool,
    count_updates: i32,
    count_activations: i32,
    count_chats_created: i32,
}

impl From<GroupChatHistoryRow> for GroupChatHistoryData {
    fn from(row: GroupChatHistoryRow) -> Self {
        Self {
            group_chat_id: row.group_chat_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            current_collapsed_group: row.current_collapsed_group,
            current_collapsed_chats: row.current_collapsed_chats,
            current_active_chat_id: row.current_active_chat_id,
            current_is_active: row.current_is_active,
            count_updates: row.count_updates,
            count_activations: row.count_activations,
            count_chats_created: row.count_chats_created,
        }
    }
}

/// Values for creating a history row. All other columns receive their
/// defaults from SQLite.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = group_chat_history)]
struct NewGroupChatHistory {
    group_chat_id: i32,
}

/// View-flag values for the generic `Store::save`. `group_chat_id`
/// rides along for the insert branch; on update it rewrites itself.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = group_chat_history)]
struct GroupChatHistoryView {
    group_chat_id: i32,
    current_collapsed_group: bool,
    current_collapsed_chats: bool,
    updated_at: NaiveDateTime,
}

impl Store {
    /// Returns all history rows, ordered by group id.
    pub(crate) fn get_group_chat_histories(&self) -> Result<Vec<GroupChatHistoryData>> {
        let mut histories = self
            .select::<_, GroupChatHistoryRow>(group_chat_history::table)?
            .into_iter()
            .map(GroupChatHistoryData::from)
            .collect::<Vec<_>>();

        histories.sort_by_key(|history| history.group_chat_id);

        Ok(histories)
    }

    /// Creates a history row with database defaults and activates the
    /// fresh group as the single active one. Counters stay zero — the
    /// birth is not a user selection.
    pub(crate) fn create_group_chat_history(&self, group_chat_id: i32) -> Result<GroupChatHistoryData> {
        let row = self.save::<_, _, GroupChatHistoryRow>(
            group_chat_history::table,
            None,
            NewGroupChatHistory { group_chat_id },
        )?;

        self.set_active_group_chat(group_chat_id, None)?;

        Ok(row.into())
    }

    /// Selects the group (`chat_id = None`) or one of its chats.
    ///
    /// The previous selection is cleared and the new one is installed
    /// in a single transaction. The history row must already exist.
    /// Activation counting is performed separately by core through
    /// `bump_group_chat_history_activations`.
    pub(crate) fn set_active_group_chat(&self, group_chat_id: i32, chat_id: Option<i32>) -> Result<()> {
        let now = chrono::Utc::now().naive_utc();
        let active_chat_id = chat_id.unwrap_or(DEFAULT_ACTIVE_CHAT_ID);
        let mut conn = self.lock();

        conn.transaction::<(), anyhow::Error, _>(|conn| {
            diesel::update(group_chat_history::table)
                .set((
                    group_chat_history::current_is_active.eq(false),
                    group_chat_history::current_active_chat_id.eq(DEFAULT_ACTIVE_CHAT_ID),
                ))
                .execute(conn)?;

            let affected = diesel::update(group_chat_history::table.find(group_chat_id))
                .set((
                    group_chat_history::current_is_active.eq(true),
                    group_chat_history::current_active_chat_id.eq(active_chat_id),
                    group_chat_history::updated_at.eq(now),
                ))
                .execute(conn)?;

            anyhow::ensure!(
                affected == 1,
                "cannot activate missing group chat history {group_chat_id}"
            );

            Ok(())
        })?;

        Ok(())
    }

    /// Persists only the view flags. Selection fields and counters are
    /// never round-tripped through this operation.
    pub(crate) fn set_group_chat_view(
        &self,
        group_chat_id: i32,
        collapsed_group: bool,
        collapsed_chats: bool,
    ) -> Result<()> {
        let view = GroupChatHistoryView {
            group_chat_id,
            current_collapsed_group: collapsed_group,
            current_collapsed_chats: collapsed_chats,
            updated_at: chrono::Utc::now().naive_utc(),
        };

        let _: GroupChatHistoryRow = self.save(group_chat_history::table, Some(group_chat_id), view)?;

        Ok(())
    }

    /// Counts a group save in the update branch.
    pub(crate) fn bump_group_chat_history_updates(&self, group_chat_id: i32) -> Result<()> {
        let now = chrono::Utc::now().naive_utc();
        let mut conn = self.lock();

        let affected = diesel::update(group_chat_history::table.find(group_chat_id))
            .set((
                group_chat_history::count_updates.eq(group_chat_history::count_updates + 1),
                group_chat_history::updated_at.eq(now),
            ))
            .execute(&mut *conn)?;

        anyhow::ensure!(
            affected == 1,
            "cannot bump updates: missing group chat history {group_chat_id}"
        );

        Ok(())
    }

    /// Counts a user selection of the group or one of its chats.
    pub(crate) fn bump_group_chat_history_activations(&self, group_chat_id: i32) -> Result<()> {
        let now = chrono::Utc::now().naive_utc();
        let mut conn = self.lock();

        let affected = diesel::update(group_chat_history::table.find(group_chat_id))
            .set((
                group_chat_history::count_activations.eq(group_chat_history::count_activations + 1),
                group_chat_history::updated_at.eq(now),
            ))
            .execute(&mut *conn)?;

        anyhow::ensure!(
            affected == 1,
            "cannot bump activations: missing group chat history {group_chat_id}"
        );

        Ok(())
    }

    /// Counts a chat created in the group.
    pub(crate) fn bump_group_chat_history_chats_created(&self, group_chat_id: i32) -> Result<()> {
        let now = chrono::Utc::now().naive_utc();
        let mut conn = self.lock();

        let affected = diesel::update(group_chat_history::table.find(group_chat_id))
            .set((
                group_chat_history::count_chats_created.eq(group_chat_history::count_chats_created + 1),
                group_chat_history::updated_at.eq(now),
            ))
            .execute(&mut *conn)?;

        anyhow::ensure!(
            affected == 1,
            "cannot bump created chats: missing group chat history {group_chat_id}"
        );

        Ok(())
    }

    /// Clears the selected chat if it points to `chat_id`.
    ///
    /// Used when that chat is deleted. The active group remains active;
    /// no other chat is selected automatically. Returns 1 if the
    /// deleted chat was the selected one.
    pub(crate) fn clear_group_chat_history_selected_chat(&self, chat_id: i32) -> Result<usize> {
        if chat_id == DEFAULT_ACTIVE_CHAT_ID {
            return Ok(0);
        }

        let now = chrono::Utc::now().naive_utc();
        let mut conn = self.lock();

        let affected = diesel::update(group_chat_history::table)
            .filter(group_chat_history::current_active_chat_id.eq(chat_id))
            .set((
                group_chat_history::current_active_chat_id.eq(DEFAULT_ACTIVE_CHAT_ID),
                group_chat_history::updated_at.eq(now),
            ))
            .execute(&mut *conn)?;

        Ok(affected)
    }

    /// Deletes the history row together with its group. Deleting the
    /// active group does not activate another group automatically.
    pub(crate) fn delete_group_chat_history(&self, group_chat_id: i32) -> Result<usize> {
        self.delete(group_chat_history::table, group_chat_id)
    }
}

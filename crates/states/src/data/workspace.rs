// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The workspace table: the shell environment as a single row.

use anyhow::Result;
use diesel::prelude::*;

use crate::Store;

const WORKSPACE_ID: i32 = 1;

/// Defaults for a missing row.
const DEFAULT_SIDE_BAR_COLLAPSED: bool = false;

/// Shell environment: window and panel sizes.
/// A single row (id = 1); a missing row falls back to `Default`.
#[derive(Debug, Clone, PartialEq, Queryable, Identifiable, Selectable, serde::Serialize, serde::Deserialize)]
#[diesel(table_name = workspace)]
#[serde(default)]
pub struct WorkspaceData {
    /// Row id — the single row is 1, JS never sees it.
    #[serde(skip)]
    pub id: i32,
    /// Shell window width, px; `None` = the user has not touched it.
    pub window_width: Option<i32>,
    /// Shell window height, px; `None` = the user has not touched it.
    pub window_height: Option<i32>,
    /// Chat input height, px; `None` = the user has not touched it.
    pub chat_input_size: Option<i32>,
    /// Sidebar width, px; `None` = the user has not touched it.
    pub side_bar_size: Option<i32>,
    /// Sidebar starts collapsed.
    pub side_bar_collapsed: bool,
}

impl Default for WorkspaceData {
    /// Fresh shell environment: untouched sizes.
    fn default() -> Self {
        Self {
            id: WORKSPACE_ID,
            window_width: None,
            window_height: None,
            chat_input_size: None,
            side_bar_size: None,
            side_bar_collapsed: DEFAULT_SIDE_BAR_COLLAPSED,
        }
    }
}

/// Insert or update values: the id is owned by SQLite.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = workspace)]
struct WorkspaceNewData {
    window_width: Option<i32>,
    window_height: Option<i32>,
    chat_input_size: Option<i32>,
    side_bar_size: Option<i32>,
    side_bar_collapsed: bool,
}

/// Drops the id: insert and update values never carry it.
impl From<&WorkspaceData> for WorkspaceNewData {
    fn from(data: &WorkspaceData) -> Self {
        WorkspaceNewData {
            window_width: data.window_width,
            window_height: data.window_height,
            chat_input_size: data.chat_input_size,
            side_bar_size: data.side_bar_size,
            side_bar_collapsed: data.side_bar_collapsed,
        }
    }
}

diesel::table! {
    workspace (id) {
        id -> Integer,
        window_width -> Nullable<Integer>,
        window_height -> Nullable<Integer>,
        chat_input_size -> Nullable<Integer>,
        side_bar_size -> Nullable<Integer>,
        side_bar_collapsed -> Bool,
    }
}

impl Store {
    /// Loads the shell environment; a missing row falls back to `Default`.
    pub(crate) fn get_workspace(&self) -> Result<WorkspaceData> {
        Ok(self.find_by_id(workspace::table, WORKSPACE_ID)?.unwrap_or_default())
    }

    /// Persists the shell environment as the single row, returns it.
    pub(crate) fn save_workspace(&self, workspace: &WorkspaceData) -> Result<WorkspaceData> {
        let values = WorkspaceNewData::from(workspace);
        self.save(workspace::table, Some(WORKSPACE_ID), values)
    }
}

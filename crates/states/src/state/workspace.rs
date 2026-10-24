// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;
use diesel::prelude::*;

use crate::Store;

diesel::table! {
    workspace (id) {
        id -> Integer,
        window_width -> Nullable<Integer>,
        window_height -> Nullable<Integer>,
        chat_input_size -> Nullable<Integer>,
        side_bar_size -> Nullable<Integer>,
        side_bar_collapsed -> Bool,
        theme -> Text,
        locale -> Text,
    }
}

/// Shell environment: window and panel sizes, theme, locale.
/// A single row (id = 1); a missing row falls back to `Default`.
#[derive(
    Debug,
    Clone,
    PartialEq,
    Queryable,
    Identifiable,
    Insertable,
    AsChangeset,
    Selectable,
    serde::Serialize,
    serde::Deserialize,
)]
#[diesel(table_name = workspace)]
#[serde(default)]
pub struct Workspace {
    // row mechanics never reach the JS mirror
    #[serde(skip)]
    pub id: i32,
    // shell layout — None = untouched, the UI shell resolves its own default
    pub window_width: Option<i32>,
    pub window_height: Option<i32>,
    pub chat_input_size: Option<i32>,
    pub side_bar_size: Option<i32>,
    pub side_bar_collapsed: bool,
    // appearance
    pub theme: String,
    pub locale: String,
}

impl Default for Workspace {
    fn default() -> Self {
        Self {
            id: 1,
            window_width: None,
            window_height: None,
            chat_input_size: None,
            side_bar_size: None,
            side_bar_collapsed: false,
            theme: String::from("system"),
            locale: String::from("ru"),
        }
    }
}

impl Store {
    /// Loads the shell environment; a missing row falls back to `Default`.
    pub fn workspace_load(&self) -> Result<Workspace> {
        let mut conn = self.lock();
        Ok(workspace::table
            .find(1)
            .select(Workspace::as_select())
            .first(&mut *conn)
            .optional()?
            .unwrap_or_default())
    }

    /// Persists the shell environment as the single row.
    pub fn workspace_save(&self, workspace: &Workspace) -> Result<()> {
        let mut conn = self.lock();
        diesel::insert_into(workspace::table)
            .values(workspace)
            .on_conflict(workspace::id)
            .do_update()
            .set(workspace)
            .execute(&mut *conn)?;
        Ok(())
    }
}

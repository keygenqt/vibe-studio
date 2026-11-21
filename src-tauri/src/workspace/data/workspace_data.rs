// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The shell environment wire type, mirrored from studio-core.

use serde::Deserialize;
use serde::Serialize;

/// The shell environment served to the shell: the mirror of the core
/// row without its id — the wire shape is owned by this layer.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(default)]
pub struct WorkspaceData {
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
            window_width: None,
            window_height: None,
            chat_input_size: None,
            side_bar_size: None,
            side_bar_collapsed: false,
        }
    }
}

impl From<studio_core::WorkspaceData> for WorkspaceData {
    fn from(data: studio_core::WorkspaceData) -> Self {
        Self {
            window_width: data.window_width,
            window_height: data.window_height,
            chat_input_size: data.chat_input_size,
            side_bar_size: data.side_bar_size,
            side_bar_collapsed: data.side_bar_collapsed,
        }
    }
}

impl From<&WorkspaceData> for studio_core::WorkspaceData {
    fn from(data: &WorkspaceData) -> Self {
        Self {
            window_width: data.window_width,
            window_height: data.window_height,
            chat_input_size: data.chat_input_size,
            side_bar_size: data.side_bar_size,
            side_bar_collapsed: data.side_bar_collapsed,
            // the single row id stays store-owned
            ..studio_core::WorkspaceData::default()
        }
    }
}

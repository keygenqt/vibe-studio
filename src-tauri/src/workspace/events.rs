// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The workspace block event binding.

use super::data::workspace_data::WorkspaceData;

use crate::events::EventKey;
use crate::events::EventPayload;

impl EventPayload for WorkspaceData {
    fn main(&self) -> EventKey {
        EventKey::Workspace
    }
    fn key(&self) -> &'static str {
        "workspace-update"
    }
}

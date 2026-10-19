// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;

use vibe_states::{Storable, Store, Workspace};

/// Loads workspace state; missing or malformed data falls back to
/// `Default` — untouched values stay `None`.
pub(crate) fn workspace_load(store: &Store) -> Workspace {
    Workspace::load(store)
}

pub(crate) fn workspace_save(store: &Store, workspace: &Workspace) -> Result<()> {
    workspace.save(store)
}

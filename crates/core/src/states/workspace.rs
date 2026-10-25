// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;

use studio_states::Store;
use studio_states::Workspace;

/// Loads the shell environment; a missing row falls back to `Default`
/// — untouched values stay `None`.
pub(crate) fn workspace_load(store: &Store) -> Workspace {
    store.workspace_load().unwrap_or_default()
}

/// Persists the shell environment.
pub(crate) fn workspace_save(store: &Store, workspace: &Workspace) -> Result<()> {
    store.workspace_save(workspace)
}

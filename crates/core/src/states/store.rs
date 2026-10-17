// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use std::path::Path;

use anyhow::Result;

use vibe_states::Store;
use vibe_states::constants::DB_FILE;

/// Opens (or creates) the database in the given app data directory.
/// The file name lives in `vibe-states` — the shell never knows it.
pub(crate) fn store_open(dir: &Path) -> Result<Store> {
    Store::open(&dir.join(DB_FILE))
}

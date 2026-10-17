// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use std::sync::Mutex;
use std::sync::MutexGuard;

use diesel::sqlite::SqliteConnection;

/// Embedded SQLite storage. Single connection, single writer.
pub struct Store {
    pub(crate) conn: Mutex<SqliteConnection>,
}

impl Store {
    pub(crate) fn lock(&self) -> MutexGuard<'_, SqliteConnection> {
        self.conn.lock().expect("states store poisoned")
    }
}

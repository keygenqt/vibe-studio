// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use std::fs;
use std::path::Path;
use std::sync::Mutex;

use anyhow::Result;
use diesel::connection::SimpleConnection;
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::MigrationHarness;

use super::migrations::MIGRATIONS;
use super::store::Store;

impl Store {
    /// Opens (or creates) the database and applies pending migrations.
    pub fn open(path: &Path) -> Result<Self> {
        if let Some(dir) = path.parent() {
            fs::create_dir_all(dir)?;
        }
        let mut conn = SqliteConnection::establish(&path.to_string_lossy())?;
        conn.batch_execute("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;")?;
        conn.run_pending_migrations(MIGRATIONS)
            .map_err(|e| anyhow::anyhow!("migration failed: {e}"))?;
        Ok(Self { conn: Mutex::new(conn) })
    }
}

// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

//! Embedded SQLite storage.
//!
//! `Store` owns a single connection, guarded by a mutex: SQLite gives
//! one writer at a time, so a single connection is enough for the
//! whole app.
//!
//! # Submodules
//!
//! - `migrations` — `MIGRATIONS`: migration set embedded into the
//!   binary at compile time.
//! - `open` — `Store::open`: create parent dirs, connect, WAL and
//!   foreign keys pragmas, apply pending migrations.
//! - `raw` — `get_raw`/`set_raw`: KV read and upsert over the
//!   `states` table; only `Storable` impls may use it.
//! - `store` — the `Store` struct itself; `conn` is `pub(crate)` so
//!   nothing outside this crate touches the connection.

pub(crate) mod migrations;
pub(crate) mod open;
pub(crate) mod raw;
pub(crate) mod store;

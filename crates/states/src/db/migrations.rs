// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The migration set embedded into the binary at build time.

use diesel_migrations::EmbeddedMigrations;

/// Migrations embedded into the binary at build time
pub const MIGRATIONS: EmbeddedMigrations = diesel_migrations::embed_migrations!("migrations");

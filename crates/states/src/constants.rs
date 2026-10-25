// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'facts']

/// SQLite database file, created in the app data dir
pub const DB_FILE: &str = "vibe-studio.db";

// Model config defaults: the `ConnectionParams` defaults of
// `vibe-cluster` — a row's NULL resolves to these on read.

/// Default sampling temperature
pub const MODEL_TEMPERATURE_DEFAULT: f64 = 0.7;

/// Default sampling seed
pub const MODEL_SEED_DEFAULT: i64 = 42;

/// Default context window size, tokens
pub const MODEL_NUM_CTX_DEFAULT: i32 = 4096;

/// Default max tokens per generation
pub const MODEL_NUM_PREDICT_DEFAULT: i32 = 2048;

// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! Application state structures and their persistence.
//!
//! Each file owns its table: the diesel `table!`, the public type
//! with the private diesel pair next to it, and the `impl Store`
//! access. A missing row falls back to `Default`, so a fresh store
//! never blocks startup.
//!
//! # Submodules
//!
//! - `provider` — the `providers` table: `ProviderData` and the
//!   get/save/delete API on `Store`.
//! - `provider_model` — the `models` table: `ProviderModelData`, the
//!   provider catalog with sync-owned facts and user-owned config.
//! - `workspace` — the `workspace` table: `WorkspaceData`, the shell
//!   environment as a single row (id = 1).
//!
//! Everything here is `pub(crate)`; the public surface is the flat
//! API in `lib.rs`.

pub(crate) mod provider;
pub(crate) mod provider_model;
pub(crate) mod workspace;

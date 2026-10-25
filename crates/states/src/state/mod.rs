//! Application state structures and their persistence.
//!
//! Each file owns its table: the diesel `table!`, the structure and
//! the `impl Store` access next to it. A missing row falls back to
//! `Default`, so a fresh store never blocks startup.
//!
//! # Submodules
//!
//! - `models` — the `models` table: the provider catalog, sync-owned
//!   facts and user-owned config, CRUD and sync on `Store`.
//! - `provider` — the `providers` table: `Provider`, `ProviderNew`
//!   and the CRUD on `Store`.
//! - `workspace` — the `workspace` table: `Workspace`, the shell
//!   environment as a single row (id = 1), load and save on `Store`.
//!
//! Everything here is `pub(crate)`; the public surface is re-exported
//! in `lib.rs`.

pub(crate) mod models;
pub(crate) mod provider;
pub(crate) mod workspace;

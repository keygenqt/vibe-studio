# AGENTS.md — crates

Rules for Rust workspace crates.

## Files and modules

- `mod.rs` contains only imports and a doc header. The doc header has
  a `# Submodules` section: one bullet per file describing what it
  does in a sentence or two, so the module can be understood from
  `mod.rs` alone.
- One file = one entity: struct, trait, or focused `impl` block.
  `impl Storable` lives next to its struct. The exception is `api.rs`
  — the interface layer groups the exposed surface (see below).
- Internal imports go through the crate root facade (`crate::Store`),
  not through intermediate module paths.

## Interface (api.rs)

- Every module exposes its surface through its own `api.rs`; `lib.rs`
  flattens them with globs and never grows.
- `api.rs` is the single place to control the interface: public
  functions are declared there with a doc comment describing the
  feature, each delegating one line to the implementation. Types
  owned by other crates are re-exported here.
- Implementations behind `api.rs` are `pub(crate)`.
- In `vibe-states` the facade is `lib.rs` itself (flat re-exports).

## Visibility boundary

`pub(crate)` marks the crate's architectural border (e.g. the KV layer
`get_raw`/`set_raw` in `vibe-states`): usable inside the crate, hidden
from other crates. Do not widen it to `pub` without a reason.

## Ownership

- `vibe-states` — persisted data and storage only: structures,
  `Storable`, migrations, SQLite. It knows nothing about resolved
  values or the shell.
- `vibe-core` — features as flat functions: the state facade, platform
  facts (`get_system_theme` via `dark-light`), types derived from
  state. Shell-independent: swapping Tauri for another UI touches
  nothing here.
- Shells (e.g. `src-tauri`) are middlemen: they call flat functions
  and forward events. Features never live in a shell.

## Dependencies

- Minimum set; no "left" dependencies. Justified choices: `diesel`
  (sync, sqlite feature) for storage, `serde` / `serde_json`,
  `anyhow`, `dark-light` (pure-Rust OS theme detection — keeps theme
  detection out of shells).
- New state structures go into `vibe-states/src/state/<name>.rs`:
  struct + `Default` + `impl Storable` (own `KEY`), plus a re-export
  in `vibe-states/src/lib.rs` and functions in
  `vibe-core/src/states/api.rs`.

## Database

- Schema changes only through migrations: one folder per migration,
  `<version>_<name>/up.sql` (+ `down.sql`), applied via
  `PRAGMA user_version` harness in `Store::open`.
- `load` never fails: missing or malformed data falls back to
  `Default`.
- Validate and clamp input values on the Rust side; the UI is not
  trusted.

## Style

- Edition 2024, `anyhow::Result` for fallible functions.
- Derives use full paths (`#[derive(serde::Serialize)]`).
- Diesel: no `serde_json` feature (its `Json` type does not support
  SQLite); JSON values are stored as `TEXT` and serialized manually.

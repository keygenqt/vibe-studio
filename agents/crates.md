# AGENTS.md — crates

Rules of the Rust workspace.

## Common

- `mod.rs` holds only imports and a doc header with a `# Submodules`
  section: one bullet per file, so the module is readable from a
  single `mod.rs`.
- One file = one entity: a struct, a trait, or a focused `impl`
  block. `impl Storable` lives next to its struct.
- `pub(crate)` is the general rule, work through it. The only
  difference is where the library API appears: in core it is
  `api.rs`, in the other crates — `lib.rs`. Nothing goes public
  without a reason.
- Crates know nothing about src-tauri — the UI layer that connects
  the interface and Rust. The UI layer calls flat functions of the
  crates and forwards events; features never live in the UI layer.
- One crate — one task. Core additionally takes tasks that do not
  warrant a separate crate, and solves the api task — the single
  interface of all crates and the whole application.
- `anyhow::Result` for fallible functions; derives use full paths
  (`#[derive(serde::Serialize)]`).

## Vibe Core

- A facade over the other crates: features as flat functions — the
  state facade, platform facts, derived types. The only crate the UI
  layer talks to; built so that it can become an FFI interface
  without a significant rework.
- Every module exposes its surface through its own `api.rs`; `lib.rs`
  flattens them with globs and never grows.
- `api.rs` is the single place controlling the interface: public
  functions with a doc comment, each delegating one line to the
  implementation. Types owned by the other crates are re-exported
  here.

## Vibe State

- An ordinary crate, its whole surface is proxied through core:
  persisted data and storage only — structures, `Storable`,
  migrations, SQLite. It knows nothing about resolved values or the
  UI layer.
- The KV layer `get_raw`/`set_raw` is allowed to `impl Storable`
  only.
- A new state structure goes to `src/state/<name>.rs`: struct +
  `Default` + `impl Storable` (own key), a re-export in
  `src/lib.rs`; the feature functions — in
  `vibe-core/src/states/api.rs`.
- Schema changes only through migrations: one folder per migration,
  `<version>_<name>/up.sql` (+ `down.sql`); the set is embedded into
  the binary and applied in `Store::open` — along with creating the
  directories, WAL and `foreign_keys`.
- `load` never fails: missing or malformed data falls back to
  `Default`.
- Validate and clamp input on the Rust side; the UI is not trusted.
- Diesel without the `serde_json` feature: JSON values are stored as
  TEXT and serialized manually.

# AGENTS.md — crates

Rules of the Rust workspace.

## Common

- Crate naming: `vibe-*` — public general-purpose tools (connected
  externally), `studio-*` — this app's crates.
- `mod.rs` holds only imports and a doc header with a `# Submodules`
  section: one bullet per file; the bullet describes the file's
  purpose, not a list of its methods.
- One file = one entity. Table access lives next to its structure;
  the database connection stays locked inside its owning crate.
- Crates know nothing about src-tauri — the UI layer connecting the
  interface and Rust. The UI layer calls flat functions of the
  crates and forwards events; features never live in the UI layer.
- One crate — one task. Features not worthy of a separate crate
  live in core.
- `anyhow::Result` for fallible functions; derives use full paths
  (`#[derive(serde::Serialize)]`).

## Studio Core

- The main entry point for the UI: it unifies the feature crates
  and gives a single API — state, facts, derived types. Built so
  that it can become an FFI interface without a significant rework.
- Every module exposes its surface through its own `api.rs`; `lib.rs`
  flattens them with globs and never grows.
- `api.rs` is the single place controlling the interface: public
  functions with a doc comment, each delegating one line. Types
  owned by the other crates are re-exported here.
- Synced state has two owners: provider-reported facts are
  overwritten by sync, user-owned values survive it; a failed fetch
  mutates nothing.

## Studio States

- The SQLite owner: state structures, access, migrations. It knows
  nothing about resolved values or the UI layer.
- A new state goes to `src/state/<name>.rs`: the `table!`, the
  structure and the `impl Store` next to it; a re-export in
  `src/lib.rs`; the feature functions — in
  `studio-core/src/states/api.rs`.
- Schema changes only through migrations: one folder per migration,
  `<version>_<name>/up.sql` (+ `down.sql`); the set is embedded into
  the binary and applied in `Store::open`. During development: a new
  table is a separate migration (one migration — one table), a
  changed table is edited in place with replacement; the old
  database is simply deleted.
- Reading never blocks the UI: missing or malformed data falls back
  to `Default` on the Rust side.
- Validate and clamp input on the Rust side; the UI is not trusted.

## Studio Cluster

- The studio layer over `vibe-cluster` — a public general-purpose
  tool connected externally. The app features missing from the
  general tool live here.
- The provider catalog is the single source of kinds, hosts and
  colors: validation in core and the UI forms work only through it.

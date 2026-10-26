# AGENTS.md — crates

Rules of the Rust workspace.

## Common

- Crate naming: `vibe-*` — public general-purpose tools (connected
  externally), `studio-*` — this app's crates.
- `mod.rs` holds only imports and a doc header with a `# Submodules`
  section: one bullet per file; the bullet describes the file's
  purpose, not a list of its methods.
- One file — one entity. Table access lives next to its structure;
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
  and gives a single API. Built so that it can become an FFI
  interface without a significant rework: flat functions, simple
  types.
- The crate's public surface is `lib.rs`: one function per feature,
  each with a doc comment; heavy logic (validation, network) lives
  in private submodules. Types owned by the other crates are
  re-exported here.
- UI input is untrusted and is never fixed: an invalid value is an
  error, a valid one is stored as sent. Data cleaning is the form's
  job, not the store's.

## Studio States

- The SQLite owner: state structures, access, migrations. It knows
  nothing about resolved values or the UI layer.
- A new state is written following an existing file in `src/data/`
  — take the template from a neighbor, do not invent it.
- A state file: the `table!`, the public type (`id: Option<i32>`,
  `None` = not stored) with its private diesel pair — a row for
  reading, values for writing — and the `impl Store` next to it;
  methods are `pub(crate)`.
- The public surface is flat functions in `src/lib.rs`, each
  delegating one line into `Store`; every row leaving the crate is
  resolved — unset user config comes out as the model defaults.
- Generic query primitives live in `db/store.rs`; concrete diesel is
  allowed only where a generic cannot express the query.
- The `Default` of a state struct is an honest zero: nothing stored,
  nothing touched; resolving defaults is the UI's job.
- Schema changes only through migrations: one folder per migration,
  `<version>_<name>/up.sql` (+ `down.sql`); the set is embedded
  into the binary and applied in `Store::open`. During development:
  a new table is a separate migration (one migration — one table),
  a changed table is edited in place with replacement; the old
  database is simply deleted.
- Reading never blocks the UI: missing or malformed data falls back
  to `Default` on the Rust side.

## Studio Cluster

- The studio layer over `vibe-cluster` — a public general-purpose
  tool connected externally. The app features missing from the
  general tool live here.

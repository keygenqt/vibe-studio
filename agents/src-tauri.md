# AGENTS.md — src-tauri

The UI layer on Tauri: a middleman between Rust and JS, a thin
translator of core. Features not directly related to the UI do not
live here.

## Rules

- Depends on `studio-core` only.
- The layer holds no mirror of the state: commands read and write
  the Store directly; Rust is the single source of truth, JS gets
  copies for rendering only.
- Every mutation ends with its block's event carrying the fresh
  state of the collection — not a delta: the actual state is
  assembled by Rust, JS builds nothing on top of it.
- Direction: a block owns a single state — its event carries the
  whole block state in one payload, and the mutation returns it as
  the command answer. The groups chat block follows this; the
  providers block is not migrated yet.
- The layout is flat: `commands.rs` — the JS surface, one command
  per core function and named after it; `events.rs` — the event
  channels of the blocks, a single payload envelope; `data/` —
  types served to the shell.

# AGENTS.md — src-tauri

The UI layer on Tauri: a middleman between Rust and JS, a thin
translator of core. Features not directly related to the UI do not
live here.

## Rules

- Depends on `studio-core` only.
- The layer holds no mirror of the state: commands read and write
  the Store directly; Rust is the single source of truth, JS gets
  copies for rendering only.
- Command errors are `String`.
- The layout is flat: `commands.rs` — the JS surface, one command
  per core function and named after it; `window.rs` — Tauri
  features with no JS surface (window lifecycle); `lib.rs` — the
  app shell: `run()`, the store bootstrap, the `event-state`
  channel.

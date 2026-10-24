# AGENTS.md — src-tauri

The UI layer on Tauri: a middleman between Rust and JS, a thin
translator of core. Features not directly related to the UI do not
live here.

## Rules

- Depends on `studio-core` only.
- The layer holds no mirror of the state: commands read and write
  the Store directly; Rust is the single source of truth, JS gets
  copies for rendering only.
- Any mutation ends with an event to the UI (`event-state`); separate
  platform facts go over their own channels (`event-theme` — the
  system theme).
- Command errors are `String`.
- The layout mirrors core: `states/` — state, `tools/` — facts with
  no state behind them. Module conventions — `agents/crates.md`.
- Inside `states/` two consumers are separated: `react/` — commands
  for JS and the event channel; `tauri/` — Tauri features with no
  JS surface (window lifecycle).

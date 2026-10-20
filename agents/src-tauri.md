# AGENTS.md — src-tauri

The UI layer on Tauri: a middleman between Rust and JS, a thin
translator of core. Features do not live here.

## Rules

- Depends on `vibe-core` only.
- State has a single event channel (`event-state`): any mutation
  ends with an emit.
- Command errors are `String`.
- The layout mirrors core: `states/` — state, `tools/` — facts with
  no state behind them. Module conventions — `agents/crates.md`.
- Inside `states/` two consumers are separated: `react/` — the JS
  mirror (commands, snapshot, `event-state`); `tauri/` — Tauri
  features with no JS surface (window lifecycle).

# AGENTS.md — src-tauri

Tauri shell: a middleman — setup, commands exposed to the UI, and
the state event channel. No features live here.

## Rules

- Depends on `vibe-core` only. Never import `vibe-states` here.
- Commands are synchronous; SQLite operations are cheap enough.
- State pattern: `AppState` (mutex) is the runtime mirror for fast
  sync access, the database is the persistent source of truth,
  saved write-through on change.
- Theme facts live in `vibe-core` (`resolve_theme`,
  `listen_system_theme`); the shell resolves nothing itself. The
  theme-change callback re-emits only while the choice is `system`.
- `states/view.rs::emit_state` is the single event channel
  (`event-state`): any state mutation ends with this emit. Sidebar
  is the exception: component-local, no emit.
- Command errors are `String`: `anyhow::Error` does not serialize
  for Tauri commands.
- Layout: `states/` — store bootstrap, state commands, the event
  channel; `tools/` — shell facts with no state behind them
  (`app_info`). Folders with `mod.rs`, see `crates/AGENTS.md` for
  module conventions.

(Stub — will grow as features are added.)

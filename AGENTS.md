# AGENTS.md

## Project

Vibe Studio — a fast, lightweight desktop client for working with LLMs.
Thin React UI over a Rust backend, built for speed. Pre-alpha.

## Stack

- Tauri 2 — desktop shell (Rust + system webview)
- Rust — backend
- React 19 + MUI 7 — UI
- Redux Toolkit, React Router, i18next (ru / en / cn)

## Commands

```bash
npm install          # install frontend deps
npm run tauri dev    # run the app in dev mode
cargo build          # build the Rust workspace
./scripts/format.sh  # format Rust code
```

## Architecture

Rust owns the state; the UI mirrors it.

```
src/  (React)  →  src-tauri  →  crates/core  →  crates/states
  thin layer       shell         facade         DB owner
```

- `crates/states` — embedded SQLite storage: schema, migrations,
  state structures. Leaf dependency, no knowledge of the shell.
- `crates/core` — facade over sub-crates: domain types + flat API
  functions. UI shells (Tauri now, FFI later) talk only to this crate.
- `src-tauri` — Tauri commands and setup. Depends on `vibe-core` only.
- `src` — React app. Thin layer: Rust is the source of truth, JS
  holds copies only for rendering.

Dependencies point strictly down this chain. Nothing imports
`vibe-states` outside of `vibe-core`.

## AGENTS.md files

Each directory keeps its own AGENTS.md (`crates/`, `src-tauri/`,
`src/`). Rules for updating them:

- General facts only — principles, contracts, boundaries. No
  implementation details: exact values, file lists, signatures and
  literals are conveyed by the tree and the code itself.
- If a fact can be seen from the tree or the files — it does not
  belong here.
- When a change alters the architecture or a contract, update the
  affected AGENTS.md in the same change. A stale rule is worse
  than a missing one.

## Conventions

- Every file starts with the SPDX header (copy from any existing file).
- Comments, identifiers, doc text — English.
- Directory-specific rules live in `AGENTS.md` in `crates/`, `src/`
  and `src-tauri/`; the nearest one up the tree wins.

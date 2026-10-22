# AGENTS.md

## Project

Vibe Studio — a fast, lightweight desktop client for working with
LLMs.

## Principles

Product invariants — the fundamental principles.

- Simplicity and maximum quality.
- The absence of a feature is also a feature.
- Transparent context for the user.
- Speed. Rust does the heavy lifting; the UI is a temporary solution.

## Stack

- Tauri 2 — a thin layer bridging js and rust
- Rust — the main business logic and all the rest of the project
  logic
- React + MUI — a thin top layer, responsible for UI only

## Architecture

```
src (React, thin layer) → src-tauri (UI layer) → crates/core (facade)
  → crates/states (SQLite owner)
```

- Dependencies point strictly down this chain. Nothing imports
  `vibe-states` outside of `vibe-core`.
- Data flow: React invokes commands, the UI layer calls flat
  functions of `vibe-core`, persisted state lives in `vibe-states`;
  any state mutation ends with the `event-state` emit back to the UI.

## Rule files (agents/)

One file per root directory — a project fragment; the first line of
each file is its passport. When work touches a fragment, its file is
given to the session.

- `agents.md` — rules of the agents/ directory itself: how the rule
  files are written and maintained
- `book.md` — user-facing documentation of the project, built with
  mdBook
- `context.md` — tag system: file paths by task
- `crates.md` — rules of the Rust workspace
- `data.md` — files that belong to the repository or the project as
  a whole, but are not part of it directly
- `scripts.md` — shell utilities of the project; a tool for humans,
  not application logic
- `src.md` — React frontend, a thin layer: Rust is the source of
  truth, JS holds copies only for rendering
- `src-tauri.md` — the UI layer on Tauri: a middleman between Rust
  and JS, a thin translator of core

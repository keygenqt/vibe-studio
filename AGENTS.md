# AGENTS.md

## Project

Vibe Studio — a fast, lightweight desktop client for working with
LLMs.

## Principles

Product invariants — the fundamental principles.

- The human acts, the model helps. The model never acts on its own initiative.
- Control by construction. The model initiates nothing — there is nothing to allow.
- Ownership and code understanding over throughput.
- The code works for a human: readability nits and awkward flows are defects too.
- Transparent context. The user curates what the model sees.
- The absence of a feature is also a feature. The project follows
  the contract, not feature sprawl for everyone.
- Simplicity and maximum quality. Depth over breadth.
- Speed. All business logic in Rust.

## Stack

- Tauri 2 — a thin layer bridging js and rust
- Rust — the main business logic and all the rest of the project
  logic
- React + MUI — a thin top layer, responsible for UI only

## Architecture

```
src (React, thin layer) → src-tauri (UI layer) → studio-core
  → feature crates (states, cluster — new ones are added as tasks demand)
```

- studio-core is the main entry point for the UI: it unifies the
  feature crates and gives a single API; features not worthy of a
  separate crate live in it.
- Dependencies point strictly down: the UI layer knows only
  studio-core.
- Data flow: React invokes commands, the UI layer calls flat
  functions of studio-core; any mutation ends with an event back
  to the UI.

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

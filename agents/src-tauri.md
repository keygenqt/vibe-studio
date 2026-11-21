# AGENTS.md — src-tauri

The UI layer on Tauri: a middleman between Rust and JS, a thin
translator of core. Features not directly related to the UI do not
live here.

## Rules

- Depends on `studio-core` only.
- The layer holds no mirror of the state: commands read and write
  the Store directly; Rust is the single source of truth, JS gets
  copies for rendering only.
- The wire is camelCase end to end: serde `rename_all` on the
  payload types, camelCase command arguments. Host-sourced facts
  (the live model catalog) carry scalar fields in camelCase; the
  capability matrix keeps its serde keys as is — they match the
  keys of the stored JSON document.
- Blocks mirror the JS core blocks. A block carries only its
  contract: the command surface, its event bindings and the types
  served to the shell. One entity — one file. A consumer block
  assembles a foreign row through the owner block's assembly
  function (`ChatData::row`), never by reading its table directly.
- Every mutation ends with `OkEmit`: the fresh state is assembled
  by the caller and emitted as a whole — not a delta. A save returns
  the saved entity as the command answer; the other mutations keep
  the fresh state as the answer. Void emitters (the stream forwarder,
  the theme watcher) drop the always-Ok answer.
- A payload type carries its event: the `EventPayload` bindings
  live in the block's `events.rs`, the single sending function and
  the envelope live in the root. A command lives in the block
  owning the changed data, not in the block sourcing the feature.
  The event channels and keys are defined in the owner block: the
  channel-and-key pair lives in its `events.rs`, JS mirrors it in
  its own `tauri.js` — there is no shared key registry.
- A command is registered in its own block; the assembly point
  holds the chain of blocks only. Shell features outside the block
  contract live in utils.

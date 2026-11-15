# AGENTS.md — src

React frontend. A thin layer: Rust is the source of truth, JS holds
copies only for rendering.

## Rules

- Rust data travels through JS in the wire format, as is; a block
  may translate it once on the boundary (`xxxStateSet`) — one
  format per copy.
- `constants/` holds only UI constants that do not touch the
  backend; Rust defaults stay in Rust — the sides share no
  constants.
- Forms are Formik + Yup: client validation is UX, Rust re-validates
  on commit.
- i18n: three locales — ru/en/cn. Blocks mirror `pages/`: one section
  per page (`providers`, `provider`, `models`, `model`, `general`),
  shell keys in `settings`; a key with one consumer lives in its
  block, a shared one — in `common`; a new key lands in all three
  locales in one commit.

## Core

`core/` is the JS-Rust layer, assembled from blocks. A block is a
`<block>/` directory carrying files by role: the role defines the
file, not a fixed set of five. The public surface of a block is its
`index.js` barrel (method, hooks, events); pages import from the
block barrels directly. `core/index.js` is the runtime wiring only:
the `store` and `bindEvents` (the Rust channels of all blocks in
one call).

- `store` — **the copy only**: the block slice, the whole-payload
  `xxxStateSet`, the errors map — `ERRORS` (a key per meaning) +
  `errorsSet` / `errorsClean` / `errorsCleanAll`. No request logic
  and no knowledge of Tauri. The copy holds the data in camelCase;
  the Rust wire format is translated on the boundary in
  `xxxStateSet`.
- `tauri` — **the connection only**: invoke wrappers and channels.
  No dispatch into the copy.
- `events` — **the only writer of the copy from Rust**: the event
  payload → dispatch. Mutations do not dispatch the copy — JS takes
  the fresh state from the event, the mutation answer stays
  undispatched.
- `method` — **mutations only** plus `cleanError`. No `get*`, no
  requests whose result the page needs to show — those belong to the
  hook. Mutations go through the shared `runMutation` envelope: the
  error lands in the block map and is rethrown to the caller, success
  cleans the key.
- `use*` — **all reading**, lives in the block's `hooks/`. One hook —
  one meaning: a collection, a routed row, a choice; the block's
  mount loads live here, the page gets its render data only from the
  hooks. Splitting follows growth: a base hook is not required when
  the meanings stand alone. A hook may return a derived `ready` (a
  null check of its own data) — the page gate; the only stored
  readiness flag is `app` (`useAppReady`), it opens the shell.
- **Query hooks** `use<Query>` — one-shot requests whose result
  lives on a single screen: local state, local error, refetched on
  every mount. They touch no store and no `method` and call Tauri
  directly. The name follows the meaning of the requested data, not
  the command name. The criterion for moving a read out is data
  ownership: a load that writes the block copy belongs to the block
  hook; the answer to a screen's request belongs to a query hook. A
  query hook lives in its block's directory.
- **Errors are always obtainable**: a mount load and a mutation write
  the block map, a query hook holds its error locally. No error ever
  disappears silently; the page cleans through
  `XxxMethod.cleanError(key)`.
- **Pure UI state** — the `ui` block: one per app, it gathers the
  state that lives only in the frontend and has no owner in the Rust
  store or the database (interface flags like `formSuccess`). Such a
  block carries only `store`, `method` and hooks — no `tauri` and no
  `events`; new pure UI state lands here, not in the data blocks.

## Hooks

- `hooks/` — shared React hooks without block data: no copies, no
  dispatch, no block command invokes; side effects target the
  environment only (DOM, window, timers).

## Navigation

- Page paths live in `constants/AppRoutes.js`: a call without
  arguments gives the router pattern, with an id — the concrete URL.
- All navigation goes through `AppNav` (`src/utils`): `open`,
  `openWithReplace`, `back`, `backTo`. A bare `navigate(path)`
  around it breaks the transition journal.
- A mutation returning to the page it came from is a `back`: the
  journal stays clean, no duplicated slots.

## Loading

- A page with data loading gates its content in `WaitState`
  (`components/states`): readiness is the block hook's `ready`.
- A block error is shown by `!ready && errors`: the key comes from
  the block's `ERRORS`, the cleanup — `XxxMethod.cleanError(key)`.
- One row — one command: a page fetches its item by id, never
  derives it from the collection list; the read-through row maps are
  invalidated by a block mutation and refetched on the next open.

## Structure

- An element is a part of its parent (`elements/`, nesting exactly
  one level); a component is a unit that lives its own life
  (`components/<type>/`).
- A page is `pages/<page>/<Page>.jsx`: the route entry and its
  composition; a layout page hosts children through `Outlet`.
- Every top-level zone has an `index.js` barrel; consumers import
  through the zone barrel, inside a zone — relative paths.

## Style

- `.jsx` only for files with JSX markup; everything else — `.js`.
- Styling: `sx={{}}` on MUI, colors as theme tokens, spacing in
  theme units.
- PropTypes on components; constants are the rare exception,
  inline literals by default.

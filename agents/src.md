# AGENTS.md — src

React frontend. A thin layer: Rust is the source of truth, JS holds
copies only for rendering.

## Rules

- Rust data travels through JS in the wire format, as is.
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

`core/` is the single JS surface to Rust. A block is a `<block>/`
directory of five files; below is the contract of each role — the
file is only its carrier.

- `use*` — **all reading**. The page gets its render data only from
  the hook; the copy's mount loads live here too, and so do all Rust
  `get*` calls. One block — one block hook; it returns the data,
  `ready` and `errors`.
- `method` — **mutations only** plus `cleanError`. No `get*`, no
  requests whose result the page needs to show — those belong to the
  hook. Mutations go through the shared `runMutation` envelope: the
  error lands in the block map and is rethrown to the caller, success
  cleans the key.
- `events` — **the only writer of the copy from Rust**: the event
  payload → dispatch. Mutations do not dispatch the copy — JS takes
  the fresh state from the event, the mutation answer stays
  undispatched.
- `store` — **the copy only**: the block slice, the whole-payload
  `xxxStateSet`, the errors map — `ERRORS` (keys) + `errorsSet`
  (merge per key) / `errorsClean` / `errorsCleanAll`. No request
  logic and no knowledge of Tauri.
- `tauri` — **the connection only**: invoke wrappers and channels.
  No dispatch into the copy.
- **Query hooks** `use<Query>` (the name inherits the tauri command)
  — one-shot requests whose result lives on a single screen: local
  state, local error, refetched on every mount. They touch no store
  and no `method` and call Tauri directly. The criterion for moving a
  read out is data ownership: a load that writes the block copy
  belongs to the block hook; the answer to a screen's request belongs
  to a query hook. A query hook lives in its block's directory.
- **Errors are always obtainable**: a mount load and a mutation write
  the block map, a query hook holds its error locally. No error ever
  disappears silently; the page cleans through
  `XxxMethod.cleanError(key)`.
- Pages know neither Tauri nor the store — only `use*` and
  `XxxMethod` through the `core/index.js` barrel.

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

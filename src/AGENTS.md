# AGENTS.md — src

React frontend. Thin layer: Rust is the source of truth, JS holds
copies only for rendering. This file keeps general rules only —
implementation details live in the code.

## Stack

React 19, MUI 7, Redux Toolkit 2, react-router 7, i18next 26,
Vite 8, Tauri 2 (`@tauri-apps/api`).

## Rules

- Backend calls go through `Methods` (`src/modules`) — plain
  `invoke` wrappers, one method per command.
- Rust validates and clamps; apply the returned value after
  `invoke` — the optimistic local value is only a preview.
- Two theme contracts, never mix: UI applies the stored choice
  (`settings.theme`, may be `system`), renders from the resolved
  `theme` — the follow-system option never reaches rendering.
- Redux only for truly global state (theme); page-local UI state
  lives in hooks with direct `invoke`, optimistic update first.
- One state listener: `useEffectStateSync` consumes the snapshot
  and `event-state`. Feature hooks invoke, they do not subscribe
  to state events.
- Effect hooks are named `useEffect*` (`src/base/hooks`); state-
  owner hooks live in the same folder.
- i18n: keys added to all locales together (ru / en / cn).

## Style

- Single quotes (`''`), not double.
- Styling through `sx={{}}` on MUI components; theme tokens for
  colors; spacing in theme units (1, 2, 3) instead of raw px.
- Constants are the rare exception on a static page — inline
  literals by default.
- PropTypes on components.

(Stub — will grow as features are added.)

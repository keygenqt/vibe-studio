/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states', 'theme']
 */
import * as React from "react";
import { listen } from "@tauri-apps/api/event";
import i18next from "i18next";

import {
  CHAT_INPUT_SIZE_DEFAULT,
  CHAT_INPUT_SIZE_MAX,
  CHAT_INPUT_SIZE_MIN,
  SIDE_BAR_SIZE_DEFAULT,
  SIDE_BAR_SIZE_MAX,
  SIDE_BAR_SIZE_MIN,
} from "../constants/AppDefault";
import { Methods } from "../modules";

const WorkspaceContext = React.createContext(null);

/**
 * Single mirror of the Rust workspace: one load on mount, live values
 * over event-state, system theme over event-theme. The only holder of
 * application state in JS — the Redux store never copies it.
 */
function useWorkspaceState() {
  const [raw, setRaw] = React.useState(null);
  const [systemTheme, setSystemTheme] = React.useState("light");
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    if (!window.isTauri) {
      // browser dev: defaults only, nothing to sync
      setRaw({ theme: "system", locale: "ru" });
      return undefined;
    }
    let unmounted = false;
    const unlisten = [];
    (async function () {
      // listeners first — nothing between app start and load is missed
      unlisten.push(
        await listen("event-state", (event) => {
          if (!unmounted) setRaw(resolve(event.payload));
        }),
      );
      unlisten.push(
        await listen("event-theme", (event) => {
          if (!unmounted) setSystemTheme(event.payload);
        }),
      );
      try {
        const workspace = await Methods.workspace_get();
        if (!unmounted) setRaw(resolve(workspace));
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      unmounted = true;
      unlisten.forEach((fn) => fn());
    };
  }, []);

  // locale rides the workspace
  React.useEffect(() => {
    if (raw && i18next.language !== raw.locale) {
      i18next.changeLanguage(raw.locale);
    }
  }, [raw?.locale]);

  const toggleSidebar = () => {
    if (!raw) return;
    setRaw((prev) => {
      if (!prev) return prev;
      const next = { ...prev, sideBarCollapsed: !prev.sideBarCollapsed };
      Methods.workspace_set_side_bar(
        next.sideBarSize,
        next.sideBarCollapsed,
      ).then((w) => setRaw(resolve(w)));
      return next;
    });
  };

  const onSidebarHandlePointerDown = (event) => {
    if (!raw) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startSize = raw.sideBarSize;
    const collapsed = raw.sideBarCollapsed;
    let size = startSize;
    setDragging(true);

    const onPointerMove = (move) => {
      size = clamp(
        startSize + move.clientX - startX,
        SIDE_BAR_SIZE_MIN,
        SIDE_BAR_SIZE_MAX,
      );
      setRaw((prev) => ({ ...prev, sideBarSize: size }));
    };

    const onPointerUp = () => {
      handle.removeEventListener("pointermove", onPointerMove);
      handle.removeEventListener("pointerup", onPointerUp);
      setDragging(false);
      Methods.workspace_set_side_bar(size, collapsed).then((w) =>
        setRaw(resolve(w)),
      );
    };

    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerUp);
  };

  const onComposerHandlePointerDown = (event) => {
    if (!raw) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const startY = event.clientY;
    const startSize = raw.chatInputSize;
    let size = startSize;
    setDragging(true);

    const onPointerMove = (move) => {
      // dragging up grows the composer
      size = clamp(
        startSize + startY - move.clientY,
        CHAT_INPUT_SIZE_MIN,
        CHAT_INPUT_SIZE_MAX,
      );
      setRaw((prev) => ({ ...prev, chatInputSize: size }));
    };

    const onPointerUp = () => {
      handle.removeEventListener("pointermove", onPointerMove);
      handle.removeEventListener("pointerup", onPointerUp);
      setDragging(false);
      Methods.workspace_set_chat_input_size(size).then((w) =>
        setRaw(resolve(w)),
      );
    };

    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerUp);
  };

  return {
    ready: raw !== null,
    themeChoice: raw?.theme ?? "system",
    locale: raw?.locale ?? "ru",
    systemTheme,
    dragging,
    chatInputSize: raw?.chatInputSize ?? CHAT_INPUT_SIZE_DEFAULT,
    sideBarSize: raw?.sideBarSize ?? SIDE_BAR_SIZE_DEFAULT,
    sideBarCollapsed: raw?.sideBarCollapsed ?? false,
    toggleSidebar,
    onSidebarHandlePointerDown,
    onComposerHandlePointerDown,
  };
}

// mount point: one instance of the state for the whole app
export function WorkspaceProvider(props) {
  return (
    <WorkspaceContext.Provider value={useWorkspaceState()}>
      {props.children}
    </WorkspaceContext.Provider>
  );
}

// consumers read the ready-made state
export function useWorkspace() {
  return React.useContext(WorkspaceContext);
}

// Rust keeps values as sent; bounds are a UI shell policy
function clamp(value, min, max) {
  return Math.round(Math.min(max, Math.max(min, value)));
}

// snake_case from Rust to the camelCase mirror
function resolve(raw) {
  return {
    theme: raw.theme ?? "system",
    locale: raw.locale ?? "ru",
    windowWidth: raw.window_width ?? null,
    windowHeight: raw.window_height ?? null,
    chatInputSize: raw.chat_input_size ?? CHAT_INPUT_SIZE_DEFAULT,
    sideBarSize: raw.side_bar_size ?? SIDE_BAR_SIZE_DEFAULT,
    sideBarCollapsed: raw.side_bar_collapsed ?? false,
  };
}

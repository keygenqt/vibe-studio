/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import React from "react";
import { useLocation } from "react-router";

// Scroll positions are a pure UI detail — no Redux, no re-renders on scroll.
const scrollPositions = new Map();

export function useEffectPageScroll() {
  const { pathname } = useLocation();

  React.useLayoutEffect(() => {
    const el = document.getElementById("page_scroll");
    if (!el) return undefined;
    const handleScroll = () => scrollPositions.set(pathname, el.scrollTop);
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return scrollPositions.get(pathname) ?? 0;
}

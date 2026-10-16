/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import * as React from "react";

export function useEffectSingle(effect) {
  const wasCalled = React.useRef(false);
  React.useEffect(() => {
    if (wasCalled.current) return;
    wasCalled.current = true;
    effect();
  }, [effect]);
}

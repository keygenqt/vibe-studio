/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'theme']
 */
import { useTranslation } from "react-i18next";
import { IconButton, Tooltip } from "@mui/material";
import DarkMode from "@mui/icons-material/DarkMode";
import DesktopWindows from "@mui/icons-material/DesktopWindows";
import LightMode from "@mui/icons-material/LightMode";

import { Methods } from "../../../../modules";
import { useWorkspace } from "../../../../hooks";

export function ThemeAction() {
  const { t } = useTranslation();
  const { themeChoice } = useWorkspace();

  const cycleTheme = () => {
    const next =
      themeChoice === "light"
        ? "dark"
        : themeChoice === "dark"
          ? "system"
          : "light";
    // the answer comes back over event-state — no local mirror here
    Methods.workspace_set_theme(next);
  };

  return (
    <Tooltip title={t("main.t_theme")}>
      <IconButton
        onClick={cycleTheme}
        size="small"
        sx={{
          p: "2px",
        }}
      >
        {themeChoice === "light" ? (
          <LightMode sx={{ fontSize: 16 }} />
        ) : themeChoice === "dark" ? (
          <DarkMode sx={{ fontSize: 16 }} />
        ) : (
          <DesktopWindows sx={{ fontSize: 16 }} />
        )}
      </IconButton>
    </Tooltip>
  );
}

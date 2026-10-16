/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { createTheme } from "@mui/material/styles";
import { palette } from "./dark/palette";
import { typography } from "./elements/typography";
import { components } from "./elements/components";

export const ThemeDark = createTheme({
  palette: palette,
  typography: typography,
  components: components,
});

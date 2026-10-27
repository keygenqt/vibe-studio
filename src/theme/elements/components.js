/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['theme']
 */
export const components = {
  MuiToolbar: {
    styleOverrides: {
      root: {
        minHeight: '33px !important',
        paddingLeft: '6px !important',
        paddingRight: '6px !important',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        boxShadow: 'none !important',
        textTransform: 'none',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) =>
        theme.unstable_sx({
          background: 'transparent',
          '&:hover': {
            background: theme.palette.mode === 'dark' ? '#ffffff14' : '#0000000d',
          },
        }),
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 8,
      },
    },
  },
  MuiChip: { styleOverrides: { root: { borderRadius: 13 } } },
}

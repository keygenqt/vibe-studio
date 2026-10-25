/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from "prop-types";
import { Box, Stack } from "@mui/material";

import { AppData } from "../../../../constants/AppData";

export function RailView(props) {
  return (
    <Stack
      sx={{
        height: 1,
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          borderRadius: 2,
          backgroundColor: "background.paper",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
          p: 1,
          marginBottom: 1,
        }}
      >
        <Box
          component="img"
          src={AppData.images.app_icon}
          alt="Vibe Studio"
          sx={{ width: 30, height: 30 }}
        />
      </Box>

      <Stack
        spacing={0.5}
        sx={{
          flexGrow: 1,
          flexShrink: 0,
          borderRadius: 2,
          backgroundColor: "background.paper",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
          p: "6px",
        }}
      >
        {props.actions}
        <Box sx={{ flexGrow: 1 }} />
        {props.footer}
      </Stack>
    </Stack>
  );
}

RailView.propTypes = {
  actions: PropTypes.node,
  footer: PropTypes.node,
};

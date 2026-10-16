/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import * as React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";

export function BaseLayout(props) {
  return (
    <Box height={1} boxSizing={"border-box"} sx={{ p: "18px" }}>
      {props.children}
    </Box>
  );
}

BaseLayout.propTypes = { children: PropTypes.element.isRequired };

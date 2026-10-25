/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from "prop-types";
import { Box } from "@mui/material";

export function HandleView(props) {
  const vertical = props.orientation === "vertical";
  return (
    <Box
      onPointerDown={props.onPointerDown}
      sx={{
        width: vertical ? "2px" : 20,
        height: vertical ? 20 : "2px",
        flexShrink: 0,
        alignSelf: "center",
        borderRadius: 2,
        backgroundColor: "divider",
        cursor: vertical ? "col-resize" : "row-resize",
        "&:hover": { backgroundColor: "primary.main" },
      }}
    />
  );
}

HandleView.propTypes = {
  orientation: PropTypes.oneOf(["horizontal", "vertical"]).isRequired,
  onPointerDown: PropTypes.func,
};

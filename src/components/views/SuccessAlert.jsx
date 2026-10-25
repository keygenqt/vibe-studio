/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from "prop-types";
import * as React from "react";
import { Alert, Box, Collapse, Stack, useTheme } from "@mui/material";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";

export function SuccessAlert(props) {
  const theme = useTheme();

  React.useEffect(() => {
    if (!props.open) return undefined;
    const timer = setTimeout(
      props.onClose,
      theme.transitions.duration.autoHide,
    );
    return () => clearTimeout(timer);
  }, [props.open]);

  return (
    <Box>
      <Collapse in={props.open} unmountOnExit>
        <Stack spacing={2}>
          <Alert
            severity={"success"}
            icon={
              <CheckCircleRounded
                sx={(theme) => ({
                  color:
                    theme.palette.mode === "light"
                      ? theme.darken(theme.palette.success.light, 0.6)
                      : theme.lighten(theme.palette.success.light, 0.6),
                })}
              />
            }
            onClose={props.onClose}
            sx={{ borderRadius: 2 }}
          >
            {props.text}
          </Alert>
          <Box />
        </Stack>
      </Collapse>
    </Box>
  );
}

SuccessAlert.propTypes = {
  open: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

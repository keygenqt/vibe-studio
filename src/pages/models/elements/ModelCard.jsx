/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from "prop-types";
import { Avatar, Card, Stack, Switch, Typography } from "@mui/material";

// selectable model row: toggled by its checkbox
export function ModelCard(props) {
  return (
    <Card variant={"outlined"} sx={{ borderRadius: 2 }}>
      <Stack
        direction={"row"}
        spacing={2}
        alignItems={"center"}
        sx={{ py: 1, pr: 2, pl: 2 }}
      >
        <Avatar
          sx={{
            bgcolor: props.color ?? "secondary.main",
            color: "secondary.contrastText",
            fontWeight: 600,
          }}
        >
          {props.avatar}
        </Avatar>
        <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography fontWeight={600} noWrap sx={{ minWidth: 0 }}>
            {props.name}
          </Typography>
          <Typography variant={"body2"} noWrap>
            {props.description}
          </Typography>
        </Stack>
        <Switch
          checked={props.checked}
          disabled={Boolean(props.disabled)}
          onChange={props.onToggle}
          sx={{ flexShrink: 0 }}
        />
      </Stack>
    </Card>
  );
}

ModelCard.propTypes = {
  avatar: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  color: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onToggle: PropTypes.func,
};

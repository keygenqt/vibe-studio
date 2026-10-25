/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from "prop-types";
import { Card, CardActionArea, Stack, Typography } from "@mui/material";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";

// model row on the provider page, styled after the providers page cards
export function ModelCard(props) {
  return (
    <Card variant={"outlined"} sx={{ borderRadius: 2 }}>
      <CardActionArea onClick={props.onClick}>
        <Stack
          direction={"row"}
          spacing={2}
          alignItems={"center"}
          sx={{ p: 2 }}
        >
          <Typography noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
            {props.name}
          </Typography>
          <ChevronRightOutlined color={"action"} />
        </Stack>
      </CardActionArea>
    </Card>
  );
}

ModelCard.propTypes = {
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

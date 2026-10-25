/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from "prop-types";
import * as React from "react";
import { useTheme } from "@mui/material";

import { LoadingState } from "./LoadingState";

// unified page gate: a load that starts without data shows the loader
// for at least the page loading duration; cached data renders instantly
export function WaitState(props) {
  const theme = useTheme();
  // data at mount: no minimum phase; without data: the timer runs it out
  const [minDone, setMinDone] = React.useState(props.ready);

  React.useEffect(() => {
    if (minDone) return undefined;
    const timer = setTimeout(
      () => setMinDone(true),
      theme.transitions.duration.pageLoading,
    );
    return () => clearTimeout(timer);
  }, []);

  if (props.ready && minDone) return props.children;
  return <LoadingState />;
}

WaitState.propTypes = {
  ready: PropTypes.bool.isRequired,
  children: PropTypes.node,
};
